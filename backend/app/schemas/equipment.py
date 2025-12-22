"""Pydantic schemas for Equipment API request/response validation."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from enum import Enum as PyEnum
from pydantic import BaseModel, Field, ConfigDict

from ..models import EquipmentType


class PreviewStatus(str, PyEnum):
    """Status of a row in import preview."""
    VALIDATED = "validated"
    PROBLEMATIC = "problematic"
    DUPLICATE = "duplicate"


# Base schema with common fields
class EquipmentBase(BaseModel):
    """Base schema with common equipment fields."""
    model: Optional[str] = Field(None, max_length=200)
    manufacturer: Optional[str] = Field(None, max_length=200)
    manufacturing_date: Optional[date] = None
    acquisition_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=200)
    cost: Optional[Decimal] = Field(None, ge=0)
    purpose: Optional[str] = Field(None, max_length=100)
    ownership: Optional[str] = Field(None, max_length=100)

    # PC-specific fields (computer_subtype now String for extensibility)
    computer_subtype: Optional[str] = Field(None, max_length=50)
    cpu_model: Optional[str] = Field(None, max_length=100)
    cpu_speed: Optional[str] = Field(None, max_length=50)
    operating_system: Optional[str] = Field(None, max_length=100)
    ram: Optional[str] = Field(None, max_length=50)
    storage: Optional[str] = Field(None, max_length=100)
    video_card: Optional[str] = Field(None, max_length=200)
    display_resolution: Optional[str] = Field(None, max_length=50)
    mac_lan: Optional[str] = Field(None, max_length=17)
    mac_wlan: Optional[str] = Field(None, max_length=17)

    # Performance fields
    cpu_score: Optional[int] = Field(None, ge=0)
    score_2d: Optional[int] = Field(None, ge=0)
    score_3d: Optional[int] = Field(None, ge=0)
    memory_score: Optional[int] = Field(None, ge=0)
    disk_score: Optional[int] = Field(None, ge=0)
    overall_rating: Optional[int] = Field(None, ge=0)

    # Assignment fields (usage_type and status now String for extensibility)
    equipment_name: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)
    assignment_date: Optional[date] = None
    primary_user: Optional[str] = Field(None, max_length=200)
    usage_type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field("Active", max_length=50)

    # Notes
    notes: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    """Schema for creating new equipment."""
    equipment_type: EquipmentType
    serial_number: Optional[str] = Field(None, max_length=100)


class EquipmentUpdate(EquipmentBase):
    """Schema for updating equipment (all fields optional)."""
    equipment_type: Optional[EquipmentType] = None
    serial_number: Optional[str] = Field(None, max_length=100)


class EquipmentListItem(BaseModel):
    """Summary view of equipment for list display with all view group fields."""
    equipment_id: str
    equipment_type: EquipmentType
    serial_number: Optional[str] = None
    equipment_name: Optional[str] = None
    model: Optional[str] = None
    primary_user: Optional[str] = None
    status: Optional[str] = None
    is_deleted: bool

    # Always visible fields
    computer_subtype: Optional[str] = None
    purpose: Optional[str] = None

    # Summary view fields
    manufacturer: Optional[str] = None
    location: Optional[str] = None
    ownership: Optional[str] = None
    notes: Optional[str] = None

    # Machine Spec view fields
    cpu_model: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    operating_system: Optional[str] = None
    mac_lan: Optional[str] = None
    mac_wlan: Optional[str] = None

    # Machine Performance view fields
    cpu_score: Optional[int] = None
    score_2d: Optional[int] = None
    score_3d: Optional[int] = None
    memory_score: Optional[int] = None
    disk_score: Optional[int] = None
    overall_rating: Optional[int] = None

    # Assignment view fields
    assignment_date: Optional[date] = None
    usage_type: Optional[str] = None
    ip_address: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EquipmentResponse(EquipmentBase):
    """Full equipment record response."""
    id: int
    equipment_id: str
    equipment_type: EquipmentType
    serial_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AssignmentHistoryItem(BaseModel):
    """A single assignment history record."""
    id: int
    previous_user: Optional[str] = None
    previous_usage_type: Optional[str] = None
    previous_equipment_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ImportError(BaseModel):
    """Details of a failed import row."""
    row: int
    serial_number: str
    error: str


class ImportResult(BaseModel):
    """Result of CSV import operation."""
    total_rows: int
    created: int
    updated: int
    restored: int
    failed: int
    errors: List[ImportError]


class ErrorResponse(BaseModel):
    """API error response."""
    detail: str


# Import Preview Types
class FieldError(BaseModel):
    """Validation error for a specific field."""
    field: str
    value: str
    message: str
    suggestion: Optional[str] = None


class ImportPreviewRow(BaseModel):
    """A single row in the import preview."""
    row_number: int
    equipment_id: str
    data: Dict[str, Any]
    status: PreviewStatus
    errors: List[FieldError]
    normalized_values: Optional[Dict[str, str]] = None
    original_values: Optional[Dict[str, str]] = None


class ImportPreviewResult(BaseModel):
    """Result of CSV import preview."""
    total_rows: int
    validated_rows: List[ImportPreviewRow]
    problematic_rows: List[ImportPreviewRow]
    duplicate_rows: List[ImportPreviewRow]
    csv_columns: List[str]


class ImportRowData(BaseModel):
    """Data for a single row to import."""
    row_number: int
    data: Dict[str, Any]


class ImportConfirmRequest(BaseModel):
    """Request to confirm import of selected rows."""
    rows: List[ImportRowData]


class ValidateRowRequest(BaseModel):
    """Request to validate a single edited row."""
    row_number: Optional[int] = None
    data: Dict[str, Any]


class ValidateFieldRequest(BaseModel):
    """Request to validate a single field value."""
    field: str
    value: str


class ValidateFieldResponse(BaseModel):
    """Response from field validation."""
    valid: bool
    normalized_value: Optional[str] = None
    error: Optional[str] = None
    suggestion: Optional[str] = None
