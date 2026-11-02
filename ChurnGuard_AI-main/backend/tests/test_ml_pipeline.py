import numpy as np
from app.ml.pipeline import train_and_evaluate, categorize_risk, extract_feature_importance
from app.ml.reference_data import get_or_create_reference_dataset, map_dataframe_to_features
from app.ml.registry import save_model_artifact, load_model_artifact

def test_ml_pipeline_training_and_evaluation():
    df = get_or_create_reference_dataset()
    assert len(df) >= 1000
    assert "Churn" in df.columns

    X, y, feature_names = map_dataframe_to_features(df)
    assert X.shape[1] == 4
    assert y is not None
    assert len(y) == len(X)

    pipeline, metrics = train_and_evaluate(X, y, model_type="Logistic Regression", test_size=0.20)
    
    # Check evaluation metrics
    assert 0.65 <= metrics["accuracy"] <= 0.99
    assert 0.0 <= metrics["precision"] <= 1.0
    assert 0.0 <= metrics["recall"] <= 1.0
    assert 0.0 <= metrics["f1_score"] <= 1.0
    assert 0.50 <= metrics["roc_auc"] <= 1.0
    assert len(metrics["confusion_matrix"]) == 2
    assert metrics["train_samples"] + metrics["test_samples"] == len(X)

    # Feature importance
    feat_imp = metrics["feature_importance"]
    assert len(feat_imp) == 4
    assert abs(sum(feat_imp.values()) - 1.0) < 0.01

    # Persistence and Registry
    artifact_path, checksum = save_model_artifact(pipeline, "v_test_model", {"metrics": metrics})
    assert artifact_path.exists()
    assert len(checksum) == 64

    loaded_model = load_model_artifact(artifact_path, checksum)
    assert hasattr(loaded_model, "predict_proba")

    # Clean up test artifact
    artifact_path.unlink(missing_ok=True)
    meta_path = artifact_path.with_suffix(".json")
    meta_path.unlink(missing_ok=True)

def test_risk_categorization():
    assert categorize_risk(0.15) == "Low Risk"
    assert categorize_risk(0.29) == "Low Risk"
    assert categorize_risk(0.30) == "Medium Risk"
    assert categorize_risk(0.69) == "Medium Risk"
    assert categorize_risk(0.70) == "High Risk"
    assert categorize_risk(0.95) == "High Risk"
