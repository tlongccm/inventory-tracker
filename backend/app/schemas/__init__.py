# Schemas package - exports Pydantic schemas

from .equipment import (
    EquipmentBase,
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentListItem,
    EquipmentResponse,
    AssignmentHistoryItem,
    ImportError as EquipmentImportError,
    ImportError,  # Backwards compatibility
    ImportResult as EquipmentImportResult,
    ImportResult,  # Backwards compatibility
    ErrorResponse,
)

from .category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithSubcategories,
    SubcategoryCreate,
    SubcategoryUpdate,
    SubcategoryResponse,
    UsageCount,
)

from .subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionListItem,
    SubscriptionResponse,
    ImportError as SubscriptionImportError,
    ImportResult as SubscriptionImportResult,
)

__all__ = [
    # Equipment schemas
    "EquipmentBase",
    "EquipmentCreate",
    "EquipmentUpdate",
    "EquipmentListItem",
    "EquipmentResponse",
    "AssignmentHistoryItem",
    "EquipmentImportError",
    "EquipmentImportResult",
    "ImportError",  # Backwards compatibility
    "ImportResult",  # Backwards compatibility
    "ErrorResponse",
    # Category schemas
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoryWithSubcategories",
    "SubcategoryCreate",
    "SubcategoryUpdate",
    "SubcategoryResponse",
    "UsageCount",
    # Subscription schemas
    "SubscriptionCreate",
    "SubscriptionUpdate",
    "SubscriptionListItem",
    "SubscriptionResponse",
    "SubscriptionImportError",
    "SubscriptionImportResult",
]
