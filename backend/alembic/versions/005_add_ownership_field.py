"""Add ownership field to equipment table.

Revision ID: 005
Revises: 004
Create Date: 2025-12-22

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    """Add ownership column to equipment table."""
    op.add_column('equipment',
                  sa.Column('ownership', sa.String(100), nullable=True))


def downgrade():
    """Remove ownership column from equipment table."""
    op.drop_column('equipment', 'ownership')
