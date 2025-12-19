"""Category SQLAlchemy model for subscription classification."""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..database import Base


class Category(Base):
    """A subscription category for classification. Stored as single source of truth."""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to subcategories
    subcategories = relationship(
        "Subcategory",
        back_populates="category",
        order_by="Subcategory.display_order"
    )

    __table_args__ = (
        Index('ix_category_name', 'name'),
        Index('ix_category_active', 'is_active'),
    )
