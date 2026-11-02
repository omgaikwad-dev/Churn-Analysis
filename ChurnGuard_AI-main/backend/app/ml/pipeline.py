from typing import Any
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

FEATURE_NAMES = ["tenure", "monthly_charges", "contract_type", "support_calls"]

def get_classifier(model_type: str, random_state: int = 42) -> Any:
    """Returns an un-fitted classifier algorithm based on model_type."""
    clean_type = model_type.strip().lower()
    if "random forest" in clean_type or "rf" in clean_type:
        return RandomForestClassifier(n_estimators=100, max_depth=6, random_state=random_state)
    elif "gradient" in clean_type or "gb" in clean_type or "boosting" in clean_type:
        return GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=random_state)
    else:
        return LogisticRegression(max_iter=1000, random_state=random_state)

def build_pipeline(model_type: str = "Logistic Regression", random_state: int = 42) -> Pipeline:
    """Builds a scikit-learn Pipeline with StandardScaler and the chosen classifier."""
    clf = get_classifier(model_type, random_state=random_state)
    return Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", clf),
    ])

def train_and_evaluate(
    X: np.ndarray,
    y: np.ndarray,
    model_type: str = "Logistic Regression",
    test_size: float = 0.20,
    random_state: int = 42,
) -> tuple[Pipeline, dict[str, Any]]:
    """Trains the model on stratified train split and computes real test evaluation metrics."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    pipeline = build_pipeline(model_type=model_type, random_state=random_state)
    pipeline.fit(X_train, y_train)

    # Test predictions
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    # Metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    try:
        auc = float(roc_auc_score(y_test, y_prob))
    except Exception:
        auc = 0.5

    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature Importance
    feature_importance = extract_feature_importance(pipeline)

    class_dist = {
        "retained": int((y == 0).sum()),
        "churned": int((y == 1).sum()),
    }

    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": cm,
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "class_distribution": class_dist,
        "feature_importance": feature_importance,
    }

    return pipeline, metrics

def extract_feature_importance(pipeline: Pipeline) -> dict[str, float]:
    """Computes normalized feature importance across model types."""
    clf = pipeline.named_steps.get("classifier")
    if hasattr(clf, "coef_"):
        raw_imp = np.abs(clf.coef_[0])
    elif hasattr(clf, "feature_importances_"):
        raw_imp = clf.feature_importances_
    else:
        raw_imp = np.ones(len(FEATURE_NAMES))

    total = float(raw_imp.sum())
    norm_imp = raw_imp / total if total > 0 else np.full(len(FEATURE_NAMES), 0.25)
    return {f: round(float(v), 4) for f, v in zip(FEATURE_NAMES, norm_imp)}

def categorize_risk(churn_probability: float) -> str:
    """Configurable operational risk categories:
    Low Risk: < 0.30
    Medium Risk: 0.30 to < 0.70
    High Risk: >= 0.70
    """
    if churn_probability < 0.30:
        return "Low Risk"
    elif churn_probability < 0.70:
        return "Medium Risk"
    else:
        return "High Risk"
