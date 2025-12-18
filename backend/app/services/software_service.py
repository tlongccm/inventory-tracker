"""Software service for business logic and database operations."""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import func, desc, asc, or_
from sqlalchemy.orm import Session

from ..models.software import Software
from ..schemas.software import SoftwareCreate, SoftwareUpdate


class SoftwareService:
    """Service class for software operations."""

    def __init__(self, db: Session):
        self.db = db

    def generate_software_id(self) -> tuple[str, int]:
        """Generate a unique software ID.

        Returns tuple of (software_id, software_id_num).
        Format: SW-NNNN (e.g., SW-0001, SW-0002)
        """
        # Get max number
        result = self.db.query(func.max(Software.software_id_num)).scalar()

        next_num = (result or 0) + 1
        software_id = f"SW-{next_num:04d}"

        return software_id, next_num

    def get_all(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        type: Optional[str] = None,
        vendor: Optional[str] = None,
        purchaser: Optional[str] = None,
        deployment: Optional[str] = None,
        sort_by: str = "software_id",
        sort_order: str = "asc",
        include_deleted: bool = False,
    ) -> List[Software]:
        """Get all software with optional filtering and sorting."""
        query = self.db.query(Software)

        # Exclude soft-deleted unless requested
        if not include_deleted:
            query = query.filter(Software.is_deleted == False)

        # Universal search across all fields
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Software.software_id.ilike(search_term),
                    Software.category.ilike(search_term),
                    Software.name.ilike(search_term),
                    Software.version.ilike(search_term),
                    Software.key.ilike(search_term),
                    Software.type.ilike(search_term),
                    Software.purchaser.ilike(search_term),
                    Software.vendor.ilike(search_term),
                    Software.deployment.ilike(search_term),
                    Software.install_location.ilike(search_term),
                    Software.status.ilike(search_term),
                    Software.comments.ilike(search_term),
                )
            )

        # Apply filters
        if category:
            query = query.filter(Software.category == category)
        if status:
            query = query.filter(Software.status == status)
        if type:
            query = query.filter(Software.type == type)
        if vendor:
            query = query.filter(Software.vendor.ilike(f"%{vendor}%"))
        if purchaser:
            query = query.filter(Software.purchaser.ilike(f"%{purchaser}%"))
        if deployment:
            query = query.filter(Software.deployment.ilike(f"%{deployment}%"))

        # Apply sorting
        if sort_by == "software_id":
            if sort_order == "desc":
                query = query.order_by(desc(Software.software_id_num))
            else:
                query = query.order_by(asc(Software.software_id_num))
        else:
            sort_column = getattr(Software, sort_by, Software.software_id_num)
            if sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))

        return query.all()

    def get_by_id(
        self,
        id: int,
        include_deleted: bool = False,
    ) -> Optional[Software]:
        """Get software by database ID."""
        query = self.db.query(Software).filter(Software.id == id)

        if not include_deleted:
            query = query.filter(Software.is_deleted == False)

        return query.first()

    def get_by_software_id(
        self,
        software_id: str,
        include_deleted: bool = False,
    ) -> Optional[Software]:
        """Get software by software ID (e.g., SW-0001)."""
        if not software_id:
            return None

        query = self.db.query(Software).filter(
            Software.software_id == software_id
        )

        if not include_deleted:
            query = query.filter(Software.is_deleted == False)

        return query.first()

    def get_deleted(self) -> List[Software]:
        """Get all soft-deleted software."""
        return self.db.query(Software).filter(
            Software.is_deleted == True
        ).all()

    def create(self, data: SoftwareCreate) -> Software:
        """Create a new software record."""
        software_id, software_id_num = self.generate_software_id()

        software = Software(
            software_id=software_id,
            software_id_num=software_id_num,
            **data.model_dump()
        )

        self.db.add(software)
        self.db.commit()
        self.db.refresh(software)

        return software

    def update(self, software: Software, data: SoftwareUpdate) -> Software:
        """Update an existing software record."""
        update_data = data.model_dump(exclude_unset=True)

        # Update software fields
        for field, value in update_data.items():
            setattr(software, field, value)

        self.db.commit()
        self.db.refresh(software)

        return software

    def soft_delete(self, software: Software) -> None:
        """Soft delete a software record."""
        software.is_deleted = True
        software.deleted_at = datetime.utcnow()
        self.db.commit()

    def restore(self, software: Software) -> Software:
        """Restore a soft-deleted software record."""
        software.is_deleted = False
        software.deleted_at = None
        self.db.commit()
        self.db.refresh(software)
        return software
