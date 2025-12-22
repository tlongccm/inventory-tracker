"""CSV service for import/export operations."""

import csv
import io
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any, Optional, Tuple

from sqlalchemy.orm import Session

from ..models import Equipment, EquipmentType
from ..schemas import (
    ImportResult, ImportError as ImportErrorSchema,
    ImportPreviewResult, ImportPreviewRow, FieldError, PreviewStatus,
    ImportConfirmRequest
)
from ..utils.normalizers import normalize_mac_address, normalize_cpu_speed, to_title_case, normalize_equipment_id
from .validators import validate_ipv4, validate_mac_address, validate_equipment_id, validate_cpu_speed
from .equipment_service import EquipmentService


# CSV column to database field mapping (includes aliases)
CSV_FIELD_MAP = {
    # Primary names
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
    'MAC (LAN)': 'mac_lan',
    'MAC (WLAN)': 'mac_wlan',
    'MAC Address': 'mac_lan',  # Legacy backward compatibility
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
    'Purpose': 'purpose',
    # Aliases for common variations
    'Category': 'equipment_type',
    'Subcategory': 'computer_subtype',
    'CPU Base Speed': 'cpu_speed',
    'Ownership': 'usage_type',
}

# Value mappings for normalization
VALUE_MAPPINGS = {
    'equipment_type': {
        'Computer': 'PC',
        'computer': 'PC',
    },
    'computer_subtype': {
        'Tower': 'Desktop',
        'tower': 'Desktop',
        'SFF': 'Desktop',
        'sff': 'Desktop',
        'PC': 'Desktop',
        'pc': 'Desktop',
    },
    'status': {
        'Inactive - In Storage': 'In Storage',
        'inactive - in storage': 'In Storage',
    },
    'usage_type': {
        'CCM': 'Work',
        'ccm': 'Work',
    },
}

# Reverse mapping for export (use only primary names, not aliases)
FIELD_CSV_MAP = {
    'equipment_id': 'Equipment ID',
    'equipment_type': 'Equipment Type',
    'serial_number': 'Serial Number',
    'model': 'Model',
    'manufacturer': 'Manufacturer',
    'computer_subtype': 'Computer Subtype',
    'cpu_model': 'CPU Model',
    'cpu_speed': 'CPU Speed',
    'operating_system': 'Operating System',
    'ram': 'RAM',
    'storage': 'Storage',
    'video_card': 'Video Card',
    'display_resolution': 'Display Resolution',
    'mac_lan': 'MAC (LAN)',
    'mac_wlan': 'MAC (WLAN)',
    'manufacturing_date': 'Manufacturing Date',
    'acquisition_date': 'Acquisition Date',
    'location': 'Location',
    'cost': 'Cost',
    'cpu_score': 'CPU Score',
    'score_2d': '2D Score',
    'score_3d': '3D Score',
    'memory_score': 'Memory Score',
    'disk_score': 'Disk Score',
    'overall_rating': 'Overall Rating',
    'equipment_name': 'Equipment Name',
    'ip_address': 'IP Address',
    'assignment_date': 'Assignment Date',
    'primary_user': 'Primary User',
    'usage_type': 'Usage Type',
    'status': 'Status',
    'notes': 'Notes',
    'purpose': 'Purpose',
}

# Fields to export (in order)
EXPORT_FIELDS = [
    'equipment_id', 'equipment_type', 'serial_number', 'model', 'manufacturer',
    'computer_subtype', 'cpu_model', 'cpu_speed', 'operating_system',
    'ram', 'storage', 'video_card', 'display_resolution', 'mac_lan', 'mac_wlan',
    'manufacturing_date', 'acquisition_date', 'location', 'cost', 'purpose',
    'cpu_score', 'score_2d', 'score_3d', 'memory_score', 'disk_score', 'overall_rating',
    'equipment_name', 'ip_address', 'assignment_date', 'primary_user', 'usage_type', 'status', 'notes',
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

    def parse_csv_preview(self, csv_content: str) -> ImportPreviewResult:
        """Parse CSV and return preview with validation results.

        Returns categorized rows:
        - validated_rows: Ready to import
        - problematic_rows: Has validation errors
        - duplicate_rows: Equipment ID already exists
        """
        validated_rows: List[ImportPreviewRow] = []
        problematic_rows: List[ImportPreviewRow] = []
        duplicate_rows: List[ImportPreviewRow] = []
        csv_columns: List[str] = []

        reader = csv.DictReader(io.StringIO(csv_content))
        csv_columns = list(reader.fieldnames or [])

        for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
            # Skip rows where all values are empty or whitespace
            if not any(v.strip() for v in row.values() if v):
                continue

            preview_row = self._validate_row(row_num, row)

            # Skip rows that have no meaningful equipment data after mapping
            if not preview_row.data or not any(
                preview_row.data.get(f) for f in ['equipment_id', 'equipment_type', 'serial_number', 'model', 'manufacturer', 'equipment_name']
            ):
                continue

            if preview_row.status == PreviewStatus.VALIDATED:
                validated_rows.append(preview_row)
            elif preview_row.status == PreviewStatus.DUPLICATE:
                duplicate_rows.append(preview_row)
            else:
                problematic_rows.append(preview_row)

        return ImportPreviewResult(
            total_rows=len(validated_rows) + len(problematic_rows) + len(duplicate_rows),
            validated_rows=validated_rows,
            problematic_rows=problematic_rows,
            duplicate_rows=duplicate_rows,
            csv_columns=csv_columns,
        )

    def _validate_row(self, row_num: int, row: Dict[str, str]) -> ImportPreviewRow:
        """Validate a single CSV row and return preview row with status."""
        errors: List[FieldError] = []
        normalized_values: Dict[str, str] = {}
        original_values: Dict[str, str] = {}

        # Map CSV columns to database fields
        data: Dict[str, Any] = {}
        for csv_col, db_field in CSV_FIELD_MAP.items():
            if csv_col in row and row[csv_col]:
                value = row[csv_col].strip()
                data[db_field] = value
                original_values[db_field] = value

        # Apply value mappings
        for field, mappings in VALUE_MAPPINGS.items():
            if field in data and data[field] in mappings:
                data[field] = mappings[data[field]]
                normalized_values[field] = data[field]

        # Get or generate equipment ID
        equipment_id = data.get('equipment_id', '')
        if equipment_id:
            # Normalize to uppercase
            equipment_id = normalize_equipment_id(equipment_id) or equipment_id
            data['equipment_id'] = equipment_id
            if original_values.get('equipment_id', '').upper() != equipment_id:
                normalized_values['equipment_id'] = equipment_id

            # Validate format
            is_valid, error_msg = validate_equipment_id(equipment_id)
            if not is_valid:
                errors.append(FieldError(
                    field='equipment_id',
                    value=original_values.get('equipment_id', equipment_id),
                    message=error_msg or "Invalid Equipment ID format",
                ))
        else:
            # Will auto-generate - need equipment_type for this
            equipment_type = data.get('equipment_type', '')
            if equipment_type:
                try:
                    eq_type = EquipmentType(equipment_type)
                    generated_id, _ = self.equipment_service.generate_equipment_id(eq_type)
                    equipment_id = generated_id
                    data['equipment_id'] = equipment_id
                    normalized_values['equipment_id'] = f"{equipment_id} (auto)"
                except ValueError:
                    pass

        # Validate IP address
        ip_address = data.get('ip_address', '')
        if ip_address:
            is_valid, error_msg = validate_ipv4(ip_address)
            if not is_valid:
                errors.append(FieldError(
                    field='ip_address',
                    value=ip_address,
                    message=error_msg or "Invalid IPv4 address format",
                ))

        # Validate and normalize MAC addresses (both LAN and WLAN)
        for mac_field in ['mac_lan', 'mac_wlan']:
            mac_value = data.get(mac_field, '')
            if mac_value:
                is_valid, error_msg = validate_mac_address(mac_value)
                if not is_valid:
                    errors.append(FieldError(
                        field=mac_field,
                        value=mac_value,
                        message=error_msg or "Invalid MAC address format",
                    ))
                else:
                    normalized = normalize_mac_address(mac_value)
                    if normalized and normalized != mac_value:
                        data[mac_field] = normalized
                        normalized_values[mac_field] = normalized

        # Normalize CPU speed
        cpu_speed = data.get('cpu_speed', '')
        if cpu_speed:
            normalized = normalize_cpu_speed(cpu_speed)
            if normalized and normalized != cpu_speed:
                data['cpu_speed'] = normalized
                normalized_values['cpu_speed'] = normalized

        # Apply title case to extensible enum fields
        for field in ['computer_subtype', 'status', 'usage_type']:
            if field in data and data[field]:
                normalized = to_title_case(data[field])
                if normalized and normalized != data[field]:
                    data[field] = normalized
                    normalized_values[field] = normalized

        # Check for duplicate equipment ID
        is_duplicate = False
        if equipment_id and not errors:
            existing = self.equipment_service.get_by_equipment_id(equipment_id, include_deleted=True)
            if existing:
                is_duplicate = True

        # Determine status
        if errors:
            status = PreviewStatus.PROBLEMATIC
        elif is_duplicate:
            status = PreviewStatus.DUPLICATE
        else:
            status = PreviewStatus.VALIDATED

        return ImportPreviewRow(
            row_number=row_num,
            equipment_id=equipment_id or "(will auto-generate)",
            data=data,
            status=status,
            errors=errors,
            normalized_values=normalized_values if normalized_values else None,
            original_values=original_values if original_values else None,
        )

    def validate_single_row(self, data: Dict[str, Any], row_number: int = 0) -> ImportPreviewRow:
        """Validate a single row (for inline editing in preview)."""
        # Convert data dict to CSV row format
        row: Dict[str, str] = {}
        for db_field, value in data.items():
            # Find CSV column name for this field
            csv_col = FIELD_CSV_MAP.get(db_field, db_field)
            row[csv_col] = str(value) if value is not None else ''

        return self._validate_row(row_number, row)

    def confirm_import(self, request: ImportConfirmRequest) -> ImportResult:
        """Import the confirmed rows from preview."""
        result = ImportResult(
            total_rows=len(request.rows),
            created=0,
            updated=0,
            restored=0,
            failed=0,
            errors=[],
        )

        for row_data in request.rows:
            try:
                self._process_import_row(row_data.row_number, row_data.data, result)
            except Exception as e:
                result.failed += 1
                result.errors.append(ImportErrorSchema(
                    row=row_data.row_number,
                    serial_number=str(row_data.data.get('serial_number', '')),
                    error=str(e),
                ))

        return result

    def import_from_csv(self, csv_content: str) -> ImportResult:
        """Import equipment from CSV content (legacy direct import).

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
            # Skip empty rows (all values are empty or whitespace)
            if not any(v.strip() for v in row.values() if v):
                continue

            result.total_rows += 1

            # Map CSV columns to database fields
            data: Dict[str, Any] = {}
            for csv_col, db_field in CSV_FIELD_MAP.items():
                if csv_col in row and row[csv_col]:
                    data[db_field] = row[csv_col]

            # Apply value mappings
            for field, mappings in VALUE_MAPPINGS.items():
                if field in data and data[field] in mappings:
                    data[field] = mappings[data[field]]

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
                result.errors.append(ImportErrorSchema(
                    row=row_num,
                    serial_number=str(serial_number),
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

        # Apply normalizations for MAC addresses
        for mac_field in ['mac_lan', 'mac_wlan']:
            if mac_field in processed_data:
                processed_data[mac_field] = normalize_mac_address(processed_data[mac_field])
        if 'cpu_speed' in processed_data:
            processed_data['cpu_speed'] = normalize_cpu_speed(processed_data['cpu_speed'])
        for field in ['computer_subtype', 'status', 'usage_type']:
            if field in processed_data:
                processed_data[field] = to_title_case(processed_data[field])

        # Check if equipment exists - try Equipment ID first, then Serial Number
        existing = None
        if equipment_id:
            normalized_id = normalize_equipment_id(equipment_id)
            existing = self.equipment_service.get_by_equipment_id(
                normalized_id or equipment_id,
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
        result: Dict[str, Any] = {}

        for field, value in data.items():
            if value is None or value == '':
                continue

            # Skip equipment_id (auto-generated)
            if field == 'equipment_id':
                continue

            # Apply value mappings first
            if field in VALUE_MAPPINGS and value in VALUE_MAPPINGS[field]:
                value = VALUE_MAPPINGS[field][value]

            # String fields (now including former enum fields)
            if field in ('equipment_type', 'computer_subtype', 'status', 'usage_type', 'purpose'):
                result[field] = str(value)
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
