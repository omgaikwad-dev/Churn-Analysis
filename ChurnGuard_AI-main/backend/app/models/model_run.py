from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    
    model_type = Column(String(80), nullable=False)  # Logistic Regression, Random Forest, Gradient Boosting
    model_version = Column(String(50), nullable=False, unique=True, index=True)
    artifact_path = Column(String(500), nullable=False)
    artifact_checksum = Column(String(64), nullable=True)
    
    training_status = Column(String(50), nullable=False)  # completed, failed, training
    is_active = Column(Boolean, default=False, nullable=False)  # Currently approved active model
    
    evaluation_metrics = Column(JSON, nullable=False)  # {accuracy, precision, recall, f1, roc_auc, confusion_matrix}
    feature_schema = Column(JSON, nullable=False)  # feature list, scalers, encodings
    training_config = Column(JSON, nullable=True)  # hyperparameters, test_split, seed
    error_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="model_runs")
    dataset = relationship("Dataset", back_populates="model_runs")
    predictions = relationship("Prediction", back_populates="model_run")
