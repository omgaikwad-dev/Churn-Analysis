from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict

class DatasetValidationReport(BaseModel):
    row_count: int
    column_count: int
    columns: list[str]
    inferred_types: dict[str, str]
    missing_values: dict[str, int]
    duplicate_rows: int
    target_column: str | None
    target_distribution: dict[str, int] | None
    warnings: list[str]
    errors: list[str]
    is_ready_for_training: bool

class DatasetResponse(BaseModel):
    id: int
    owner_id: int
    display_name: str
    file_size_bytes: int
    row_count: int
    column_count: int
    target_column: str | None
    validation_status: str
    column_metadata: dict[str, Any] | None
    validation_summary: dict[str, Any] | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DatasetPreviewResponse(BaseModel):
    id: int
    display_name: str
    columns: list[str]
    preview_rows: list[dict[str, Any]]
    total_rows: int
