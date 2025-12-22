"""Equipment SQLAlchemy model with all fields from data-model.md."""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    Numeric, Enum as SQLEnum, Text, Index
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from ..database import Base


class EquipmentType(str, PyEnum):
    """Type of equipment (determines ID prefix)."""
    PC = "PC"
    MONITOR = "Monitor"
    SCANNER = "Scanner"
    PRINTER = "Printer"


# Mapping for ID prefix generation
EQUIPMENT_TYPE_PREFIXES = {
    EquipmentType.PC: "PC",
    EquipmentType.MONITOR: "MON",
    EquipmentType.SCANNER: "SCN",
    EquipmentType.PRINTER: "PRN",
}


# Known values for extensible enumerations (stored as strings, these are defaults)
COMPUTER_SUBTYPE_VALUES = ["Desktop", "Laptop", "Tower", "SFF"]
STATUS_VALUES = ["Active", "Inactive", "Decommissioned", "In Repair", "In Storage"]
USAGE_TYPE_VALUES = ["Personal", "Work"]


# Legacy enum classes kept for backwards compatibility with existing code
class ComputerSubtype(str, PyEnum):
    """Subtype for PC equipment only (legacy - now stored as String)."""
    DESKTOP = "Desktop"
    LAPTOP = "Laptop"


class Status(str, PyEnum):
    """Equipment status (legacy - now stored as String)."""
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    DECOMMISSIONED = "Decommissioned"
    IN_REPAIR = "In Repair"
    IN_STORAGE = "In Storage"


class UsageType(str, PyEnum):
    """Usage type indicating personal or work use (legacy - now stored as String)."""
    PERSONAL = "Personal"
    WORK = "Work"


class Equipment(Base):
    """Equipment entity representing a piece of equipment in the organization."""

    __tablename__ = "equipment"

    # Primary key and metadata
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String(10), unique=True, nullable=False, index=True)  # {TYPE}-NNNN format
    equipment_id_num = Column(Integer, nullable=False)  # Numeric portion for per-type sequencing
    equipment_type = Column(SQLEnum(EquipmentType), nullable=False)
    serial_number = Column(String(100), unique=True, nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

    # Common equipment fields
    model = Column(String(200))
    manufacturer = Column(String(200))
    manufacturing_date = Column(Date)
    acquisition_date = Column(Date)
    location = Column(String(200))
    cost = Column(Numeric(10, 2))
    purpose = Column(String(100))  # Equipment function (e.g., "CEO", "Trading", "Research")
    ownership = Column(String(100))  # Equipment ownership (e.g., "Company", "Leased", "Personal")

    # PC-specific fields (nullable for non-PC types)
    computer_subtype = Column(String(50))  # Now String for extensibility (Desktop, Laptop, Tower, SFF)
    cpu_model = Column(String(100))
    cpu_speed = Column(String(50))
    operating_system = Column(String(100))
    ram = Column(String(50))
    storage = Column(String(100))
    video_card = Column(String(200))
    display_resolution = Column(String(50))
    mac_lan = Column(String(17))
    mac_wlan = Column(String(17))

    # Performance fields (Passmark) - PC only
    cpu_score = Column(Integer)
    score_2d = Column(Integer)
    score_3d = Column(Integer)
    memory_score = Column(Integer)
    disk_score = Column(Integer)
    overall_rating = Column(Integer)

    # Assignment fields
    equipment_name = Column(String(100))
    ip_address = Column(String(45))
    assignment_date = Column(Date)
    primary_user = Column(String(200))
    usage_type = Column(String(50))  # Now String for extensibility (Personal, Work)
    status = Column(String(50), default="Active")  # Now String for extensibility

    # Notes
    notes = Column(Text)

    # Relationship to assignment history
    assignment_history = relationship(
        "AssignmentHistory",
        back_populates="equipment",
        order_by="desc(AssignmentHistory.end_date)"
    )

    # Indexes for filtering
    __table_args__ = (
        Index('ix_equipment_status', 'status', 'is_deleted'),
        Index('ix_equipment_user', 'primary_user', 'is_deleted'),
        Index('ix_equipment_usage_type', 'usage_type', 'is_deleted'),
        Index('ix_equipment_type', 'equipment_type', 'is_deleted'),
        Index('ix_equipment_location', 'location', 'is_deleted'),
    )
