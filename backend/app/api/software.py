"""API routes for software inventory management."""

import io
import csv
from datetime import date
from decimal import Decimal, InvalidOperation
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.software import (
    SoftwareCreate,
    SoftwareUpdate,
    SoftwareListItem,
    SoftwareResponse,
    SoftwareImportResult,
    SoftwareImportError,
)
from ..services.software_service import SoftwareService

router = APIRouter()


# Export to CSV - MUST be before {identifier} routes to avoid path collision
@router.get("/software/export")
def export_software(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    """Export all software to CSV file."""
    service = SoftwareService(db)
    software_list = service.get_all(include_deleted=include_deleted)

    # Define CSV columns (excluding auto-generated fields)
    columns = [
        'software_id', 'category', 'name', 'version', 'key', 'type',
        'purchase_date', 'purchaser', 'vendor', 'cost', 'deployment',
        'install_location', 'status', 'comments'
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=columns)
    writer.writeheader()

    for software in software_list:
        row = {
            'software_id': software.software_id,
            'category': software.category or '',
            'name': software.name,
            'version': software.version or '',
            'key': software.key or '',
            'type': software.type or '',
            'purchase_date': software.purchase_date.isoformat() if software.purchase_date else '',
            'purchaser': software.purchaser or '',
            'vendor': software.vendor or '',
            'cost': str(software.cost) if software.cost else '',
            'deployment': software.deployment or '',
            'install_location': software.install_location or '',
            'status': software.status or '',
            'comments': software.comments or '',
        }
        writer.writerow(row)

    csv_content = output.getvalue()
    filename = f"software_export_{date.today().isoformat()}.csv"

    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# Import from CSV - MUST be before {identifier} routes to avoid path collision
@router.post("/software/import", response_model=SoftwareImportResult)
async def import_software(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Import software records from CSV file."""
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    service = SoftwareService(db)
    content = await file.read()

    try:
        csv_text = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")

    reader = csv.DictReader(io.StringIO(csv_text))

    success_count = 0
    errors: List[SoftwareImportError] = []

    for row_num, row in enumerate(reader, start=2):  # Start at 2 (1 is header)
        try:
            # Parse and validate required field
            name = row.get('name', '').strip()
            if not name:
                errors.append(SoftwareImportError(
                    row=row_num,
                    field='name',
                    message='Name is required'
                ))
                continue

            # Parse optional fields
            purchase_date = None
            if row.get('purchase_date'):
                try:
                    purchase_date = date.fromisoformat(row['purchase_date'].strip())
                except ValueError:
                    errors.append(SoftwareImportError(
                        row=row_num,
                        field='purchase_date',
                        message='Invalid date format (expected YYYY-MM-DD)'
                    ))
                    continue

            cost = None
            if row.get('cost'):
                try:
                    cost = Decimal(row['cost'].strip())
                except InvalidOperation:
                    errors.append(SoftwareImportError(
                        row=row_num,
                        field='cost',
                        message='Invalid cost value'
                    ))
                    continue

            # Create software entry
            software_data = SoftwareCreate(
                category=row.get('category', '').strip() or None,
                name=name,
                version=row.get('version', '').strip() or None,
                key=row.get('key', '').strip() or None,
                type=row.get('type', '').strip() or None,
                purchase_date=purchase_date,
                purchaser=row.get('purchaser', '').strip() or None,
                vendor=row.get('vendor', '').strip() or None,
                cost=cost,
                deployment=row.get('deployment', '').strip() or None,
                install_location=row.get('install_location', '').strip() or None,
                status=row.get('status', '').strip() or None,
                comments=row.get('comments', '').strip() or None,
            )

            service.create(software_data)
            success_count += 1

        except Exception as e:
            errors.append(SoftwareImportError(
                row=row_num,
                field=None,
                message=str(e)
            ))

    return SoftwareImportResult(
        success_count=success_count,
        error_count=len(errors),
        errors=errors
    )


# List all software
@router.get("/software", response_model=List[SoftwareListItem])
def list_software(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    vendor: Optional[str] = None,
    purchaser: Optional[str] = None,
    deployment: Optional[str] = None,
    sort_by: Optional[str] = Query(
        "software_id",
        regex="^(software_id|category|name|version|type|vendor|status|purchase_date|created_at)$"
    ),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$"),
    include_deleted: bool = False,
    db: Session = Depends(get_db),
):
    """List all software with optional filtering and sorting."""
    service = SoftwareService(db)
    return service.get_all(
        search=search,
        category=category,
        status=status,
        type=type,
        vendor=vendor,
        purchaser=purchaser,
        deployment=deployment,
        sort_by=sort_by,
        sort_order=sort_order,
        include_deleted=include_deleted,
    )


# Get software by identifier (software_id)
@router.get("/software/{identifier}", response_model=SoftwareResponse)
def get_software(identifier: str, db: Session = Depends(get_db)):
    """Get full details of software by software_id (e.g., SW-0001)."""
    service = SoftwareService(db)
    software = service.get_by_software_id(identifier)
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")
    return software


# Create new software
@router.post("/software", response_model=SoftwareResponse, status_code=201)
def create_software(data: SoftwareCreate, db: Session = Depends(get_db)):
    """Create a new software record."""
    service = SoftwareService(db)
    return service.create(data)


# Update software
@router.put("/software/{identifier}", response_model=SoftwareResponse)
def update_software(
    identifier: str,
    data: SoftwareUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing software record by software_id."""
    service = SoftwareService(db)
    software = service.get_by_software_id(identifier)
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")

    return service.update(software, data)


# Soft delete software
@router.delete("/software/{identifier}")
def delete_software(identifier: str, db: Session = Depends(get_db)):
    """Soft delete a software record by software_id."""
    service = SoftwareService(db)
    software = service.get_by_software_id(identifier)
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")

    service.soft_delete(software)
    return {"message": f"Software {identifier} deleted successfully"}


# Restore soft-deleted software
@router.post("/software/{id}/restore", response_model=SoftwareResponse)
def restore_software(id: int, db: Session = Depends(get_db)):
    """Restore a soft-deleted software record by database ID."""
    service = SoftwareService(db)
    software = service.get_by_id(id, include_deleted=True)
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")
    if not software.is_deleted:
        raise HTTPException(status_code=400, detail="Software is not deleted")

    return service.restore(software)


# List soft-deleted software (admin)
@router.get("/admin/deleted-software", response_model=List[SoftwareListItem])
def list_deleted_software(db: Session = Depends(get_db)):
    """List all soft-deleted software for admin recovery."""
    service = SoftwareService(db)
    return service.get_deleted()
