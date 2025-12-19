"""Category service for business logic and database operations."""

from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models import Category, Subcategory, Subscription
from ..schemas import CategoryCreate, CategoryUpdate, SubcategoryCreate, SubcategoryUpdate


class CategoryService:
    """Service class for category operations."""

    def __init__(self, db: Session):
        self.db = db

    # ============================================
    # CATEGORY OPERATIONS
    # ============================================

    def get_all_categories(
        self,
        include_inactive: bool = False,
    ) -> List[Category]:
        """Get all categories with their subcategories.

        Args:
            include_inactive: Include inactive (soft-deleted) categories.

        Returns:
            List of categories with nested subcategories.
        """
        query = self.db.query(Category)

        if not include_inactive:
            query = query.filter(Category.is_active == True)

        return query.order_by(Category.display_order, Category.name).all()

    def get_category_by_id(self, category_id: int) -> Optional[Category]:
        """Get a single category by ID."""
        return self.db.query(Category).filter(Category.id == category_id).first()

    def create_category(self, data: CategoryCreate) -> Category:
        """Create a new category."""
        category = Category(
            name=data.name,
            display_order=data.display_order,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update_category(self, category: Category, data: CategoryUpdate) -> Category:
        """Update an existing category."""
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(category, field, value)

        self.db.commit()
        self.db.refresh(category)
        return category

    def delete_category(self, category: Category) -> None:
        """Soft delete a category by setting is_active=False."""
        category.is_active = False
        self.db.commit()

    def get_category_usage_count(self, category_id: int) -> int:
        """Count subscriptions using this category."""
        return self.db.query(func.count(Subscription.id)).filter(
            Subscription.category_id == category_id,
            Subscription.is_deleted == False,
        ).scalar() or 0

    def category_name_exists(self, name: str, exclude_id: Optional[int] = None) -> bool:
        """Check if a category name already exists."""
        query = self.db.query(Category).filter(Category.name == name)
        if exclude_id:
            query = query.filter(Category.id != exclude_id)
        return query.first() is not None

    # ============================================
    # SUBCATEGORY OPERATIONS
    # ============================================

    def get_subcategories(
        self,
        category_id: int,
        include_inactive: bool = False,
    ) -> List[Subcategory]:
        """Get subcategories for a category."""
        query = self.db.query(Subcategory).filter(
            Subcategory.category_id == category_id
        )

        if not include_inactive:
            query = query.filter(Subcategory.is_active == True)

        return query.order_by(Subcategory.display_order, Subcategory.name).all()

    def get_subcategory_by_id(self, subcategory_id: int) -> Optional[Subcategory]:
        """Get a single subcategory by ID."""
        return self.db.query(Subcategory).filter(Subcategory.id == subcategory_id).first()

    def create_subcategory(self, category_id: int, data: SubcategoryCreate) -> Subcategory:
        """Create a new subcategory."""
        subcategory = Subcategory(
            category_id=category_id,
            name=data.name,
            display_order=data.display_order,
        )
        self.db.add(subcategory)
        self.db.commit()
        self.db.refresh(subcategory)
        return subcategory

    def update_subcategory(self, subcategory: Subcategory, data: SubcategoryUpdate) -> Subcategory:
        """Update an existing subcategory."""
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(subcategory, field, value)

        self.db.commit()
        self.db.refresh(subcategory)
        return subcategory

    def delete_subcategory(self, subcategory: Subcategory) -> None:
        """Soft delete a subcategory by setting is_active=False."""
        subcategory.is_active = False
        self.db.commit()

    def get_subcategory_usage_count(self, subcategory_id: int) -> int:
        """Count subscriptions using this subcategory."""
        return self.db.query(func.count(Subscription.id)).filter(
            Subscription.subcategory_id == subcategory_id,
            Subscription.is_deleted == False,
        ).scalar() or 0

    def subcategory_name_exists(
        self,
        category_id: int,
        name: str,
        exclude_id: Optional[int] = None,
    ) -> bool:
        """Check if a subcategory name exists within a category."""
        query = self.db.query(Subcategory).filter(
            Subcategory.category_id == category_id,
            Subcategory.name == name,
        )
        if exclude_id:
            query = query.filter(Subcategory.id != exclude_id)
        return query.first() is not None
