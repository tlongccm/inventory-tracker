"""Subscription API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from ..database import get_db
from ..services import SubscriptionService
from ..models import SubscriptionStatus, ValueLevel
from ..schemas import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionListItem,
    SubscriptionResponse,
)
from ..schemas.subscription import ImportResult

router = APIRouter(prefix="/subscriptions")


def get_subscription_service(db: Session = Depends(get_db)) -> SubscriptionService:
    """Dependency to get SubscriptionService instance."""
    return SubscriptionService(db)


# ============================================
# LIST AND SEARCH
# ============================================

@router.get("", response_model=List[SubscriptionListItem])
def list_subscriptions(
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[SubscriptionStatus] = Query(None, description="Filter by status"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    subcategory_id: Optional[int] = Query(None, description="Filter by subcategory ID"),
    value_level: Optional[ValueLevel] = Query(None, description="Filter by value level"),
    ccm_owner: Optional[str] = Query(None, description="Filter by CCM owner"),
    include_deleted: bool = Query(False, description="Include soft-deleted subscriptions"),
    sort_by: str = Query("subscription_id", description="Sort field"),
    sort_order: str = Query("asc", description="Sort order (asc/desc)"),
    service: SubscriptionService = Depends(get_subscription_service),
):
    """List all subscriptions with optional filtering."""
    subscriptions = service.get_all(
        search=search,
        status=status,
        category_id=category_id,
        subcategory_id=subcategory_id,
        value_level=value_level,
        ccm_owner=ccm_owner,
        sort_by=sort_by,
        sort_order=sort_order,
        include_deleted=include_deleted,
    )

    # Convert to list items with computed fields
    result = []
    for sub in subscriptions:
        item = SubscriptionListItem(
            subscription_id=sub.subscription_id,
            provider=sub.provider,
            category_id=sub.category_id,
            category_name=service.get_category_name(sub),
            subcategory_id=sub.subcategory_id,
            subcategory_name=service.get_subcategory_name(sub),
            status=sub.status,
            ccm_owner=sub.ccm_owner,
            is_deleted=sub.is_deleted,
            renewal_date=sub.renewal_date,
            renewal_status=service.calculate_renewal_status(sub.renewal_date),
            # Access View fields
            link=sub.link,
            authentication=sub.authentication,
            username=sub.username,
            password_masked=service.get_masked_password(sub),
            in_lastpass=sub.in_lastpass,
            access_level_required=sub.access_level_required,
            # Financial View fields
            payment_method=sub.payment_method,
            cost=sub.cost,
            annual_cost=sub.annual_cost,
            payment_frequency=sub.payment_frequency,
            # Communication View fields
            subscriber_email=sub.subscriber_email,
            forward_to=sub.forward_to,
            email_routing=sub.email_routing,
            email_volume_per_week=sub.email_volume_per_week,
            main_vendor_contact=sub.main_vendor_contact,
            # Details View fields
            description_value=sub.description_value,
            value_level=sub.value_level,
            subscription_log=sub.subscription_log,
            actions_todos=sub.actions_todos,
            last_confirmed_alive=sub.last_confirmed_alive,
        )
        result.append(item)

    return result


@router.get("/owners", response_model=List[str])
def list_unique_owners(
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Get list of unique CCM owners for filter dropdown."""
    return service.get_unique_owners()


# ============================================
# IMPORT/EXPORT (must be before /{subscription_id} routes)
# ============================================

@router.get("/export")
def export_subscriptions(
    include_deleted: bool = Query(False, description="Include soft-deleted subscriptions"),
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Export subscriptions to CSV."""
    csv_content = service.export_to_csv(include_deleted=include_deleted)

    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=subscriptions_export.csv"
        },
    )


@router.post("/import", response_model=ImportResult)
async def import_subscriptions(
    file: UploadFile = File(..., description="CSV file to import"),
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Import subscriptions from CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file",
        )

    content = await file.read()
    csv_content = content.decode('utf-8')

    return service.import_from_csv(csv_content)


# ============================================
# CRUD OPERATIONS
# ============================================

@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    data: SubscriptionCreate,
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Create a new subscription."""
    subscription = service.create(data)
    return _to_response(subscription, service)


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def get_subscription(
    subscription_id: str,
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Get a subscription by ID. Returns deobfuscated password."""
    subscription = service.get_by_subscription_id(subscription_id, include_deleted=True)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription {subscription_id} not found",
        )
    return _to_response(subscription, service)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(
    subscription_id: str,
    data: SubscriptionUpdate,
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Update a subscription."""
    subscription = service.get_by_subscription_id(subscription_id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription {subscription_id} not found",
        )

    updated = service.update(subscription, data)
    return _to_response(updated, service)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    subscription_id: str,
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Soft delete a subscription."""
    subscription = service.get_by_subscription_id(subscription_id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription {subscription_id} not found",
        )

    service.soft_delete(subscription)
    return None


@router.post("/{subscription_id}/restore", response_model=SubscriptionResponse)
def restore_subscription(
    subscription_id: str,
    service: SubscriptionService = Depends(get_subscription_service),
):
    """Restore a soft-deleted subscription."""
    subscription = service.get_by_subscription_id(subscription_id, include_deleted=True)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription {subscription_id} not found",
        )

    if not subscription.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is not deleted",
        )

    restored = service.restore(subscription)
    return _to_response(restored, service)


# ============================================
# HELPER FUNCTIONS
# ============================================

def _to_response(subscription, service: SubscriptionService) -> SubscriptionResponse:
    """Convert a Subscription model to SubscriptionResponse with computed fields."""
    return SubscriptionResponse(
        id=subscription.id,
        subscription_id=subscription.subscription_id,
        provider=subscription.provider,
        category_id=subscription.category_id,
        category_name=service.get_category_name(subscription),
        subcategory_id=subscription.subcategory_id,
        subcategory_name=service.get_subcategory_name(subscription),
        link=subscription.link,
        authentication=subscription.authentication,
        username=subscription.username,
        password=service.get_deobfuscated_password(subscription),
        in_lastpass=subscription.in_lastpass,
        status=subscription.status,
        description_value=subscription.description_value,
        value_level=subscription.value_level,
        ccm_owner=subscription.ccm_owner,
        subscription_log=subscription.subscription_log,
        payment_method=subscription.payment_method,
        cost=subscription.cost,
        annual_cost=subscription.annual_cost,
        payment_frequency=subscription.payment_frequency,
        renewal_date=subscription.renewal_date,
        last_confirmed_alive=subscription.last_confirmed_alive,
        main_vendor_contact=subscription.main_vendor_contact,
        subscriber_email=subscription.subscriber_email,
        forward_to=subscription.forward_to,
        email_routing=subscription.email_routing,
        email_volume_per_week=subscription.email_volume_per_week,
        actions_todos=subscription.actions_todos,
        access_level_required=subscription.access_level_required,
        created_at=subscription.created_at,
        updated_at=subscription.updated_at,
        is_deleted=subscription.is_deleted,
        deleted_at=subscription.deleted_at,
    )
