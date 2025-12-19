"""Pydantic schemas for Category and Subcategory API request/response validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ============================================
# SUBCATEGORY SCHEMAS
# ============================================

class SubcategoryCreate(BaseModel):
    """Schema for creating a new subcategory."""
    name: str = Field(..., max_length=100)
    display_order: int = Field(default=0)


class SubcategoryUpdate(BaseModel):
    """Schema for updating a subcategory (all fields optional)."""
    name: Optional[str] = Field(None, max_length=100)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class SubcategoryResponse(BaseModel):
    """Subcategory response schema."""
    id: int
    category_id: int
    name: str
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# CATEGORY SCHEMAS
# ============================================

class CategoryCreate(BaseModel):
    """Schema for creating a new category."""
    name: str = Field(..., max_length=100)
    display_order: int = Field(default=0)


class CategoryUpdate(BaseModel):
    """Schema for updating a category (all fields optional)."""
    name: Optional[str] = Field(None, max_length=100)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    """Category response schema (without subcategories)."""
    id: int
    name: str
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryWithSubcategories(BaseModel):
    """Category response schema with nested subcategories."""
    id: int
    name: str
    display_order: int
    is_active: bool
    subcategories: List[SubcategoryResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================
# USAGE SCHEMAS
# ============================================

class UsageCount(BaseModel):
    """Response schema for category/subcategory usage count."""
    subscription_count: int
