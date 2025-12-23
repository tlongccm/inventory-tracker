"""Subscription service for business logic and database operations."""

from datetime import date, datetime, timedelta
from typing import List, Optional, Literal
from decimal import Decimal
import csv
import io
from sqlalchemy import func, desc, asc, or_
from sqlalchemy.orm import Session

from ..models import Subscription, SubscriptionStatus, ValueLevel, PaymentFrequency, Category, Subcategory
from ..schemas import SubscriptionCreate, SubscriptionUpdate
from ..schemas.subscription import ImportResult, ImportError
from .password import obfuscate_password, deobfuscate_password, mask_password


class SubscriptionService:
    """Service class for subscription operations."""

    def __init__(self, db: Session):
        self.db = db

    def generate_subscription_id(self) -> tuple[str, int]:
        """Generate a unique subscription ID.

        Returns tuple of (subscription_id, subscription_id_num).
        Format: SUB-NNNN (e.g., SUB-0001, SUB-0002)
        """
        # Get max number for subscriptions
        result = self.db.query(func.max(Subscription.subscription_id_num)).scalar()

        next_num = (result or 0) + 1
        subscription_id = f"SUB-{next_num:04d}"

        return subscription_id, next_num

    def calculate_renewal_status(
        self,
        renewal_date: Optional[date],
    ) -> Optional[Literal['ok', 'warning', 'urgent', 'overdue']]:
        """Calculate renewal status based on renewal date.

        Returns:
            - 'ok': More than 30 days until renewal
            - 'warning': 30 days or less until renewal
            - 'urgent': 7 days or less until renewal
            - 'overdue': Past renewal date
            - None: No renewal date set
        """
        if not renewal_date:
            return None

        today = date.today()
        days_until = (renewal_date - today).days

        if days_until < 0:
            return 'overdue'
        elif days_until <= 7:
            return 'urgent'
        elif days_until <= 30:
            return 'warning'
        else:
            return 'ok'

    def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[SubscriptionStatus] = None,
        category_id: Optional[int] = None,
        subcategory_id: Optional[int] = None,
        value_level: Optional[ValueLevel] = None,
        ccm_owner: Optional[str] = None,
        sort_by: str = "subscription_id",
        sort_order: str = "asc",
        include_deleted: bool = False,
    ) -> List[Subscription]:
        """Get all subscriptions with optional filtering and sorting."""
        query = self.db.query(Subscription)

        # Exclude soft-deleted unless requested
        if not include_deleted:
            query = query.filter(Subscription.is_deleted == False)

        # Apply filters
        if status:
            query = query.filter(Subscription.status == status)
        if category_id:
            query = query.filter(Subscription.category_id == category_id)
        if subcategory_id:
            query = query.filter(Subscription.subcategory_id == subcategory_id)
        if value_level:
            query = query.filter(Subscription.value_level == value_level)
        if ccm_owner:
            query = query.filter(Subscription.ccm_owner.ilike(f"%{ccm_owner}%"))

        # Apply search across multiple fields
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Subscription.subscription_id.ilike(search_term),
                    Subscription.provider.ilike(search_term),
                    Subscription.username.ilike(search_term),
                    Subscription.ccm_owner.ilike(search_term),
                    Subscription.description_value.ilike(search_term),
                    Subscription.subscriber_email.ilike(search_term),
                    Subscription.main_vendor_contact.ilike(search_term),
                )
            )

        # Apply sorting
        if sort_by == "subscription_id":
            if sort_order == "desc":
                query = query.order_by(desc(Subscription.subscription_id_num))
            else:
                query = query.order_by(asc(Subscription.subscription_id_num))
        else:
            sort_column = getattr(Subscription, sort_by, Subscription.subscription_id_num)
            if sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))

        return query.all()

    def get_by_subscription_id(
        self,
        subscription_id: str,
        include_deleted: bool = False,
    ) -> Optional[Subscription]:
        """Get subscription by subscription ID (e.g., SUB-0001)."""
        if not subscription_id:
            return None

        query = self.db.query(Subscription).filter(
            Subscription.subscription_id == subscription_id
        )

        if not include_deleted:
            query = query.filter(Subscription.is_deleted == False)

        return query.first()

    def get_deleted(self) -> List[Subscription]:
        """Get all soft-deleted subscriptions."""
        return self.db.query(Subscription).filter(
            Subscription.is_deleted == True
        ).all()

    def create(self, data: SubscriptionCreate) -> Subscription:
        """Create a new subscription record."""
        subscription_id, subscription_id_num = self.generate_subscription_id()

        # Convert data to dict and handle password obfuscation
        sub_data = data.model_dump()
        if sub_data.get('password'):
            sub_data['password'] = obfuscate_password(sub_data['password'])

        subscription = Subscription(
            subscription_id=subscription_id,
            subscription_id_num=subscription_id_num,
            **sub_data
        )

        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)

        return subscription

    def update(self, subscription: Subscription, data: SubscriptionUpdate) -> Subscription:
        """Update an existing subscription record."""
        update_data = data.model_dump(exclude_unset=True)

        # Handle password obfuscation
        if 'password' in update_data:
            if update_data['password']:
                update_data['password'] = obfuscate_password(update_data['password'])

        # Update subscription fields
        for field, value in update_data.items():
            setattr(subscription, field, value)

        self.db.commit()
        self.db.refresh(subscription)

        return subscription

    def soft_delete(self, subscription: Subscription) -> None:
        """Soft delete a subscription record."""
        subscription.is_deleted = True
        subscription.deleted_at = datetime.utcnow()
        self.db.commit()

    def restore(self, subscription: Subscription) -> Subscription:
        """Restore a soft-deleted subscription record."""
        subscription.is_deleted = False
        subscription.deleted_at = None
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def get_deobfuscated_password(self, subscription: Subscription) -> Optional[str]:
        """Get the deobfuscated password for a subscription."""
        return deobfuscate_password(subscription.password)

    def get_masked_password(self, subscription: Subscription) -> str:
        """Get a masked version of the password for display."""
        password = deobfuscate_password(subscription.password)
        return mask_password(password)

    def get_category_name(self, subscription: Subscription) -> Optional[str]:
        """Get the category name for a subscription."""
        if subscription.category:
            return subscription.category.name
        return None

    def get_subcategory_name(self, subscription: Subscription) -> Optional[str]:
        """Get the subcategory name for a subscription."""
        if subscription.subcategory:
            return subscription.subcategory.name
        return None

    def get_unique_owners(self) -> List[str]:
        """Get a list of unique CCM owners for filtering."""
        result = self.db.query(Subscription.ccm_owner).filter(
            Subscription.ccm_owner.isnot(None),
            Subscription.is_deleted == False,
        ).distinct().all()

        return sorted([r[0] for r in result if r[0]])

    # ============================================
    # CSV IMPORT/EXPORT
    # ============================================

    def export_to_csv(self, include_deleted: bool = False) -> str:
        """Export subscriptions to CSV format.

        Returns CSV content as a string.
        """
        subscriptions = self.get_all(include_deleted=include_deleted)

        output = io.StringIO()
        fieldnames = [
            'subscription_id', 'provider', 'category_name', 'subcategory_name',
            'link', 'authentication', 'username', 'password', 'in_lastpass',
            'status', 'description_value', 'value_level', 'ccm_owner',
            'subscription_log', 'payment_method', 'cost', 'annual_cost',
            'payment_frequency', 'renewal_date', 'subscriber_email',
            'forward_to', 'email_routing', 'email_volume_per_week',
            'main_vendor_contact', 'actions_todos', 'last_confirmed_alive',
            'access_level_required', 'is_deleted',
        ]

        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for sub in subscriptions:
            row = {
                'subscription_id': sub.subscription_id,
                'provider': sub.provider,
                'category_name': self.get_category_name(sub),
                'subcategory_name': self.get_subcategory_name(sub),
                'link': sub.link,
                'authentication': sub.authentication,
                'username': sub.username,
                'password': deobfuscate_password(sub.password),  # Export plaintext
                'in_lastpass': 'Yes' if sub.in_lastpass else ('No' if sub.in_lastpass is False else ''),
                'status': sub.status.value if sub.status else '',
                'description_value': sub.description_value,
                'value_level': sub.value_level.value if sub.value_level else '',
                'ccm_owner': sub.ccm_owner,
                'subscription_log': sub.subscription_log,
                'payment_method': sub.payment_method,
                'cost': sub.cost,
                'annual_cost': str(sub.annual_cost) if sub.annual_cost else '',
                'payment_frequency': sub.payment_frequency.value if sub.payment_frequency else '',
                'renewal_date': sub.renewal_date.isoformat() if sub.renewal_date else '',
                'subscriber_email': sub.subscriber_email,
                'forward_to': sub.forward_to,
                'email_routing': sub.email_routing,
                'email_volume_per_week': sub.email_volume_per_week,
                'main_vendor_contact': sub.main_vendor_contact,
                'actions_todos': sub.actions_todos,
                'last_confirmed_alive': sub.last_confirmed_alive.isoformat() if sub.last_confirmed_alive else '',
                'access_level_required': sub.access_level_required,
                'is_deleted': 'Yes' if sub.is_deleted else 'No',
            }
            writer.writerow(row)

        return output.getvalue()

    def _normalize_csv_row(self, row: dict) -> dict:
        """Normalize CSV row by mapping legacy column names to expected names.

        Supports both the app's native format and legacy spreadsheet format.
        """
        # Mapping from legacy/alternative column names to expected names
        column_mapping = {
            # Legacy name -> Expected name
            'Provider': 'provider',
            'Category': 'category_name',
            'Sector / Subject': 'subcategory_name',
            'Sector /Subject': 'subcategory_name',  # Handle CSV without space after slash
            'URL': 'link',
            'Username': 'username',
            'Password': 'password',
            'In LastPass': 'in_lastpass',
            'In Lastpass?': 'in_lastpass',  # Handle CSV with question mark
            'Authentication Method': 'authentication',
            'Status': 'status',
            'Description & Value to CCM': 'description_value',
            'Value': 'value_level',
            'CCM Owner': 'ccm_owner',
            'Subscription Log': 'subscription_log',
            'Payment Method': 'payment_method',
            'Payment Amount': 'cost',
            'Payment Frequency': 'payment_frequency',
            'Notes': 'notes',
            'Annual Cost': 'annual_cost',
            'Renewal Frequency': 'renewal_frequency',
            'Renewal Date': 'renewal_date',
            'Renew Date': 'renewal_date',  # Handle CSV variant
            'Last confirmed alive': 'last_confirmed_alive',
            'Main contact': 'main_vendor_contact',
            'Destination email': 'subscriber_email',
            'Forward to': 'forward_to',
            'RR email routing': 'email_routing',
            'Email volume / week': 'email_volume_per_week',
            'Actions': 'actions_todos',
            'Access Level Required': 'access_level_required',
        }

        normalized = {}
        for key, value in row.items():
            # Try to map the key, otherwise use lowercase version
            normalized_key = column_mapping.get(key, key.lower().replace(' ', '_'))
            normalized[normalized_key] = value

        return normalized

    def _parse_date_flexible(self, date_str: str) -> Optional[date]:
        """Parse date from various formats (ISO, M/D/YYYY, etc.)."""
        if not date_str:
            return None

        date_str = date_str.strip()
        if not date_str:
            return None

        # Try ISO format first (YYYY-MM-DD)
        try:
            return date.fromisoformat(date_str)
        except ValueError:
            pass

        # Try M/D/YYYY format (common in Excel exports)
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                month, day, year = int(parts[0]), int(parts[1]), int(parts[2])
                return date(year, month, day)
        except (ValueError, IndexError):
            pass

        return None

    def _normalize_payment_frequency(self, freq_str: str) -> Optional[PaymentFrequency]:
        """Normalize payment frequency string to enum value."""
        if not freq_str:
            return None

        freq_lower = freq_str.strip().lower()

        if freq_lower == 'monthly':
            return PaymentFrequency.MONTHLY
        elif freq_lower in ('yearly', 'annual', 'annually'):
            return PaymentFrequency.ANNUAL
        elif freq_lower:
            # Quarterly, Semiannual, Ad hoc, etc. -> Other
            return PaymentFrequency.OTHER

        return None

    def _normalize_value_level(self, value_str: str) -> Optional[ValueLevel]:
        """Normalize value level string to enum value."""
        if not value_str:
            return None

        value_upper = value_str.strip().upper()

        if value_upper == 'H':
            return ValueLevel.HIGH
        elif value_upper == 'M':
            return ValueLevel.MEDIUM
        elif value_upper == 'L':
            return ValueLevel.LOW

        # Ignore invalid values like "-", "?"
        return None

    def _get_or_create_category(self, name: str, categories_cache: dict) -> Optional[int]:
        """Get existing category ID or create new one. Returns category ID."""
        if not name:
            return None

        name = name.strip()
        if not name:
            return None

        # Check cache first
        if name in categories_cache:
            return categories_cache[name]

        # Look up in database
        category = self.db.query(Category).filter(Category.name == name).first()
        if category:
            categories_cache[name] = category.id
            return category.id

        # Create new category
        max_order = self.db.query(func.max(Category.display_order)).scalar() or 0
        new_category = Category(name=name, display_order=max_order + 1)
        self.db.add(new_category)
        self.db.flush()
        categories_cache[name] = new_category.id
        return new_category.id

    def _get_or_create_subcategory(
        self,
        name: str,
        category_id: int,
        subcategories_cache: dict,
    ) -> Optional[int]:
        """Get existing subcategory ID or create new one. Returns subcategory ID."""
        if not name or not category_id:
            return None

        name = name.strip()
        if not name:
            return None

        cache_key = (category_id, name)

        # Check cache first
        if cache_key in subcategories_cache:
            return subcategories_cache[cache_key]

        # Look up in database
        subcategory = self.db.query(Subcategory).filter(
            Subcategory.category_id == category_id,
            Subcategory.name == name
        ).first()
        if subcategory:
            subcategories_cache[cache_key] = subcategory.id
            return subcategory.id

        # Create new subcategory
        max_order = self.db.query(func.max(Subcategory.display_order)).filter(
            Subcategory.category_id == category_id
        ).scalar() or 0
        new_subcategory = Subcategory(
            category_id=category_id,
            name=name,
            display_order=max_order + 1
        )
        self.db.add(new_subcategory)
        self.db.flush()
        subcategories_cache[cache_key] = new_subcategory.id
        return new_subcategory.id

    def import_from_csv(self, csv_content: str) -> ImportResult:
        """Import subscriptions from CSV content.

        Returns import result with counts and errors.
        Supports both the app's native CSV format and legacy spreadsheet format.
        Auto-creates categories and subcategories if they don't exist.
        """
        # Strip UTF-8 BOM if present (common in Excel-exported CSVs)
        if csv_content.startswith('\ufeff'):
            csv_content = csv_content[1:]

        reader = csv.DictReader(io.StringIO(csv_content))

        result = ImportResult(
            total_rows=0,
            created=0,
            updated=0,
            restored=0,
            failed=0,
            errors=[],
        )

        # Build category/subcategory lookup caches (will be populated as we go)
        categories_cache = {c.name: c.id for c in self.db.query(Category).all()}
        subcategories_cache = {}
        for s in self.db.query(Subcategory).all():
            key = (s.category_id, s.name)
            subcategories_cache[key] = s.id

        for row_num, raw_row in enumerate(reader, start=2):  # Start at 2 (1 is header)
            # Normalize column names to handle legacy format
            row = self._normalize_csv_row(raw_row)
            result.total_rows += 1

            try:
                provider = row.get('provider', '').strip()
                if not provider:
                    raise ValueError("Provider is required")

                subscription_id = row.get('subscription_id', '').strip()

                # Look up or create category and subcategory
                category_name = row.get('category_name', '').strip()
                subcategory_name = row.get('subcategory_name', '').strip()
                category_id = self._get_or_create_category(category_name, categories_cache)
                subcategory_id = self._get_or_create_subcategory(
                    subcategory_name, category_id, subcategories_cache
                ) if category_id else None

                # Parse boolean fields
                in_lastpass = None
                in_lastpass_str = row.get('in_lastpass', '').strip().lower()
                if in_lastpass_str in ('yes', 'true', '1', 'y'):
                    in_lastpass = True
                elif in_lastpass_str in ('no', 'false', '0', 'n'):
                    in_lastpass = False

                # Parse enum fields using normalization helpers
                status = SubscriptionStatus.ACTIVE
                status_str = row.get('status', '').strip()
                if status_str:
                    try:
                        status = SubscriptionStatus(status_str)
                    except ValueError:
                        # Default to Active if invalid status
                        status = SubscriptionStatus.ACTIVE

                value_level = self._normalize_value_level(row.get('value_level', ''))
                payment_frequency = self._normalize_payment_frequency(row.get('payment_frequency', ''))

                # Parse numeric fields
                annual_cost = None
                annual_cost_str = row.get('annual_cost', '').strip()
                if annual_cost_str:
                    # Remove non-numeric chars except decimal point
                    cleaned = ''.join(c for c in annual_cost_str if c.isdigit() or c == '.')
                    if cleaned:
                        annual_cost = Decimal(cleaned)

                # Parse date fields using flexible parser
                renewal_date = self._parse_date_flexible(row.get('renewal_date', ''))
                last_confirmed_alive = self._parse_date_flexible(row.get('last_confirmed_alive', ''))

                # Check if subscription exists
                existing = None
                if subscription_id:
                    existing = self.get_by_subscription_id(subscription_id, include_deleted=True)

                if existing:
                    # Update existing subscription
                    existing.provider = provider
                    existing.category_id = category_id
                    existing.subcategory_id = subcategory_id
                    existing.link = row.get('link', '').strip() or None
                    existing.authentication = row.get('authentication', '').strip() or None
                    existing.username = row.get('username', '').strip() or None

                    password = row.get('password', '').strip()
                    if password:
                        existing.password = obfuscate_password(password)

                    existing.in_lastpass = in_lastpass
                    existing.status = status
                    existing.description_value = row.get('description_value', '').strip() or None
                    existing.value_level = value_level
                    existing.ccm_owner = row.get('ccm_owner', '').strip() or None
                    existing.subscription_log = row.get('subscription_log', '').strip() or None
                    existing.payment_method = row.get('payment_method', '').strip() or None
                    existing.cost = row.get('cost', '').strip() or None
                    existing.annual_cost = annual_cost
                    existing.payment_frequency = payment_frequency
                    existing.renewal_date = renewal_date
                    existing.subscriber_email = row.get('subscriber_email', '').strip() or None
                    existing.forward_to = row.get('forward_to', '').strip() or None
                    existing.email_routing = row.get('email_routing', '').strip() or None
                    existing.email_volume_per_week = row.get('email_volume_per_week', '').strip() or None
                    existing.main_vendor_contact = row.get('main_vendor_contact', '').strip() or None
                    existing.actions_todos = row.get('actions_todos', '').strip() or None
                    existing.notes = row.get('notes', '').strip() or None
                    existing.last_confirmed_alive = last_confirmed_alive
                    existing.access_level_required = row.get('access_level_required', '').strip() or None

                    if existing.is_deleted:
                        existing.is_deleted = False
                        existing.deleted_at = None
                        result.restored += 1
                    else:
                        result.updated += 1
                else:
                    # Create new subscription
                    new_sub_id, new_sub_id_num = self.generate_subscription_id()

                    subscription = Subscription(
                        subscription_id=new_sub_id,
                        subscription_id_num=new_sub_id_num,
                        provider=provider,
                        category_id=category_id,
                        subcategory_id=subcategory_id,
                        link=row.get('link', '').strip() or None,
                        authentication=row.get('authentication', '').strip() or None,
                        username=row.get('username', '').strip() or None,
                        password=obfuscate_password(row.get('password', '').strip()) if row.get('password', '').strip() else None,
                        in_lastpass=in_lastpass,
                        status=status,
                        description_value=row.get('description_value', '').strip() or None,
                        value_level=value_level,
                        ccm_owner=row.get('ccm_owner', '').strip() or None,
                        subscription_log=row.get('subscription_log', '').strip() or None,
                        payment_method=row.get('payment_method', '').strip() or None,
                        cost=row.get('cost', '').strip() or None,
                        annual_cost=annual_cost,
                        payment_frequency=payment_frequency,
                        renewal_date=renewal_date,
                        subscriber_email=row.get('subscriber_email', '').strip() or None,
                        forward_to=row.get('forward_to', '').strip() or None,
                        email_routing=row.get('email_routing', '').strip() or None,
                        email_volume_per_week=row.get('email_volume_per_week', '').strip() or None,
                        main_vendor_contact=row.get('main_vendor_contact', '').strip() or None,
                        actions_todos=row.get('actions_todos', '').strip() or None,
                        notes=row.get('notes', '').strip() or None,
                        last_confirmed_alive=last_confirmed_alive,
                        access_level_required=row.get('access_level_required', '').strip() or None,
                    )
                    self.db.add(subscription)
                    self.db.flush()  # Make insert visible for next ID generation
                    result.created += 1

            except Exception as e:
                result.failed += 1
                result.errors.append(ImportError(
                    row=row_num,
                    provider=row.get('provider', 'Unknown'),
                    error=str(e),
                ))

        self.db.commit()
        return result
