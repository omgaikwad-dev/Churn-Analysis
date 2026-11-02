import io
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import pandas as pd
from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.models.dataset import Dataset
from app.schemas.dataset import (
    DatasetResponse,
    DatasetValidationReport,
    DatasetPreviewResponse,
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Safely uploads and parses a customer dataset CSV file, runs validation, and registers it."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported.",
        )

    # Read content and enforce size limit
    content = await file.read()
    file_size = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    # Safe storage filename
    safe_filename = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    storage_path = settings.UPLOAD_DIR / safe_filename
    with open(storage_path, "wb") as f:
        f.write(content)

    # Parse and Validate with pandas
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        if storage_path.exists():
            storage_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {exc}",
        )

    row_count = int(len(df))
    col_count = int(len(df.columns))
    columns = list(df.columns)
    missing_dict = {col: int(df[col].isna().sum()) for col in columns}
    duplicate_rows = int(df.duplicated().sum())

    inferred_types = {col: str(df[col].dtype) for col in columns}

    # Identify target column
    target_col = None
    target_dist = None
    for c in columns:
        if c.lower() in ("churn", "churned", "target", "churn_label"):
            target_col = c
            val_counts = df[c].value_counts().to_dict()
            target_dist = {str(k): int(v) for k, v in val_counts.items()}
            break

    warnings = []
    errors = []

    if row_count < 10:
        errors.append("Dataset has fewer than 10 rows; cannot be used for training.")
    elif row_count < 50:
        warnings.append("Dataset is small (< 50 rows); model evaluation may have high variance.")

    if not target_col:
        warnings.append("No explicit 'Churn' target column found; dataset can be used for prediction but not training.")

    status_flag = "invalid" if errors else ("warning" if warnings else "valid")
    is_ready = len(errors) == 0 and target_col is not None

    validation_summary = {
        "missing_values": missing_dict,
        "duplicate_rows": duplicate_rows,
        "target_distribution": target_dist,
        "warnings": warnings,
        "errors": errors,
        "is_ready_for_training": is_ready,
    }

    dataset = Dataset(
        owner_id=current_user.id,
        display_name=file.filename,
        storage_path=str(storage_path),
        file_size_bytes=file_size,
        row_count=row_count,
        column_count=col_count,
        target_column=target_col,
        validation_status=status_flag,
        column_metadata={"columns": columns, "dtypes": inferred_types},
        validation_summary=validation_summary,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return DatasetResponse.model_validate(dataset)

@router.get("", response_model=list[DatasetResponse])
def list_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all datasets owned by the authenticated user."""
    datasets = (
        db.query(Dataset)
        .filter(Dataset.owner_id == current_user.id)
        .order_by(Dataset.created_at.desc())
        .all()
    )
    return [DatasetResponse.model_validate(d) for d in datasets]

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves dataset metadata."""
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.owner_id == current_user.id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")
    return DatasetResponse.model_validate(dataset)

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def preview_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns top 10 preview rows of dataset."""
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.owner_id == current_user.id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    path = Path(dataset.storage_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored dataset file missing.")

    df = pd.read_csv(path, nrows=10)
    df = df.fillna("")
    records = df.to_dict(orient="records")

    return DatasetPreviewResponse(
        id=dataset.id,
        display_name=dataset.display_name,
        columns=list(df.columns),
        preview_rows=records,
        total_rows=dataset.row_count,
    )

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes dataset record and file."""
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.owner_id == current_user.id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    path = Path(dataset.storage_path)
    if path.exists():
        path.unlink()

    db.delete(dataset)
    db.commit()
    return None
