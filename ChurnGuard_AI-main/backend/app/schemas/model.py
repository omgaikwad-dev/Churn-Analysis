from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, ConfigDict

class ModelTrainRequest(BaseModel):
    dataset_id: int | None = Field(None, description="Optional uploaded dataset ID; defaults to verified Telco reference")
    model_type: str = Field("Logistic Regression", description="Model algorithm: Logistic Regression, Random Forest, or Gradient Boosting")
    test_size: float = Field(0.20, ge=0.1, le=0.4)
    random_state: int = Field(42)

class EvaluationMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: list[list[int]]
    train_samples: int
    test_samples: int
    class_distribution: dict[str, int]
    feature_importance: dict[str, float]

class ModelResponse(BaseModel):
    id: int
    model_type: str
    model_version: str
    training_status: str
    is_active: bool
    dataset_id: int | None
    evaluation_metrics: EvaluationMetrics | dict[str, Any]
    feature_schema: dict[str, Any]
    training_config: dict[str, Any] | None
    error_summary: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
