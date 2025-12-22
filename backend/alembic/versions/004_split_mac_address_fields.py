"""Split mac_address into mac_lan and mac_wlan fields.

Revision ID: 004
Revises: 003
Create Date: 2025-12-21

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    """Split mac_address into mac_lan (existing data) and mac_wlan (new field)."""
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == 'sqlite'

    if is_sqlite:
        # SQLite doesn't support ALTER COLUMN/RENAME COLUMN in older versions
        # Create new table with updated schema
        op.execute("""
            CREATE TABLE equipment_new (
                id INTEGER NOT NULL PRIMARY KEY,
                equipment_id VARCHAR(10) NOT NULL UNIQUE,
                equipment_id_num INTEGER NOT NULL,
                equipment_type VARCHAR(20) NOT NULL,
                serial_number VARCHAR(100) UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT 0,
                deleted_at DATETIME,
                model VARCHAR(200),
                manufacturer VARCHAR(200),
                manufacturing_date DATE,
                acquisition_date DATE,
                location VARCHAR(200),
                cost DECIMAL(10, 2),
                purpose VARCHAR(100),
                computer_subtype VARCHAR(50),
                cpu_model VARCHAR(100),
                cpu_speed VARCHAR(50),
                operating_system VARCHAR(100),
                ram VARCHAR(50),
                storage VARCHAR(100),
                video_card VARCHAR(200),
                display_resolution VARCHAR(50),
                mac_lan VARCHAR(17),
                mac_wlan VARCHAR(17),
                cpu_score INTEGER,
                score_2d INTEGER,
                score_3d INTEGER,
                memory_score INTEGER,
                disk_score INTEGER,
                overall_rating INTEGER,
                equipment_name VARCHAR(100),
                ip_address VARCHAR(45),
                assignment_date DATE,
                primary_user VARCHAR(200),
                usage_type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Active',
                notes TEXT
            )
        """)

        # Copy data, migrating mac_address to mac_lan
        op.execute("""
            INSERT INTO equipment_new (
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost, purpose,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_lan, mac_wlan,
                cpu_score, score_2d, score_3d, memory_score, disk_score, overall_rating,
                equipment_name, ip_address, assignment_date, primary_user, usage_type, status, notes
            )
            SELECT
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost, purpose,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_address, NULL,
                cpu_score, score_2d, score_3d, memory_score, disk_score, overall_rating,
                equipment_name, ip_address, assignment_date, primary_user, usage_type, status, notes
            FROM equipment
        """)

        # Drop old table and rename new
        op.execute("DROP TABLE equipment")
        op.execute("ALTER TABLE equipment_new RENAME TO equipment")

        # Recreate indexes
        op.execute("CREATE INDEX ix_equipment_equipment_id ON equipment (equipment_id)")
        op.execute("CREATE INDEX ix_equipment_id ON equipment (id)")
        op.execute("CREATE INDEX ix_equipment_serial_number ON equipment (serial_number)")
        op.execute("CREATE INDEX ix_equipment_status ON equipment (status, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_user ON equipment (primary_user, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_usage_type ON equipment (usage_type, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_type ON equipment (equipment_type, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_location ON equipment (location, is_deleted)")
    else:
        # MySQL/PostgreSQL: Can use ALTER TABLE
        # Rename mac_address to mac_lan
        op.alter_column('equipment', 'mac_address',
                        new_column_name='mac_lan',
                        existing_type=sa.String(17),
                        existing_nullable=True)

        # Add new mac_wlan column
        op.add_column('equipment',
                      sa.Column('mac_wlan', sa.String(17), nullable=True))


def downgrade():
    """Merge mac_lan back to mac_address, drop mac_wlan."""
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == 'sqlite'

    if is_sqlite:
        # Recreate table with original schema
        op.execute("""
            CREATE TABLE equipment_old (
                id INTEGER NOT NULL PRIMARY KEY,
                equipment_id VARCHAR(10) NOT NULL UNIQUE,
                equipment_id_num INTEGER NOT NULL,
                equipment_type VARCHAR(20) NOT NULL,
                serial_number VARCHAR(100) UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT 0,
                deleted_at DATETIME,
                model VARCHAR(200),
                manufacturer VARCHAR(200),
                manufacturing_date DATE,
                acquisition_date DATE,
                location VARCHAR(200),
                cost DECIMAL(10, 2),
                purpose VARCHAR(100),
                computer_subtype VARCHAR(50),
                cpu_model VARCHAR(100),
                cpu_speed VARCHAR(50),
                operating_system VARCHAR(100),
                ram VARCHAR(50),
                storage VARCHAR(100),
                video_card VARCHAR(200),
                display_resolution VARCHAR(50),
                mac_address VARCHAR(17),
                cpu_score INTEGER,
                score_2d INTEGER,
                score_3d INTEGER,
                memory_score INTEGER,
                disk_score INTEGER,
                overall_rating INTEGER,
                equipment_name VARCHAR(100),
                ip_address VARCHAR(45),
                assignment_date DATE,
                primary_user VARCHAR(200),
                usage_type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Active',
                notes TEXT
            )
        """)

        # Copy data, restoring mac_lan to mac_address (mac_wlan data is lost)
        op.execute("""
            INSERT INTO equipment_old (
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost, purpose,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_address,
                cpu_score, score_2d, score_3d, memory_score, disk_score, overall_rating,
                equipment_name, ip_address, assignment_date, primary_user, usage_type, status, notes
            )
            SELECT
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost, purpose,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_lan,
                cpu_score, score_2d, score_3d, memory_score, disk_score, overall_rating,
                equipment_name, ip_address, assignment_date, primary_user, usage_type, status, notes
            FROM equipment
        """)

        op.execute("DROP TABLE equipment")
        op.execute("ALTER TABLE equipment_old RENAME TO equipment")

        # Recreate indexes
        op.execute("CREATE INDEX ix_equipment_equipment_id ON equipment (equipment_id)")
        op.execute("CREATE INDEX ix_equipment_id ON equipment (id)")
        op.execute("CREATE INDEX ix_equipment_serial_number ON equipment (serial_number)")
        op.execute("CREATE INDEX ix_equipment_status ON equipment (status, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_user ON equipment (primary_user, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_usage_type ON equipment (usage_type, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_type ON equipment (equipment_type, is_deleted)")
        op.execute("CREATE INDEX ix_equipment_location ON equipment (location, is_deleted)")
    else:
        # MySQL/PostgreSQL
        # Drop mac_wlan column
        op.drop_column('equipment', 'mac_wlan')

        # Rename mac_lan back to mac_address
        op.alter_column('equipment', 'mac_lan',
                        new_column_name='mac_address',
                        existing_type=sa.String(17),
                        existing_nullable=True)
