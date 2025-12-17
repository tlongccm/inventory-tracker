"""CSV service for import/export operations."""

import csv
import io
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any

from sqlalchemy.orm import Session

from ..models import Equipment, EquipmentType, ComputerSubtype, Status, UsageType
from ..schemas import ImportResult, ImportError
from .equipment_service import EquipmentService


# CSV column to database field mapping
CSV_FIELD_MAP = {
    'Equipment ID': 'equipment_id',
    'Equipment Type': 'equipment_type',
    'Serial Number': 'serial_number',
    'Model': 'model',
    'Manufacturer': 'manufacturer',
    'Computer Subtype': 'computer_subtype',
    'CPU Model': 'cpu_model',
    'CPU Speed': 'cpu_speed',
    'Operating System': 'operating_system',
    'RAM': 'ram',
    'Storage': 'storage',
    'Video Card': 'video_card',
    'Display Resolution': 'display_resolution',
    'MAC Address': 'mac_address',
    'Manufacturing Date': 'manufacturing_date',
    'Acquisition Date': 'acquisition_date',
    'Location': 'location',
    'Cost': 'cost',
    'CPU Score': 'cpu_score',
    '2D Score': 'score_2d',
    '3D Score': 'score_3d',
    'Memory Score': 'memory_score',
    'Disk Score': 'disk_score',
    'Overall Rating': 'overall_rating',
    'Equipment Name': 'equipment_name',
    'IP Address': 'ip_address',
    'Assignment Date': 'assignment_date',
    'Primary User': 'primary_user',
    'Usage Type': 'usage_type',
    'Status': 'status',
    'Notes': 'notes',
}

# Reverse mapping for export
FIELD_CSV_MAP = {v: k for k, v in CSV_FIELD_MAP.items()}

# Fields to export (in order)
EXPORT_FIELDS = [
    'equipment_id', 'equipment_type', 'serial_number', 'model', 'manufacturer',
    'computer_subtype', 'cpu_model', 'cpu_speed', 'operating_system',
    'ram', 'storage', 'video_card', 'display_resolution', 'mac_address',
    'manufacturing_date', 'acquisition_date', 'location', 'cost', 'cpu_score', 'score_2d', 'score_3d',
    'memory_score', 'disk_score', 'overall_rating', 'equipment_name', 'ip_address',
    'assignment_date', 'primary_user', 'usage_type', 'status', 'notes',
]


class CSVService:
    """Service for CSV import/export operations."""

    def __init__(self, db: Session):
        self.db = db
        self.equipment_service = EquipmentService(db)

    def export_to_csv(self, equipment_list: List[Equipment]) -> str:
        """Export equipment list to CSV string."""
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        headers = [FIELD_CSV_MAP.get(f, f) for f in EXPORT_FIELDS]
        writer.writerow(headers)

        # Write data rows
        for equipment in equipment_list:
            row = []
            for field in EXPORT_FIELDS:
                value = getattr(equipment, field, None)

                # Handle enum values
                if hasattr(value, 'value'):
                    value = value.value
                # Handle date/datetime
                elif isinstance(value, (date, datetime)):
                    value = value.isoformat()
                # Handle Decimal
                elif isinstance(value, Decimal):
                    value = str(value)
                # Handle None
                elif value is None:
                    value = ''

                row.append(value)
            writer.writerow(row)

        return output.getvalue()

    def import_from_csv(self, csv_content: str) -> ImportResult:
        """Import equipment from CSV content.

        Creates new records or updates existing by serial number.
        Restores soft-deleted records if serial number matches.
        """
        result = ImportResult(
            total_rows=0,
            created=0,
            updated=0,
            restored=0,
            failed=0,
            errors=[],
        )

        reader = csv.DictReader(io.StringIO(csv_content))

        # Track serial numbers to handle duplicates (use last occurrence)
        rows_by_serial: Dict[str, tuple[int, Dict[str, Any]]] = {}

        for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
            result.total_rows += 1

            # Map CSV columns to database fields
            data = {}
            for csv_col, db_field in CSV_FIELD_MAP.items():
                if csv_col in row and row[csv_col]:
                    data[db_field] = row[csv_col]

            # Use equipment_id as primary key if available, otherwise serial_number
            equipment_id = data.get('equipment_id')
            serial_number = data.get('serial_number')

            # Determine unique key for deduplication (equipment_id preferred, then serial_number)
            unique_key = equipment_id or serial_number or f"row_{row_num}"

            # Track by unique key (last occurrence wins)
            rows_by_serial[unique_key] = (row_num, data)

        # Process unique serial numbers
        for serial_number, (row_num, data) in rows_by_serial.items():
            try:
                self._process_import_row(row_num, data, result)
            except Exception as e:
                result.failed += 1
                result.errors.append(ImportError(
                    row=row_num,
                    serial_number=serial_number,
                    error=str(e),
                ))

        return result

    def _process_import_row(
        self,
        row_num: int,
        data: Dict[str, Any],
        result: ImportResult,
    ) -> None:
        """Process a single import row."""
        equipment_id = data.get('equipment_id')
        serial_number = data.get('serial_number')

        # Convert and validate data
        processed_data = self._convert_import_data(data)

        # Check if equipment exists - try Equipment ID first, then Serial Number
        existing = None
        if equipment_id:
            existing = self.equipment_service.get_by_equipment_id(
                equipment_id,
                include_deleted=True,
            )
        if not existing and serial_number:
            existing = self.equipment_service.get_by_serial(
                serial_number,
                include_deleted=True,
            )

        if existing:
            # Update existing record
            was_deleted = existing.is_deleted

            # Restore if soft-deleted
            if was_deleted:
                existing.is_deleted = False
                existing.deleted_at = None
                result.restored += 1
            else:
                result.updated += 1

            # Update fields (except equipment_id which is auto-generated, and equipment_type which is immutable)
            for field, value in processed_data.items():
                if field not in ('equipment_id', 'equipment_type'):
                    setattr(existing, field, value)

            # Also update serial_number if provided (but not equipment_type)
            if serial_number and existing.serial_number != serial_number:
                existing.serial_number = serial_number

            self.db.commit()
        else:
            # Create new record
            equipment_type = processed_data.get('equipment_type')
            if not equipment_type:
                raise ValueError('Missing required field: Equipment Type')

            # Parse equipment type
            try:
                eq_type = EquipmentType(equipment_type)
            except ValueError:
                raise ValueError(f'Invalid Equipment Type: {equipment_type}')

            new_equipment_id, equipment_id_num = self.equipment_service.generate_equipment_id(eq_type)

            equipment = Equipment(
                equipment_id=new_equipment_id,
                equipment_id_num=equipment_id_num,
                serial_number=serial_number if serial_number else None,
                equipment_type=eq_type,
            )

            # Set other fields
            for field, value in processed_data.items():
                if field not in ('equipment_id', 'serial_number', 'equipment_type'):
                    setattr(equipment, field, value)

            self.db.add(equipment)
            self.db.commit()
            result.created += 1

    def _convert_import_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert CSV string values to appropriate Python types."""
        result = {}

        for field, value in data.items():
            if value is None or value == '':
                continue

            # Skip equipment_id (auto-generated)
            if field == 'equipment_id':
                continue

            # Convert enum fields
            if field == 'equipment_type':
                result[field] = value
            elif field == 'computer_subtype':
                try:
                    result[field] = ComputerSubtype(value)
                except ValueError:
                    pass
            elif field == 'status':
                try:
                    result[field] = Status(value)
                except ValueError:
                    pass
            elif field == 'usage_type':
                try:
                    result[field] = UsageType(value)
                except ValueError:
                    pass
            # Convert date fields
            elif field in ('manufacturing_date', 'acquisition_date', 'assignment_date'):
                try:
                    result[field] = date.fromisoformat(value)
                except ValueError:
                    pass
            # Convert numeric fields
            elif field == 'cost':
                try:
                    result[field] = Decimal(value)
                except InvalidOperation:
                    pass
            elif field in ('cpu_score', 'score_2d', 'score_3d', 'memory_score', 'disk_score', 'overall_rating'):
                try:
                    result[field] = int(value)
                except ValueError:
                    pass
            else:
                result[field] = value

        return result
