from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CustomerBase(BaseModel):
    customer_identifier: str | None = None
    tenure: float = Field(..., ge=0, le=120, description="Customer tenure in months")
    monthly_charges: float = Field(..., ge=0, le=1000, description="Monthly recurring bill")
    contract_type: int = Field(..., ge=0, le=2, description="0: Month-to-Month, 1: One Year, 2: Two Year")
    support_calls: int = Field(..., ge=0, le=50, description="Support calls count")
    total_charges: float | None = Field(None, ge=0)
    internet_service: str | None = None
    payment_method: str | None = None
    churn_label: int | None = Field(None, ge=0, le=1, description="Known ground-truth: 0=retained, 1=churned")

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_identifier: str | None = None
    tenure: float | None = Field(None, ge=0, le=120)
    monthly_charges: float | None = Field(None, ge=0, le=1000)
    contract_type: int | None = Field(None, ge=0, le=2)
    support_calls: int | None = Field(None, ge=0, le=50)
    total_charges: float | None = None
    internet_service: str | None = None
    payment_method: str | None = None
    churn_label: int | None = None

class CustomerResponse(CustomerBase):
    id: int
    owner_id: int
    latest_predicted_risk: str | None
    latest_predicted_prob: float | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
