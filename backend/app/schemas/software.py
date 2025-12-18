"""Pydantic schemas for Software API request/response validation."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SoftwareBase(BaseModel):
    """Base schema with common software fields."""
    category: Optional[str] = Field(None, max_length=100)
    name: str = Field(..., max_length=200)
    version: Optional[str] = Field(None, max_length=50)
    key: Optional[str] = Field(None, max_length=500)
    type: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[date] = None
    purchaser: Optional[str] = Field(None, max_length=200)
    vendor: Optional[str] = Field(None, max_length=200)
    cost: Optional[Decimal] = Field(None, ge=0)
    deployment: Optional[str] = Field(None, max_length=200)
    install_location: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, max_length=50)
    comments: Optional[str] = None


class SoftwareCreate(SoftwareBase):
    """Schema for creating new software."""
    pass


class SoftwareUpdate(BaseModel):
    """Schema for updating software (all fields optional)."""
    category: Optional[str] = Field(None, max_length=100)
    name: Optional[str] = Field(None, max_length=200)
    version: Optional[str] = Field(None, max_length=50)
    key: Optional[str] = Field(None, max_length=500)
    type: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[date] = None
    purchaser: Optional[str] = Field(None, max_length=200)
    vendor: Optional[str] = Field(None, max_length=200)
    cost: Optional[Decimal] = Field(None, ge=0)
    deployment: Optional[str] = Field(None, max_length=200)
    install_location: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, max_length=50)
    comments: Optional[str] = None


class SoftwareListItem(BaseModel):
    """Summary view of software for list display."""
    id: int
    software_id: str
    category: Optional[str] = None
    name: str
    version: Optional[str] = None
    key: Optional[str] = None
    type: Optional[str] = None
    purchase_date: Optional[date] = None
    purchaser: Optional[str] = None
    vendor: Optional[str] = None
    cost: Optional[Decimal] = None
    deployment: Optional[str] = None
    install_location: Optional[str] = None
    status: Optional[str] = None
    comments: Optional[str] = None
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class SoftwareResponse(SoftwareBase):
    """Full software record response."""
    id: int
    software_id: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SoftwareImportError(BaseModel):
    """Details of a failed import row."""
    row: int
    field: Optional[str] = None
    message: str


class SoftwareImportResult(BaseModel):
    """Result of CSV import operation."""
    success_count: int
    error_count: int
    errors: List[SoftwareImportError]
