import hashlib
import json
import logging
from pathlib import Path
from typing import Any
import joblib
from app.core.config import settings

logger = logging.getLogger("churn-registry")

def calculate_checksum(file_path: Path) -> str:
    """Computes SHA256 checksum of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    return sha256.hexdigest()

def save_model_artifact(
    pipeline: Any,
    model_version: str,
    metadata: dict[str, Any],
) -> tuple[Path, str]:
    """Persists model artifact (.joblib) and metadata (.json) with checksum."""
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    artifact_path = settings.MODEL_DIR / f"{model_version}.joblib"
    meta_path = settings.MODEL_DIR / f"{model_version}.json"

    joblib.dump(pipeline, artifact_path)
    checksum = calculate_checksum(artifact_path)

    metadata["checksum"] = checksum
    metadata["model_version"] = model_version
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Saved model artifact %s (checksum: %s)", artifact_path.name, checksum[:8])
    return artifact_path, checksum

def load_model_artifact(artifact_path: Path | str, expected_checksum: str | None = None) -> Any:
    """Loads a model artifact and verifies its checksum."""
    path = Path(artifact_path)
    if not path.exists():
        raise FileNotFoundError(f"Model artifact not found at {path}")

    if expected_checksum:
        current_checksum = calculate_checksum(path)
        if current_checksum != expected_checksum:
            raise ValueError(f"Checksum mismatch for {path}: expected {expected_checksum}, got {current_checksum}")

    model = joblib.load(path)
    if not hasattr(model, "predict_proba"):
        raise ValueError(f"Loaded artifact at {path} does not implement predict_proba")

    return model
