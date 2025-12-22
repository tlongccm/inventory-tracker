"""Add purpose field and convert enum columns to string for extensibility.

Revision ID: 003
Revises: 002
Create Date: 2025-12-21

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    """Add purpose field and convert enum columns to String for extensibility."""
    # Get the bind to check database type
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == 'sqlite'

    if is_sqlite:
        # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        # First, create a new table with the updated schema
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

        # Copy data from old table to new
        op.execute("""
            INSERT INTO equipment_new (
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_address,
                cpu_score, score_2d, score_3d, memory_score, disk_score, overall_rating,
                equipment_name, ip_address, assignment_date, primary_user, usage_type, status, notes
            )
            SELECT
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_address,
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
        # Add purpose field
        op.add_column('equipment', sa.Column('purpose', sa.String(100), nullable=True))

        # Convert enum columns to VARCHAR
        op.alter_column('equipment', 'computer_subtype',
                        existing_type=sa.Enum('DESKTOP', 'LAPTOP', name='computersubtype'),
                        type_=sa.String(50),
                        existing_nullable=True)

        op.alter_column('equipment', 'status',
                        existing_type=sa.Enum('ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'IN_REPAIR', 'IN_STORAGE', name='status'),
                        type_=sa.String(50),
                        existing_nullable=True)

        op.alter_column('equipment', 'usage_type',
                        existing_type=sa.Enum('PERSONAL', 'WORK', name='usagetype'),
                        type_=sa.String(50),
                        existing_nullable=True)


def downgrade():
    """Remove purpose field. Note: Converting back to enum may lose data if new values were added."""
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == 'sqlite'

    if is_sqlite:
        # For SQLite, we'd need to recreate the table again
        # This is a simplified downgrade that just drops the purpose column
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

        op.execute("""
            INSERT INTO equipment_old (
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_address,
                cpu_score, score_2d, score_3d, memory_score, disk_score, overall_rating,
                equipment_name, ip_address, assignment_date, primary_user, usage_type, status, notes
            )
            SELECT
                id, equipment_id, equipment_id_num, equipment_type, serial_number,
                created_at, updated_at, is_deleted, deleted_at,
                model, manufacturer, manufacturing_date, acquisition_date, location, cost,
                computer_subtype, cpu_model, cpu_speed, operating_system,
                ram, storage, video_card, display_resolution, mac_address,
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
        op.drop_column('equipment', 'purpose')
        # Note: We don't convert back to enum as it may lose new values
