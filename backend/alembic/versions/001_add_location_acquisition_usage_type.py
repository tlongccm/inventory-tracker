"""Add location, acquisition_date, and rename function to usage_type

Revision ID: 001
Revises:
Create Date: 2025-12-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add location, acquisition_date columns and rename function to usage_type."""
    # Use batch mode for SQLite compatibility
    with op.batch_alter_table('equipment', schema=None) as batch_op:
        # Add new columns
        batch_op.add_column(sa.Column('location', sa.String(200), nullable=True))
        batch_op.add_column(sa.Column('acquisition_date', sa.Date(), nullable=True))

        # Rename function column to usage_type
        # Note: SQLite doesn't support column rename directly, batch mode handles this
        batch_op.alter_column('function', new_column_name='usage_type')

        # Add index for location
        batch_op.create_index('ix_equipment_location', ['location', 'is_deleted'])

        # Rename index for usage_type
        batch_op.drop_index('ix_equipment_function')
        batch_op.create_index('ix_equipment_usage_type', ['usage_type', 'is_deleted'])

    # Update assignment_history table
    with op.batch_alter_table('assignment_history', schema=None) as batch_op:
        # Rename previous_function to previous_usage_type
        batch_op.alter_column('previous_function', new_column_name='previous_usage_type')


def downgrade() -> None:
    """Reverse the changes."""
    with op.batch_alter_table('equipment', schema=None) as batch_op:
        # Rename usage_type back to function
        batch_op.alter_column('usage_type', new_column_name='function')

        # Drop new columns
        batch_op.drop_column('acquisition_date')
        batch_op.drop_column('location')

        # Restore indexes
        batch_op.drop_index('ix_equipment_location')
        batch_op.drop_index('ix_equipment_usage_type')
        batch_op.create_index('ix_equipment_function', ['function', 'is_deleted'])

    with op.batch_alter_table('assignment_history', schema=None) as batch_op:
        batch_op.alter_column('previous_usage_type', new_column_name='previous_function')
