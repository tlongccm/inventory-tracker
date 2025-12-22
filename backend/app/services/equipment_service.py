"""Equipment service for business logic and database operations."""

from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import func, desc, asc
from sqlalchemy.orm import Session

from ..models import (
    Equipment,
    AssignmentHistory,
    EquipmentType,
    EQUIPMENT_TYPE_PREFIXES,
)
from ..schemas import EquipmentCreate, EquipmentUpdate


class EquipmentService:
    """Service class for equipment operations."""

    def __init__(self, db: Session):
        self.db = db

    def generate_equipment_id(self, equipment_type: EquipmentType) -> tuple[str, int]:
        """Generate a unique equipment ID with type-based prefix.

        Returns tuple of (equipment_id, equipment_id_num).
        Format: {TYPE}-NNNN (e.g., PC-0001, MON-0001)
        """
        prefix = EQUIPMENT_TYPE_PREFIXES[equipment_type]

        # Get max number for this equipment type
        result = self.db.query(func.max(Equipment.equipment_id_num)).filter(
            Equipment.equipment_type == equipment_type
        ).scalar()

        next_num = (result or 0) + 1
        equipment_id = f"{prefix}-{next_num:04d}"

        return equipment_id, next_num

    def get_all(
        self,
        status: Optional[str] = None,
        equipment_type: Optional[EquipmentType] = None,
        usage_type: Optional[str] = None,
        location: Optional[str] = None,
        primary_user: Optional[str] = None,
        model: Optional[str] = None,
        min_rating: Optional[int] = None,
        max_rating: Optional[int] = None,
        sort_by: str = "equipment_name",
        sort_order: str = "asc",
        include_deleted: bool = False,
    ) -> List[Equipment]:
        """Get all equipment with optional filtering and sorting."""
        query = self.db.query(Equipment)

        # Exclude soft-deleted unless requested
        if not include_deleted:
            query = query.filter(Equipment.is_deleted == False)

        # Apply filters
        if status:
            query = query.filter(Equipment.status == status)
        if equipment_type:
            query = query.filter(Equipment.equipment_type == equipment_type)
        if usage_type:
            query = query.filter(Equipment.usage_type == usage_type)
        if location:
            query = query.filter(Equipment.location.ilike(f"%{location}%"))
        if primary_user:
            query = query.filter(Equipment.primary_user.ilike(f"%{primary_user}%"))
        if model:
            query = query.filter(Equipment.model.ilike(f"%{model}%"))
        if min_rating is not None:
            query = query.filter(Equipment.overall_rating >= min_rating)
        if max_rating is not None:
            query = query.filter(Equipment.overall_rating <= max_rating)

        # Apply sorting
        # Special handling for equipment_id - sort by type prefix then numeric portion
        if sort_by == "equipment_id":
            if sort_order == "desc":
                query = query.order_by(desc(Equipment.equipment_type), desc(Equipment.equipment_id_num))
            else:
                query = query.order_by(asc(Equipment.equipment_type), asc(Equipment.equipment_id_num))
        else:
            sort_column = getattr(Equipment, sort_by, Equipment.equipment_name)
            if sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))

        return query.all()

    def get_by_serial(
        self,
        serial_number: str,
        include_deleted: bool = False,
    ) -> Optional[Equipment]:
        """Get equipment by serial number."""
        if not serial_number:
            return None

        query = self.db.query(Equipment).filter(
            Equipment.serial_number == serial_number
        )

        if not include_deleted:
            query = query.filter(Equipment.is_deleted == False)

        return query.first()

    def get_by_equipment_id(
        self,
        equipment_id: str,
        include_deleted: bool = False,
    ) -> Optional[Equipment]:
        """Get equipment by equipment ID (e.g., PC-0001)."""
        if not equipment_id:
            return None

        query = self.db.query(Equipment).filter(
            Equipment.equipment_id == equipment_id
        )

        if not include_deleted:
            query = query.filter(Equipment.is_deleted == False)

        return query.first()

    def get_by_identifier(
        self,
        identifier: str,
        include_deleted: bool = False,
    ) -> Optional[Equipment]:
        """Get equipment by identifier (equipment_id or serial_number).

        Tries equipment_id first (e.g., PC-0001), then falls back to serial_number.
        This supports both the preferred equipment_id lookup and legacy serial_number.
        """
        if not identifier:
            return None

        # Try equipment_id first (preferred, always present)
        equipment = self.get_by_equipment_id(identifier, include_deleted)
        if equipment:
            return equipment

        # Fall back to serial_number (optional field)
        return self.get_by_serial(identifier, include_deleted)

    def get_deleted(self) -> List[Equipment]:
        """Get all soft-deleted equipment."""
        return self.db.query(Equipment).filter(
            Equipment.is_deleted == True
        ).all()

    def create(self, data: EquipmentCreate) -> Equipment:
        """Create a new equipment record."""
        equipment_id, equipment_id_num = self.generate_equipment_id(data.equipment_type)

        equipment = Equipment(
            equipment_id=equipment_id,
            equipment_id_num=equipment_id_num,
            **data.model_dump()
        )

        self.db.add(equipment)
        self.db.commit()
        self.db.refresh(equipment)

        return equipment

    def update(self, equipment: Equipment, data: EquipmentUpdate) -> Equipment:
        """Update an existing equipment record.

        Creates assignment history if assignment fields change.
        """
        update_data = data.model_dump(exclude_unset=True)

        # Check if assignment fields are changing
        assignment_fields = ['primary_user', 'usage_type', 'equipment_name']
        assignment_changed = any(
            field in update_data and getattr(equipment, field) != update_data[field]
            for field in assignment_fields
        )

        # Create history record if assignment changed
        if assignment_changed:
            history = AssignmentHistory(
                equipment_id=equipment.id,
                previous_user=equipment.primary_user,
                previous_usage_type=equipment.usage_type,
                previous_equipment_name=equipment.equipment_name,
                start_date=equipment.assignment_date,
                end_date=date.today(),
            )
            self.db.add(history)

        # Update equipment fields
        for field, value in update_data.items():
            setattr(equipment, field, value)

        self.db.commit()
        self.db.refresh(equipment)

        return equipment

    def soft_delete(self, equipment: Equipment) -> None:
        """Soft delete an equipment record."""
        equipment.is_deleted = True
        equipment.deleted_at = datetime.utcnow()
        self.db.commit()

    def restore(self, equipment: Equipment) -> Equipment:
        """Restore a soft-deleted equipment record."""
        equipment.is_deleted = False
        equipment.deleted_at = None
        self.db.commit()
        self.db.refresh(equipment)
        return equipment

    def get_history(self, equipment: Equipment) -> List[AssignmentHistory]:
        """Get assignment history for equipment ordered by end_date DESC."""
        return self.db.query(AssignmentHistory).filter(
            AssignmentHistory.equipment_id == equipment.id
        ).order_by(desc(AssignmentHistory.end_date)).all()
