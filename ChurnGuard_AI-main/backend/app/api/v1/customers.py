import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.user import User
from app.models.customer import Customer
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse,
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    search: str | None = Query(None),
    risk: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves paginated customer list for the authenticated user."""
    query = db.query(Customer).filter(Customer.owner_id == current_user.id)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.customer_identifier.ilike(search_filter),
                Customer.payment_method.ilike(search_filter),
            )
        )

    if risk:
        query = query.filter(Customer.latest_predicted_risk == risk)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = (
        query.order_by(Customer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return CustomerListResponse(
        items=[CustomerResponse.model_validate(c) for c in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a new customer record."""
    customer = Customer(
        owner_id=current_user.id,
        customer_identifier=payload.customer_identifier or f"CUST-{1000 + db.query(Customer).count()}",
        tenure=payload.tenure,
        monthly_charges=payload.monthly_charges,
        contract_type=payload.contract_type,
        support_calls=payload.support_calls,
        total_charges=payload.total_charges,
        internet_service=payload.internet_service,
        payment_method=payload.payment_method,
        churn_label=payload.churn_label,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves single customer record owned by user."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.owner_id == current_user.id)
        .first()
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer record not found.",
        )
    return CustomerResponse.model_validate(customer)

@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates permitted customer fields."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.owner_id == current_user.id)
        .first()
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer record not found.",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes customer record owned by user."""
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.owner_id == current_user.id)
        .first()
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer record not found.",
        )
    db.delete(customer)
    db.commit()
    return None
