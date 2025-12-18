"""Software SQLAlchemy model with all fields from data-model.md."""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    Numeric, Text, Index
)
from sqlalchemy.sql import func

from ..database import Base


class Software(Base):
    """Software entity representing a software product in the organization."""

    __tablename__ = "software"

    # Primary identifiers
    id = Column(Integer, primary_key=True, index=True)
    software_id = Column(String(20), unique=True, nullable=False, index=True)  # SW-NNNN format
    software_id_num = Column(Integer, nullable=False)  # Numeric portion for sequencing

    # Core fields
    category = Column(String(100), nullable=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    version = Column(String(50), nullable=True)
    key = Column(String(500), nullable=True)  # License key
    type = Column(String(100), nullable=True)  # License/software type

    # Purchase fields
    purchase_date = Column(Date, nullable=True)
    purchaser = Column(String(200), nullable=True)
    vendor = Column(String(200), nullable=True, index=True)
    cost = Column(Numeric(10, 2), nullable=True)

    # Status and deployment
    deployment = Column(String(200), nullable=True)
    install_location = Column(String(500), nullable=True)
    status = Column(String(50), nullable=True, index=True)
    comments = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    # Indexes for filtering
    __table_args__ = (
        Index('ix_software_category_deleted', 'category', 'is_deleted'),
        Index('ix_software_status_deleted', 'status', 'is_deleted'),
        Index('ix_software_vendor_deleted', 'vendor', 'is_deleted'),
        Index('ix_software_type_deleted', 'type', 'is_deleted'),
    )
