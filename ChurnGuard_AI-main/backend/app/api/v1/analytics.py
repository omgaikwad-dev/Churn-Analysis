from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.user import User
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.models.model_run import ModelRun
from app.schemas.analytics import (
    AnalyticsOverview,
    RiskDistribution,
    ChurnDistribution,
    TrendPoint,
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculates live analytics metrics for user's customers and predictions."""
    total_customers = db.query(Customer).filter(Customer.owner_id == current_user.id).count()
    
    predictions_query = db.query(Prediction).filter(Prediction.owner_id == current_user.id)
    total_predictions = predictions_query.count()

    # Risk counts
    low_risk = predictions_query.filter(Prediction.risk_category == "Low Risk").count()
    med_risk = predictions_query.filter(Prediction.risk_category == "Medium Risk").count()
    high_risk = predictions_query.filter(Prediction.risk_category == "High Risk").count()

    # Churn distribution
    retained_count = predictions_query.filter(Prediction.predicted_class == 0).count()
    churned_count = predictions_query.filter(Prediction.predicted_class == 1).count()

    # Average probability
    avg_prob_res = db.query(func.avg(Prediction.churn_probability)).filter(Prediction.owner_id == current_user.id).scalar()
    avg_churn_prob = round(float(avg_prob_res), 4) if avg_prob_res is not None else 0.0

    # Active model
    active_model = (
        db.query(ModelRun)
        .filter(ModelRun.owner_id == current_user.id, ModelRun.is_active == True)
        .first()
    )
    active_version = active_model.model_version if active_model else None
    active_accuracy = (
        active_model.evaluation_metrics.get("accuracy")
        if active_model and isinstance(active_model.evaluation_metrics, dict)
        else None
    )

    # 7-day trend
    now = datetime.now(timezone.utc)
    trends = []
    for day_offset in range(6, -1, -1):
        target_day = (now - timedelta(days=day_offset)).date()
        day_preds = (
            db.query(Prediction)
            .filter(
                Prediction.owner_id == current_user.id,
                func.date(Prediction.prediction_timestamp) == target_day.isoformat(),
            )
            .all()
        )
        day_total = len(day_preds)
        day_high = sum(1 for p in day_preds if p.risk_category == "High Risk")
        day_avg = (
            round(sum(p.churn_probability for p in day_preds) / day_total, 4)
            if day_total > 0
            else 0.0
        )
        trends.append(
            TrendPoint(
                date=target_day.strftime("%b %d"),
                total_predictions=day_total,
                avg_churn_probability=day_avg,
                high_risk_count=day_high,
            )
        )

    return AnalyticsOverview(
        total_customers=total_customers,
        total_predictions=total_predictions,
        high_risk_customers=high_risk,
        avg_churn_probability=avg_churn_prob,
        risk_distribution=RiskDistribution(
            low_risk=low_risk, medium_risk=med_risk, high_risk=high_risk
        ),
        churn_distribution=ChurnDistribution(
            retained=retained_count, churned=churned_count
        ),
        recent_trends=trends,
        active_model_version=active_version,
        active_model_accuracy=active_accuracy,
    )
