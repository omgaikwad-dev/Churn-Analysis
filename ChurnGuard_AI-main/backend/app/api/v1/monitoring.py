import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.model_run import ModelRun
from app.schemas.monitoring import DriftReportResponse, FeatureDriftDetail
from app.ml.reference_data import get_or_create_reference_dataset, map_dataframe_to_features
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

DRIFT_SIGMA_THRESHOLD = 3.0

@router.get("/drift", response_model=DriftReportResponse)
def get_data_drift_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Measures input data drift by comparing recent prediction features to training baseline."""
    # 1. Baseline stats from Telco reference dataset
    df_ref = get_or_create_reference_dataset()
    X_ref, _, feature_names = map_dataframe_to_features(df_ref)
    
    baseline_stats = {}
    for idx, f in enumerate(feature_names):
        col_vals = X_ref[:, idx]
        mean = float(np.mean(col_vals))
        std = float(np.std(col_vals))
        baseline_stats[f] = (mean, std if std > 0 else 1.0)

    # 2. Recent predictions window
    recent_preds = (
        db.query(Prediction)
        .filter(Prediction.owner_id == current_user.id)
        .order_by(Prediction.prediction_timestamp.desc())
        .limit(100)
        .all()
    )

    if len(recent_preds) < 5:
        return DriftReportResponse(
            status="insufficient_data",
            drift_detected=False,
            total_samples_analyzed=len(recent_preds),
            baseline_dataset_name="IBM Telco Reference (2,500 samples)",
            threshold_sigma=DRIFT_SIGMA_THRESHOLD,
            features_drifted=[],
            feature_details=[],
            message="Insufficient prediction traffic (minimum 5 predictions required to assess drift).",
        )

    # Extract recent features
    feature_samples = {f: [] for f in feature_names}
    for p in recent_preds:
        data = p.input_data or {}
        for f in feature_names:
            if f in data:
                try:
                    feature_samples[f].append(float(data[f]))
                except (ValueError, TypeError):
                    pass

    drifted_features = []
    details = []

    for f in feature_names:
        vals = feature_samples[f]
        b_mean, b_std = baseline_stats[f]
        if vals:
            c_mean = float(np.mean(vals))
            z_dist = abs(c_mean - b_mean) / b_std
            is_drift = z_dist >= DRIFT_SIGMA_THRESHOLD
            if is_drift:
                drifted_features.append(f)
            details.append(
                FeatureDriftDetail(
                    feature=f,
                    baseline_mean=round(b_mean, 2),
                    baseline_std=round(b_std, 2),
                    current_mean=round(c_mean, 2),
                    drift_detected=is_drift,
                    z_score_distance=round(z_dist, 2),
                )
            )

    has_drift = len(drifted_features) > 0
    status_str = "drift_detected" if has_drift else "healthy"
    msg = (
        f"Significant feature drift detected on: {', '.join(drifted_features)}."
        if has_drift
        else "No statistical feature drift detected; inputs conform to baseline training distribution."
    )

    return DriftReportResponse(
        status=status_str,
        drift_detected=has_drift,
        total_samples_analyzed=len(recent_preds),
        baseline_dataset_name="IBM Telco Reference (2,500 samples)",
        threshold_sigma=DRIFT_SIGMA_THRESHOLD,
        features_drifted=drifted_features,
        feature_details=details,
        message=msg,
    )

@router.get("/health")
def monitoring_health():
    """Health check for monitoring service."""
    return {"status": "healthy", "service": "model_drift_monitor"}
