import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.models.model_run import ModelRun
from app.schemas.model import ModelTrainRequest, ModelResponse
from app.ml.pipeline import train_and_evaluate
from app.ml.reference_data import get_or_create_reference_dataset, map_dataframe_to_features
from app.ml.registry import save_model_artifact
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/models", tags=["Models"])

@router.post("/train", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
def train_model(
    payload: ModelTrainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trains a new churn model using real labeled data (uploaded dataset or Telco reference)."""
    # 1. Load Data
    if payload.dataset_id:
        dataset = (
            db.query(Dataset)
            .filter(Dataset.id == payload.dataset_id, Dataset.owner_id == current_user.id)
            .first()
        )
        if not dataset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")
        df = pd.read_csv(dataset.storage_path)
    else:
        df = get_or_create_reference_dataset()

    X, y, feature_names = map_dataframe_to_features(df)
    if y is None or len(set(y)) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset does not contain valid binary Churn target labels (needs both retained and churned classes).",
        )

    # 2. Train and Evaluate
    try:
        pipeline, metrics = train_and_evaluate(
            X,
            y,
            model_type=payload.model_type,
            test_size=payload.test_size,
            random_state=payload.random_state,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {exc}",
        )

    # 3. Save Artifact with provenance
    version = f"v_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    metadata = {
        "model_type": payload.model_type,
        "feature_names": feature_names,
        "metrics": metrics,
        "dataset_rows": len(df),
    }
    artifact_path, checksum = save_model_artifact(pipeline, version, metadata)

    # 4. Deactivate old active models and activate new one
    db.query(ModelRun).filter(ModelRun.owner_id == current_user.id, ModelRun.is_active == True).update(
        {"is_active": False}
    )

    model_run = ModelRun(
        owner_id=current_user.id,
        dataset_id=payload.dataset_id,
        model_type=payload.model_type,
        model_version=version,
        artifact_path=str(artifact_path),
        artifact_checksum=checksum,
        training_status="completed",
        is_active=True,
        evaluation_metrics=metrics,
        feature_schema={"features": feature_names, "type": "standard_scaled"},
        training_config={
            "test_size": payload.test_size,
            "random_state": payload.random_state,
        },
    )

    db.add(model_run)
    db.commit()
    db.refresh(model_run)
    return ModelResponse.model_validate(model_run)

@router.get("", response_model=list[ModelResponse])
def list_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all models trained by the authenticated user."""
    models = (
        db.query(ModelRun)
        .filter(ModelRun.owner_id == current_user.id)
        .order_by(ModelRun.created_at.desc())
        .all()
    )
    return [ModelResponse.model_validate(m) for m in models]

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves specific model run details."""
    model_run = (
        db.query(ModelRun)
        .filter(ModelRun.id == model_id, ModelRun.owner_id == current_user.id)
        .first()
    )
    if not model_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model run not found.")
    return ModelResponse.model_validate(model_run)

@router.post("/{model_id}/approve", response_model=ModelResponse)
def approve_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Promotes/approves model as active production model."""
    model_run = (
        db.query(ModelRun)
        .filter(ModelRun.id == model_id, ModelRun.owner_id == current_user.id)
        .first()
    )
    if not model_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model run not found.")

    db.query(ModelRun).filter(ModelRun.owner_id == current_user.id).update({"is_active": False})
    model_run.is_active = True
    db.commit()
    db.refresh(model_run)
    return ModelResponse.model_validate(model_run)

@router.post("/{model_id}/rollback", response_model=ModelResponse)
def rollback_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rolls back to the specified model version."""
    model_run = (
        db.query(ModelRun)
        .filter(ModelRun.id == model_id, ModelRun.owner_id == current_user.id)
        .first()
    )
    if not model_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model run not found.")

    db.query(ModelRun).filter(ModelRun.owner_id == current_user.id).update({"is_active": False})
    model_run.is_active = True
    db.commit()
    db.refresh(model_run)
    return ModelResponse.model_validate(model_run)
