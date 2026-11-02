from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    row_count = Column(Integer, nullable=False)
    column_count = Column(Integer, nullable=False)
    target_column = Column(String(100), nullable=True)
    validation_status = Column(String(50), nullable=False)  # valid, warning, invalid
    column_metadata = Column(JSON, nullable=True)  # {columns: [...], dtypes: {...}}
    validation_summary = Column(JSON, nullable=True)  # {missing_values: {}, target_distribution: {}, ...}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="datasets")
    model_runs = relationship("ModelRun", back_populates="dataset")
