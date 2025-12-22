"""API routes for computer/equipment inventory management."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EquipmentType
from ..schemas import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentListItem,
    EquipmentResponse,
    AssignmentHistoryItem,
    ImportResult,
    ImportPreviewResult,
    ImportPreviewRow,
    ImportConfirmRequest,
    ValidateRowRequest,
    ValidateFieldRequest,
    ValidateFieldResponse,
)
from ..services.equipment_service import EquipmentService
from ..services.csv_service import CSVService
from ..services.validators import validate_ipv4, validate_mac_address, validate_equipment_id, validate_cpu_speed
from ..utils.normalizers import normalize_mac_address, normalize_cpu_speed, to_title_case

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
    """Import equipment records from CSV file (legacy direct import)."""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    csv_service = CSVService(db)
    content = await file.read()

    try:
        result = csv_service.import_from_csv(content.decode('utf-8'))
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Import Preview - Parse and validate CSV, return categorized rows
@router.post("/computers/import/preview", response_model=ImportPreviewResult)
async def preview_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Preview CSV import with validation.

    Parses and validates CSV file, returning categorized rows:
    - validated_rows: Ready to import
    - problematic_rows: Has validation errors (user can fix)
    - duplicate_rows: Equipment ID already exists (skip or fix)
    """
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    csv_service = CSVService(db)
    content = await file.read()

    try:
        result = csv_service.parse_csv_preview(content.decode('utf-8'))
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Validate single row - for inline editing in preview
@router.post("/computers/validate/row", response_model=ImportPreviewRow)
def validate_row(
    request: ValidateRowRequest,
    db: Session = Depends(get_db),
):
    """Validate a single row (for inline editing in preview).

    Used when user edits a problematic row in the preview to re-validate it.
    """
    csv_service = CSVService(db)
    return csv_service.validate_single_row(request.data, request.row_number or 0)


# Validate single field - for real-time form validation
@router.post("/computers/validate/field", response_model=ValidateFieldResponse)
def validate_field(request: ValidateFieldRequest):
    """Validate a single field value.

    Returns validation result with normalized value if applicable.
    """
    field = request.field
    value = request.value

    if field == 'ip_address':
        is_valid, error = validate_ipv4(value)
        return ValidateFieldResponse(
            valid=is_valid,
            normalized_value=value if is_valid else None,
            error=error,
        )

    elif field == 'mac_address':
        is_valid, error = validate_mac_address(value)
        normalized = normalize_mac_address(value) if is_valid else None
        return ValidateFieldResponse(
            valid=is_valid,
            normalized_value=normalized,
            error=error,
        )

    elif field == 'equipment_id':
        is_valid, error = validate_equipment_id(value)
        return ValidateFieldResponse(
            valid=is_valid,
            normalized_value=value.upper() if is_valid and value else None,
            error=error,
        )

    elif field == 'cpu_speed':
        is_valid, error = validate_cpu_speed(value)
        normalized = normalize_cpu_speed(value) if is_valid else None
        return ValidateFieldResponse(
            valid=is_valid,
            normalized_value=normalized,
            error=error,
        )

    elif field in ('computer_subtype', 'status', 'usage_type'):
        # Title case normalization
        normalized = to_title_case(value)
        return ValidateFieldResponse(
            valid=True,
            normalized_value=normalized,
        )

    else:
        # Unknown field, just return as valid
        return ValidateFieldResponse(valid=True, normalized_value=value)


# Confirm import - import selected rows from preview
@router.post("/computers/import/confirm", response_model=ImportResult)
def confirm_import(
    request: ImportConfirmRequest,
    db: Session = Depends(get_db),
):
    """Confirm and execute import.

    Imports the selected rows from the preview. Rows must have passed
    validation or been fixed by the user.
    """
    csv_service = CSVService(db)
    return csv_service.confirm_import(request)


# List all equipment
@router.get("/computers", response_model=List[EquipmentListItem])
def list_computers(
    status: Optional[str] = None,
    equipment_type: Optional[EquipmentType] = Query(None, alias="equipment_type"),
    usage_type: Optional[str] = None,
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
