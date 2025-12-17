"""AssignmentHistory SQLAlchemy model for tracking equipment assignment changes."""

from sqlalchemy import (
    Column, Integer, String, Date, DateTime, ForeignKey,
    Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base
from .equipment import UsageType


class AssignmentHistory(Base):
    """Assignment history record tracking past assignments for equipment."""

    __tablename__ = "assignment_history"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    previous_user = Column(String(200))
    previous_usage_type = Column(SQLEnum(UsageType))
    previous_equipment_name = Column(String(100))
    start_date = Column(Date)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship back to equipment
    equipment = relationship("Equipment", back_populates="assignment_history")

    # Indexes for efficient history queries
    __table_args__ = (
        Index('ix_history_end_date', 'equipment_id', 'end_date'),
    )
