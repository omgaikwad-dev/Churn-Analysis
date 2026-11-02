from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, ConfigDict

class SinglePredictionRequest(BaseModel):
    customer_id: int | None = Field(None, description="Optional existing Customer ID to link")
    customer_identifier: str | None = None
    tenure: float = Field(..., ge=0, le=120)
    monthly_charges: float = Field(..., ge=0, le=1000)
    contract_type: int = Field(..., ge=0, le=2)
    support_calls: int = Field(..., ge=0, le=50)

class SinglePredictionResponse(BaseModel):
    id: int | None = None
    customer_id: int | None = None
    model_version: str
    predicted_class: int
    churn_probability: float
    risk_category: str
    feature_importance: dict[str, float]
    prediction_timestamp: datetime
class BatchPredictionRequest(BaseModel):
    dataset_id: int = Field(..., description="ID of uploaded dataset to process")

class BatchPredictionItem(BaseModel):
    row_index: int
    customer_identifier: str | None = None
    predicted_class: int
    churn_probability: float
    risk_category: str
    tenure: float
    monthly_charges: float
    contract_type: int
    support_calls: int

class BatchPredictionResponse(BaseModel):
    total_processed: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    model_version: str
    items: list[BatchPredictionItem]

class PredictionHistoryItem(BaseModel):
    id: int
    customer_id: int | None
    customer_identifier: str | None
    model_version: str
    predicted_class: int
    churn_probability: float
    risk_category: str
    input_data: dict[str, Any]
    feature_importance: dict[str, float] | None
    prediction_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class PredictionHistoryResponse(BaseModel):
    items: list[PredictionHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int
