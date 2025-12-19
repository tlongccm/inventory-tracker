"""Subcategory SQLAlchemy model linked to a parent Category."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database import Base


class Subcategory(Base):
    """A subcategory linked to a parent Category."""

    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to category
    category = relationship("Category", back_populates="subcategories")

    __table_args__ = (
        Index('ix_subcategory_category', 'category_id'),
        Index('ix_subcategory_active', 'is_active'),
        Index('uq_subcategory_name_category', 'category_id', 'name', unique=True),
    )
