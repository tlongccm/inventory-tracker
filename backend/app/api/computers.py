"""API routes for computer/equipment inventory management."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EquipmentType, Status, UsageType
from ..schemas import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentListItem,
    EquipmentResponse,
    AssignmentHistoryItem,
    ImportResult,
)
from ..services.equipment_service import EquipmentService
from ..services.csv_service import CSVService

router = APIRouter()


# Export to CSV - MUST be before {serial_number} routes to avoid path collision
@router.get("/computers/export")
def export_computers(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    """Export all equipment to CSV file."""
    service = EquipmentService(db)
    csv_service = CSVService(db)

    equipment_list = service.get_all(include_deleted=include_deleted)
    csv_content = csv_service.export_to_csv(equipment_list)

    from datetime import date
    filename = f"equipment_export_{date.today().isoformat()}.csv"

    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# Import from CSV - MUST be before {serial_number} routes to avoid path collision
@router.post("/computers/import", response_model=ImportResult)
async def import_computers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Import equipment records from CSV file."""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    csv_service = CSVService(db)
    content = await file.read()

    try:
        result = csv_service.import_from_csv(content.decode('utf-8'))
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# List all equipment
@router.get("/computers", response_model=List[EquipmentListItem])
def list_computers(
    status: Optional[Status] = None,
    equipment_type: Optional[EquipmentType] = Query(None, alias="equipment_type"),
    usage_type: Optional[UsageType] = None,
    location: Optional[str] = None,
    primary_user: Optional[str] = None,
    model: Optional[str] = None,
    min_rating: Optional[int] = None,
    max_rating: Optional[int] = None,
    sort_by: Optional[str] = Query("equipment_name", regex="^(equipment_id|equipment_name|computer_subtype|primary_user|status|manufacturer|model|location|cpu_model|ram|storage|operating_system|serial_number|cpu_score|score_2d|score_3d|memory_score|disk_score|overall_rating|assignment_date|usage_type|created_at)$"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$"),
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    """List all equipment with optional filtering and sorting."""
    service = EquipmentService(db)
    return service.get_all(
        status=status,
        equipment_type=equipment_type,
        usage_type=usage_type,
        location=location,
        primary_user=primary_user,
        model=model,
        min_rating=min_rating,
        max_rating=max_rating,
        sort_by=sort_by,
        sort_order=sort_order,
        include_deleted=include_deleted,
    )


# Get equipment by identifier (equipment_id or serial_number)
@router.get("/computers/{identifier}", response_model=EquipmentResponse)
def get_computer(identifier: str, db: Session = Depends(get_db)):
    """Get full details of equipment by equipment_id (e.g., PC-0001) or serial_number."""
    service = EquipmentService(db)
    equipment = service.get_by_identifier(identifier)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


# Create new equipment
@router.post("/computers", response_model=EquipmentResponse, status_code=201)
def create_computer(data: EquipmentCreate, db: Session = Depends(get_db)):
    """Create a new equipment record."""
    service = EquipmentService(db)

    # Check for duplicate serial number (only if serial number is provided)
    if data.serial_number:
        existing = service.get_by_serial(data.serial_number, include_deleted=True)
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Serial number '{data.serial_number}' already exists"
            )

    return service.create(data)


# Update equipment
@router.put("/computers/{identifier}", response_model=EquipmentResponse)
def update_computer(
    identifier: str,
    data: EquipmentUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing equipment record by equipment_id or serial_number."""
    service = EquipmentService(db)
    equipment = service.get_by_identifier(identifier)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return service.update(equipment, data)


# Soft delete equipment
@router.delete("/computers/{identifier}", status_code=204)
def delete_computer(identifier: str, db: Session = Depends(get_db)):
    """Soft delete an equipment record by equipment_id or serial_number."""
    service = EquipmentService(db)
    equipment = service.get_by_identifier(identifier)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    service.soft_delete(equipment)


# Restore soft-deleted equipment
@router.post("/computers/{identifier}/restore", response_model=EquipmentResponse)
def restore_computer(identifier: str, db: Session = Depends(get_db)):
    """Restore a soft-deleted equipment record by equipment_id or serial_number."""
    service = EquipmentService(db)
    equipment = service.get_by_identifier(identifier, include_deleted=True)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if not equipment.is_deleted:
        raise HTTPException(status_code=400, detail="Equipment is not deleted")

    return service.restore(equipment)


# Get assignment history
@router.get("/computers/{identifier}/history", response_model=List[AssignmentHistoryItem])
def get_computer_history(identifier: str, db: Session = Depends(get_db)):
    """Get assignment history for equipment by equipment_id or serial_number."""
    service = EquipmentService(db)
    equipment = service.get_by_identifier(identifier, include_deleted=True)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    return service.get_history(equipment)


# List soft-deleted equipment (admin)
@router.get("/admin/deleted", response_model=List[EquipmentListItem])
def list_deleted_computers(db: Session = Depends(get_db)):
    """List all soft-deleted equipment for admin recovery."""
    service = EquipmentService(db)
    return service.get_deleted()
