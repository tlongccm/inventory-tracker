"""Subscription SQLAlchemy model with all 27 fields from data-model.md."""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    Numeric, ForeignKey, Enum as SQLEnum, Text, Index
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from ..database import Base


class SubscriptionStatus(str, PyEnum):
    """Subscription status."""
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class ValueLevel(str, PyEnum):
    """Value level indicator."""
    HIGH = "H"
    MEDIUM = "M"
    LOW = "L"


class PaymentFrequency(str, PyEnum):
    """Payment frequency."""
    MONTHLY = "Monthly"
    ANNUAL = "Annual"
    OTHER = "Other"


class Subscription(Base):
    """A subscription service entry with tracking information."""

    __tablename__ = "subscriptions"

    # Primary key and metadata
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(String(10), unique=True, nullable=False, index=True)  # SUB-NNNN format
    subscription_id_num = Column(Integer, nullable=False)  # Numeric portion for sequencing

    # Core fields
    provider = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=True)
    link = Column(String(500))

    # Credentials
    authentication = Column(String(200))
    username = Column(String(200))
    password = Column(String(500))  # Obfuscated storage
    in_lastpass = Column(Boolean)
    access_level_required = Column(String(200))

    # Status and value
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    description_value = Column(Text)
    value_level = Column(SQLEnum(ValueLevel))
    ccm_owner = Column(String(200))
    subscription_log = Column(Text)

    # Financial
    payment_method = Column(String(200))
    cost = Column(String(100))  # Text description of cost
    annual_cost = Column(Numeric(12, 2))
    payment_frequency = Column(SQLEnum(PaymentFrequency))
    renewal_date = Column(Date)

    # Communication
    subscriber_email = Column(String(200))
    forward_to = Column(String(200))
    email_routing = Column(String(100))
    email_volume_per_week = Column(String(100))
    main_vendor_contact = Column(String(500))

    # Actions
    actions_todos = Column(Text)
    last_confirmed_alive = Column(Date)

    # Timestamps and soft delete
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    category = relationship("Category")
    subcategory = relationship("Subcategory")

    # Indexes for filtering
    __table_args__ = (
        Index('ix_subscription_status', 'status', 'is_deleted'),
        Index('ix_subscription_provider', 'provider', 'is_deleted'),
        Index('ix_subscription_owner', 'ccm_owner', 'is_deleted'),
        Index('ix_subscription_category', 'category_id', 'is_deleted'),
        Index('ix_subscription_value_level', 'value_level', 'is_deleted'),
        Index('ix_subscription_renewal', 'renewal_date', 'is_deleted'),
    )
