import io
import csv
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.customer import Customer
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/exports", tags=["Exports"])

@router.get("/predictions")
def export_predictions_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Exports authenticated user's prediction history as a downloadable CSV."""
    predictions = (
        db.query(Prediction)
        .filter(Prediction.owner_id == current_user.id)
        .order_by(Prediction.prediction_timestamp.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "prediction_id",
        "customer_identifier",
        "model_version",
        "tenure",
        "monthly_charges",
        "contract_type",
        "support_calls",
        "predicted_class",
        "churn_probability",
        "risk_category",
        "timestamp",
    ])

    for p in predictions:
        data = p.input_data or {}
        writer.writerow([
            p.id,
            data.get("customer_identifier", ""),
            p.model_version,
            data.get("tenure", ""),
            data.get("monthly_charges", ""),
            data.get("contract_type", ""),
            data.get("support_calls", ""),
            p.predicted_class,
            p.churn_probability,
            p.risk_category,
            p.prediction_timestamp.isoformat(),
        ])

    csv_data = output.getvalue()
    filename = f"churnguard_predictions_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

@router.get("/customers")
def export_customers_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Exports authenticated user's customers as a downloadable CSV."""
    customers = (
        db.query(Customer)
        .filter(Customer.owner_id == current_user.id)
        .order_by(Customer.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id",
        "customer_identifier",
        "tenure",
        "monthly_charges",
        "contract_type",
        "support_calls",
        "total_charges",
        "payment_method",
        "latest_predicted_risk",
        "latest_predicted_prob",
        "churn_label",
        "created_at",
    ])

    for c in customers:
        writer.writerow([
            c.id,
            c.customer_identifier or "",
            c.tenure,
            c.monthly_charges,
            c.contract_type,
            c.support_calls,
            c.total_charges or "",
            c.payment_method or "",
            c.latest_predicted_risk or "",
            c.latest_predicted_prob or "",
            c.churn_label if c.churn_label is not None else "",
            c.created_at.isoformat(),
        ])

    csv_data = output.getvalue()
    filename = f"churnguard_customers_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
