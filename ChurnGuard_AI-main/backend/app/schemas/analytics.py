from typing import Any
from pydantic import BaseModel

class RiskDistribution(BaseModel):
    low_risk: int
    medium_risk: int
    high_risk: int

class ChurnDistribution(BaseModel):
    retained: int
    churned: int

class TrendPoint(BaseModel):
    date: str
    total_predictions: int
    avg_churn_probability: float
    high_risk_count: int

class AnalyticsOverview(BaseModel):
    total_customers: int
    total_predictions: int
    high_risk_customers: int
    avg_churn_probability: float
    risk_distribution: RiskDistribution
    churn_distribution: ChurnDistribution
    recent_trends: list[TrendPoint]
    active_model_version: str | None
    active_model_accuracy: float | None
