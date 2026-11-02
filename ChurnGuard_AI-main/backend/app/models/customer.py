from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_identifier = Column(String(100), nullable=True, index=True)
    
    # Core Churn Features
    tenure = Column(Float, nullable=False)
    monthly_charges = Column(Float, nullable=False)
    contract_type = Column(Integer, nullable=False)  # 0: Month-to-Month, 1: One Year, 2: Two Year
    support_calls = Column(Integer, nullable=False)  # 0 to 50
    
    # Optional Extended Profile Fields (from IBM Telco format)
    total_charges = Column(Float, nullable=True)
    internet_service = Column(String(50), nullable=True)  # DSL, Fiber optic, No
    payment_method = Column(String(80), nullable=True)
    
    # Ground Truth Label when known (0: Retained, 1: Churned, None: Unknown)
    churn_label = Column(Integer, nullable=True)
    
    # Latest Prediction Cache
    latest_predicted_risk = Column(String(20), nullable=True)
    latest_predicted_prob = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="customers")
    predictions = relationship("Prediction", back_populates="customer", cascade="all, delete-orphan")
