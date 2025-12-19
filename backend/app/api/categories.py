"""Category and Subcategory API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..services import CategoryService
from ..schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithSubcategories,
    SubcategoryCreate,
    SubcategoryUpdate,
    SubcategoryResponse,
    UsageCount,
)

router = APIRouter(prefix="/categories")


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    """Dependency to get CategoryService instance."""
    return CategoryService(db)


# ============================================
# CATEGORY ENDPOINTS
# ============================================

@router.get("", response_model=List[CategoryWithSubcategories])
def list_categories(
    include_inactive: bool = Query(False, description="Include inactive categories"),
    service: CategoryService = Depends(get_category_service),
):
    """List all categories with subcategories."""
    return service.get_all_categories(include_inactive=include_inactive)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    service: CategoryService = Depends(get_category_service),
):
    """Create a new category."""
    if service.category_name_exists(data.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category name '{data.name}' already exists",
        )

    return service.create_category(data)


@router.get("/{category_id}", response_model=CategoryWithSubcategories)
def get_category(
    category_id: int,
    service: CategoryService = Depends(get_category_service),
):
    """Get a category by ID with subcategories."""
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found",
        )
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    service: CategoryService = Depends(get_category_service),
):
    """Update a category."""
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found",
        )

    # Check name uniqueness if being updated
    if data.name and service.category_name_exists(data.name, exclude_id=category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category name '{data.name}' already exists",
        )

    return service.update_category(category, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    service: CategoryService = Depends(get_category_service),
):
    """Soft delete a category. Fails if subscriptions use this category."""
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found",
        )

    usage_count = service.get_category_usage_count(category_id)
    if usage_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category: {usage_count} subscription(s) use this category",
        )

    service.delete_category(category)
    return None


@router.get("/{category_id}/usage", response_model=UsageCount)
def get_category_usage(
    category_id: int,
    service: CategoryService = Depends(get_category_service),
):
    """Get the count of subscriptions using this category."""
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found",
        )

    return UsageCount(subscription_count=service.get_category_usage_count(category_id))


# ============================================
# SUBCATEGORY ENDPOINTS (nested under category)
# ============================================

@router.get("/{category_id}/subcategories", response_model=List[SubcategoryResponse])
def list_subcategories(
    category_id: int,
    include_inactive: bool = Query(False, description="Include inactive subcategories"),
    service: CategoryService = Depends(get_category_service),
):
    """List subcategories for a category."""
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found",
        )

    return service.get_subcategories(category_id, include_inactive=include_inactive)


@router.post("/{category_id}/subcategories", response_model=SubcategoryResponse, status_code=status.HTTP_201_CREATED)
def create_subcategory(
    category_id: int,
    data: SubcategoryCreate,
    service: CategoryService = Depends(get_category_service),
):
    """Create a new subcategory within a category."""
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category {category_id} not found",
        )

    if service.subcategory_name_exists(category_id, data.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subcategory name '{data.name}' already exists in this category",
        )

    return service.create_subcategory(category_id, data)


# ============================================
# SUBCATEGORY ENDPOINTS (direct access)
# ============================================

subcategory_router = APIRouter(prefix="/subcategories")


@subcategory_router.put("/{subcategory_id}", response_model=SubcategoryResponse)
def update_subcategory(
    subcategory_id: int,
    data: SubcategoryUpdate,
    service: CategoryService = Depends(get_category_service),
):
    """Update a subcategory."""
    subcategory = service.get_subcategory_by_id(subcategory_id)
    if not subcategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subcategory {subcategory_id} not found",
        )

    # Check name uniqueness if being updated
    if data.name and service.subcategory_name_exists(
        subcategory.category_id, data.name, exclude_id=subcategory_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subcategory name '{data.name}' already exists in this category",
        )

    return service.update_subcategory(subcategory, data)


@subcategory_router.delete("/{subcategory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subcategory(
    subcategory_id: int,
    service: CategoryService = Depends(get_category_service),
):
    """Soft delete a subcategory. Fails if subscriptions use it."""
    subcategory = service.get_subcategory_by_id(subcategory_id)
    if not subcategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subcategory {subcategory_id} not found",
        )

    usage_count = service.get_subcategory_usage_count(subcategory_id)
    if usage_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete subcategory: {usage_count} subscription(s) use this subcategory",
        )

    service.delete_subcategory(subcategory)
    return None


@subcategory_router.get("/{subcategory_id}/usage", response_model=UsageCount)
def get_subcategory_usage(
    subcategory_id: int,
    service: CategoryService = Depends(get_category_service),
):
    """Get the count of subscriptions using this subcategory."""
    subcategory = service.get_subcategory_by_id(subcategory_id)
    if not subcategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subcategory {subcategory_id} not found",
        )

    return UsageCount(subscription_count=service.get_subcategory_usage_count(subcategory_id))
