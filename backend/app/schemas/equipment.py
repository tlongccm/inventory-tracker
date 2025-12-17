"""Pydantic schemas for Equipment API request/response validation."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

from ..models import EquipmentType, ComputerSubtype, Status, UsageType


# Base schema with common fields
class EquipmentBase(BaseModel):
    """Base schema with common equipment fields."""
    model: Optional[str] = Field(None, max_length=200)
    manufacturer: Optional[str] = Field(None, max_length=200)
    manufacturing_date: Optional[date] = None
    acquisition_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=200)
    cost: Optional[Decimal] = Field(None, ge=0)

    # PC-specific fields
    computer_subtype: Optional[ComputerSubtype] = None
    cpu_model: Optional[str] = Field(None, max_length=100)
    cpu_speed: Optional[str] = Field(None, max_length=50)
    operating_system: Optional[str] = Field(None, max_length=100)
    ram: Optional[str] = Field(None, max_length=50)
    storage: Optional[str] = Field(None, max_length=100)
    video_card: Optional[str] = Field(None, max_length=200)
    display_resolution: Optional[str] = Field(None, max_length=50)
    mac_address: Optional[str] = Field(None, max_length=17)

    # Performance fields
    cpu_score: Optional[int] = Field(None, ge=0)
    score_2d: Optional[int] = Field(None, ge=0)
    score_3d: Optional[int] = Field(None, ge=0)
    memory_score: Optional[int] = Field(None, ge=0)
    disk_score: Optional[int] = Field(None, ge=0)
    overall_rating: Optional[int] = Field(None, ge=0)

    # Assignment fields
    equipment_name: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)
    assignment_date: Optional[date] = None
    primary_user: Optional[str] = Field(None, max_length=200)
    usage_type: Optional[UsageType] = None
    status: Optional[Status] = Status.ACTIVE

    # Notes
    notes: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    """Schema for creating new equipment."""
    equipment_type: EquipmentType
    serial_number: Optional[str] = Field(None, max_length=100)


class EquipmentUpdate(EquipmentBase):
    """Schema for updating equipment (all fields optional)."""
    pass


class EquipmentListItem(BaseModel):
    """Summary view of equipment for list display with all view group fields."""
    equipment_id: str
    equipment_type: EquipmentType
    serial_number: Optional[str] = None
    equipment_name: Optional[str] = None
    model: Optional[str] = None
    primary_user: Optional[str] = None
    status: Status
    is_deleted: bool

    # Always visible fields
    computer_subtype: Optional[ComputerSubtype] = None

    # Summary view fields
    manufacturer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

    # Machine Spec view fields
    cpu_model: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    operating_system: Optional[str] = None
    mac_address: Optional[str] = None

    # Machine Performance view fields
    cpu_score: Optional[int] = None
    score_2d: Optional[int] = None
    score_3d: Optional[int] = None
    memory_score: Optional[int] = None
    disk_score: Optional[int] = None
    overall_rating: Optional[int] = None

    # Assignment view fields
    assignment_date: Optional[date] = None
    usage_type: Optional[UsageType] = None
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
    previous_usage_type: Optional[UsageType] = None
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
