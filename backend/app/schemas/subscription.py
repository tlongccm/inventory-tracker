"""Pydantic schemas for Subscription API request/response validation."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator

from ..models import SubscriptionStatus, ValueLevel, PaymentFrequency


# ============================================
# CREATE/UPDATE SCHEMAS
# ============================================

class SubscriptionCreate(BaseModel):
    """Schema for creating a new subscription."""
    provider: str = Field(..., max_length=200)
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    link: Optional[str] = Field(None, max_length=500)
    authentication: Optional[str] = Field(None, max_length=200)
    username: Optional[str] = Field(None, max_length=200)
    password: Optional[str] = Field(None, max_length=500)  # Will be obfuscated
    in_lastpass: Optional[bool] = None
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    description_value: Optional[str] = None
    value_level: Optional[ValueLevel] = None
    ccm_owner: Optional[str] = Field(None, max_length=200)
    subscription_log: Optional[str] = None
    payment_method: Optional[str] = Field(None, max_length=200)
    cost: Optional[str] = Field(None, max_length=100)
    annual_cost: Optional[Decimal] = Field(None, ge=0)
    payment_frequency: Optional[PaymentFrequency] = None
    renewal_date: Optional[date] = None
    last_confirmed_alive: Optional[date] = None
    main_vendor_contact: Optional[str] = Field(None, max_length=500)
    subscriber_email: Optional[str] = Field(None, max_length=200)
    forward_to: Optional[str] = Field(None, max_length=200)
    email_routing: Optional[str] = Field(None, max_length=100)
    email_volume_per_week: Optional[str] = Field(None, max_length=100)
    actions_todos: Optional[str] = None
    access_level_required: Optional[str] = Field(None, max_length=200)


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription (all fields optional)."""
    provider: Optional[str] = Field(None, max_length=200)
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    link: Optional[str] = Field(None, max_length=500)
    authentication: Optional[str] = Field(None, max_length=200)
    username: Optional[str] = Field(None, max_length=200)
    password: Optional[str] = Field(None, max_length=500)  # Will be obfuscated
    in_lastpass: Optional[bool] = None
    status: Optional[SubscriptionStatus] = None
    description_value: Optional[str] = None
    value_level: Optional[ValueLevel] = None
    ccm_owner: Optional[str] = Field(None, max_length=200)
    subscription_log: Optional[str] = None
    payment_method: Optional[str] = Field(None, max_length=200)
    cost: Optional[str] = Field(None, max_length=100)
    annual_cost: Optional[Decimal] = Field(None, ge=0)
    payment_frequency: Optional[PaymentFrequency] = None
    renewal_date: Optional[date] = None
    last_confirmed_alive: Optional[date] = None
    main_vendor_contact: Optional[str] = Field(None, max_length=500)
    subscriber_email: Optional[str] = Field(None, max_length=200)
    forward_to: Optional[str] = Field(None, max_length=200)
    email_routing: Optional[str] = Field(None, max_length=100)
    email_volume_per_week: Optional[str] = Field(None, max_length=100)
    actions_todos: Optional[str] = None
    access_level_required: Optional[str] = Field(None, max_length=200)


# ============================================
# RESPONSE SCHEMAS
# ============================================

class SubscriptionListItem(BaseModel):
    """Summary view of subscription for list display."""
    subscription_id: str
    provider: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    subcategory_id: Optional[int] = None
    subcategory_name: Optional[str] = None
    status: SubscriptionStatus
    ccm_owner: Optional[str] = None
    is_deleted: bool
    renewal_date: Optional[date] = None
    renewal_status: Optional[Literal['ok', 'warning', 'urgent', 'overdue']] = None

    # Access View fields
    link: Optional[str] = None
    authentication: Optional[str] = None
    username: Optional[str] = None
    password_masked: Optional[str] = None  # Password shown as asterisks
    in_lastpass: Optional[bool] = None
    access_level_required: Optional[str] = None

    # Financial View fields
    payment_method: Optional[str] = None
    cost: Optional[str] = None
    annual_cost: Optional[Decimal] = None
    payment_frequency: Optional[PaymentFrequency] = None

    # Communication View fields
    subscriber_email: Optional[str] = None
    forward_to: Optional[str] = None
    email_routing: Optional[str] = None
    email_volume_per_week: Optional[str] = None
    main_vendor_contact: Optional[str] = None

    # Details View fields
    description_value: Optional[str] = None
    value_level: Optional[ValueLevel] = None
    subscription_log: Optional[str] = None
    actions_todos: Optional[str] = None
    last_confirmed_alive: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


class SubscriptionResponse(BaseModel):
    """Full subscription record response with deobfuscated password."""
    id: int
    subscription_id: str
    provider: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    subcategory_id: Optional[int] = None
    subcategory_name: Optional[str] = None
    link: Optional[str] = None
    authentication: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None  # Deobfuscated (plaintext)
    in_lastpass: Optional[bool] = None
    status: SubscriptionStatus
    description_value: Optional[str] = None
    value_level: Optional[ValueLevel] = None
    ccm_owner: Optional[str] = None
    subscription_log: Optional[str] = None
    payment_method: Optional[str] = None
    cost: Optional[str] = None
    annual_cost: Optional[Decimal] = None
    payment_frequency: Optional[PaymentFrequency] = None
    renewal_date: Optional[date] = None
    last_confirmed_alive: Optional[date] = None
    main_vendor_contact: Optional[str] = None
    subscriber_email: Optional[str] = None
    forward_to: Optional[str] = None
    email_routing: Optional[str] = None
    email_volume_per_week: Optional[str] = None
    actions_todos: Optional[str] = None
    access_level_required: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# IMPORT/EXPORT SCHEMAS
# ============================================

class ImportError(BaseModel):
    """Details of a failed import row."""
    row: int
    provider: str
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
