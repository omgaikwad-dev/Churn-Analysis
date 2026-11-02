from typing import Any
from pydantic import BaseModel

class FeatureDriftDetail(BaseModel):
    feature: str
    baseline_mean: float
    baseline_std: float
    current_mean: float
    drift_detected: bool
    z_score_distance: float

class DriftReportResponse(BaseModel):
    status: str  # no_data, healthy, warning, drift_detected
    drift_detected: bool
    total_samples_analyzed: int
    baseline_dataset_name: str
    threshold_sigma: float
    features_drifted: list[str]
    feature_details: list[FeatureDriftDetail]
    message: str
