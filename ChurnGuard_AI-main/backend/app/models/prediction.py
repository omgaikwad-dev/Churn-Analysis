from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    model_run_id = Column(Integer, ForeignKey("model_runs.id", ondelete="SET NULL"), nullable=True)
    
    model_version = Column(String(50), nullable=False)
    predicted_class = Column(Integer, nullable=False)  # 0: Low Risk / Retained, 1: High Risk / Churned
    churn_probability = Column(Float, nullable=False)
    risk_category = Column(String(20), nullable=False)  # Low Risk, Medium Risk, High Risk
    
    input_data = Column(JSON, nullable=False)  # Snapshot of feature values tested
    feature_importance = Column(JSON, nullable=True)  # Snapshot of feature weights for this prediction
    
    # Ground truth if recorded later
    actual_label = Column(Integer, nullable=True)
    prediction_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    owner = relationship("User", back_populates="predictions")
    customer = relationship("Customer", back_populates="predictions")
    model_run = relationship("ModelRun", back_populates="predictions")
