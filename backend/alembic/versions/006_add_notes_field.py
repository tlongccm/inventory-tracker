"""Add notes field to subscriptions table.

Revision ID: 006
Revises: 005
Create Date: 2025-12-22

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    """Add notes column to subscriptions table."""
    op.add_column('subscriptions',
                  sa.Column('notes', sa.Text(), nullable=True))


def downgrade():
    """Remove notes column from subscriptions table."""
    op.drop_column('subscriptions', 'notes')
