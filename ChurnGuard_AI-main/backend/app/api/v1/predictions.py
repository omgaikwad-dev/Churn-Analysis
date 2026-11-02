import math
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import numpy as np
import pandas as pd
from app.db.session import get_db
from app.models.user import User
from app.models.customer import Customer
from app.models.model_run import ModelRun
from app.models.prediction import Prediction
from app.schemas.prediction import (
    SinglePredictionRequest,
    SinglePredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    BatchPredictionItem,
    PredictionHistoryResponse,
    PredictionHistoryItem,
)
from app.ml.pipeline import categorize_risk, extract_feature_importance, build_pipeline, train_and_evaluate
from app.ml.reference_data import get_or_create_reference_dataset, map_dataframe_to_features
from app.ml.registry import load_model_artifact, save_model_artifact
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions"])

def get_or_init_active_model(user_id: int, db: Session):
    """Retrieves the active ModelRun for the user. If none exists, trains an initial model."""
    active_run = (
        db.query(ModelRun)
        .filter(ModelRun.owner_id == user_id, ModelRun.is_active == True)
        .first()
    )
    if not active_run:
        # Check any completed model
        active_run = (
            db.query(ModelRun)
            .filter(ModelRun.owner_id == user_id)
            .order_by(ModelRun.created_at.desc())
            .first()
        )

    if not active_run:
        # Auto-train default calibrated baseline model on Telco reference data
        df = get_or_create_reference_dataset()
        X, y, feature_names = map_dataframe_to_features(df)
        pipeline, metrics = train_and_evaluate(X, y, model_type="Logistic Regression")
        version = f"v_default_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        artifact_path, checksum = save_model_artifact(
            pipeline, version, {"model_type": "Logistic Regression", "metrics": metrics}
        )

        active_run = ModelRun(
            owner_id=user_id,
            model_type="Logistic Regression",
            model_version=version,
            artifact_path=str(artifact_path),
            artifact_checksum=checksum,
            training_status="completed",
            is_active=True,
            evaluation_metrics=metrics,
            feature_schema={"features": feature_names},
        )
        db.add(active_run)
        db.commit()
        db.refresh(active_run)

    # Load artifact
    try:
        model = load_model_artifact(active_run.artifact_path, active_run.artifact_checksum)
    except Exception:
        # Re-build and re-save if artifact was moved
        df = get_or_create_reference_dataset()
        X, y, _ = map_dataframe_to_features(df)
        model, _ = train_and_evaluate(X, y, model_type=active_run.model_type)
        save_model_artifact(model, active_run.model_version, {})

    return active_run, model

@router.post("/single", response_model=SinglePredictionResponse)
def predict_single(
    payload: SinglePredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generates churn prediction for a single customer and logs it."""
    model_run, model = get_or_init_active_model(current_user.id, db)

    input_vector = np.array(
        [[payload.tenure, payload.monthly_charges, payload.contract_type, payload.support_calls]],
        dtype=float,
    )
    churn_prob = float(model.predict_proba(input_vector)[0][1])
    predicted_class = 1 if churn_prob >= 0.50 else 0
    risk_cat = categorize_risk(churn_prob)
    importance = extract_feature_importance(model)

    now = datetime.now(timezone.utc)
    input_snapshot = {
        "tenure": payload.tenure,
        "monthly_charges": payload.monthly_charges,
        "contract_type": payload.contract_type,
        "support_calls": payload.support_calls,
        "customer_identifier": payload.customer_identifier,
    }

    prediction = Prediction(
        owner_id=current_user.id,
        customer_id=payload.customer_id,
        model_run_id=model_run.id,
        model_version=model_run.model_version,
        predicted_class=predicted_class,
        churn_probability=round(churn_prob, 4),
        risk_category=risk_cat,
        input_data=input_snapshot,
        feature_importance=importance,
        prediction_timestamp=now,
    )
    db.add(prediction)

    # Update customer record if linked
    if payload.customer_id:
        cust = db.query(Customer).filter(Customer.id == payload.customer_id, Customer.owner_id == current_user.id).first()
        if cust:
            cust.latest_predicted_risk = risk_cat
            cust.latest_predicted_prob = round(churn_prob, 4)

    db.commit()
    db.refresh(prediction)

    return SinglePredictionResponse(
        id=prediction.id,
        customer_id=prediction.customer_id,
        model_version=model_run.model_version,
        predicted_class=predicted_class,
        churn_probability=round(churn_prob, 4),
        risk_category=risk_cat,
        feature_importance=importance,
        prediction_timestamp=now,
    )

@router.post("/batch", response_model=BatchPredictionResponse)
def predict_batch(
    payload: BatchPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Processes batch customer churn predictions from dataset."""
    from app.models.dataset import Dataset

    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == payload.dataset_id, Dataset.owner_id == current_user.id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    df = pd.read_csv(dataset.storage_path)
    X, _, _ = map_dataframe_to_features(df)

    model_run, model = get_or_init_active_model(current_user.id, db)
    probs = model.predict_proba(X)[:, 1]

    items = []
    high_count, med_count, low_count = 0, 0, 0
    now = datetime.now(timezone.utc)

    id_col = None
    for c in df.columns:
        if c.lower() in ("customerid", "id", "customer_id", "external_id"):
            id_col = c
            break

    db_preds = []
    for idx, (row, p) in enumerate(zip(X, probs)):
        prob_val = round(float(p), 4)
        pred_class = 1 if prob_val >= 0.50 else 0
        risk = categorize_risk(prob_val)

        if risk == "High Risk":
            high_count += 1
        elif risk == "Medium Risk":
            med_count += 1
        else:
            low_count += 1

        cust_ident = str(df.iloc[idx][id_col]) if id_col else f"ROW-{idx+1}"

        item = BatchPredictionItem(
            row_index=idx,
            customer_identifier=cust_ident,
            predicted_class=pred_class,
            churn_probability=prob_val,
            risk_category=risk,
            tenure=float(row[0]),
            monthly_charges=float(row[1]),
            contract_type=int(row[2]),
            support_calls=int(row[3]),
        )
        items.append(item)

        # Batch log to DB (up to 500 rows to keep performant)
        if idx < 500:
            db_preds.append(
                Prediction(
                    owner_id=current_user.id,
                    model_run_id=model_run.id,
                    model_version=model_run.model_version,
                    predicted_class=pred_class,
                    churn_probability=prob_val,
                    risk_category=risk,
                    input_data={
                        "tenure": float(row[0]),
                        "monthly_charges": float(row[1]),
                        "contract_type": int(row[2]),
                        "support_calls": int(row[3]),
                        "customer_identifier": cust_ident,
                    },
                    prediction_timestamp=now,
                )
            )

    if db_preds:
        db.bulk_save_objects(db_preds)
        db.commit()

    return BatchPredictionResponse(
        total_processed=len(items),
        high_risk_count=high_count,
        medium_risk_count=med_count,
        low_risk_count=low_count,
        model_version=model_run.model_version,
        items=items[:100],  # Return first 100 for display
    )

@router.get("", response_model=PredictionHistoryResponse)
def list_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves paginated prediction audit history."""
    query = db.query(Prediction).filter(Prediction.owner_id == current_user.id)
    if risk:
        query = query.filter(Prediction.risk_category == risk)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = (
        query.order_by(Prediction.prediction_timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    history_items = []
    for p in items:
        cid = p.input_data.get("customer_identifier") if p.input_data else None
        history_items.append(
            PredictionHistoryItem(
                id=p.id,
                customer_id=p.customer_id,
                customer_identifier=cid,
                model_version=p.model_version,
                predicted_class=p.predicted_class,
                churn_probability=p.churn_probability,
                risk_category=p.risk_category,
                input_data=p.input_data or {},
                feature_importance=p.feature_importance,
                prediction_timestamp=p.prediction_timestamp,
            )
        )

    return PredictionHistoryResponse(
        items=history_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
