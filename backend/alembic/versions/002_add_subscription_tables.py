"""Add subscription, category, and subcategory tables

Revision ID: 002
Revises: 001
Create Date: 2025-12-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Default seed data for categories and subcategories
DEFAULT_CATEGORIES = [
    {
        "name": "Market Data & Investment Research",
        "display_order": 1,
        "subcategories": [
            "Terminal Platforms",
            "Fundamental Data & Valuation",
            "Screening & Portfolio Analytics",
            "Factor / Quant Data",
        ]
    },
    {
        "name": "Sell-Side / Buy-Side Research & Deal Flow",
        "display_order": 2,
        "subcategories": [
            "Bulge Bracket Research",
            "Middle-Market & Boutique Research",
            "Independent Research",
            "Activist / Short Research",
            "Deal Marketing & Access",
        ]
    },
    {
        "name": "News, Media & Publications",
        "display_order": 3,
        "subcategories": [
            "Financial News",
            "General News",
            "Sector Trade Publications",
            "News Aggregators & Commentary",
        ]
    },
    {
        "name": "Alternative Data & Analytics",
        "display_order": 4,
        "subcategories": [
            "Web Traffic & App Usage",
            "Sentiment & Attention",
            "Corporate Behavior & Filings Analytics",
            "Commodity / Industry Data",
            "Market Microstructure / Flow",
        ]
    },
    {
        "name": "AI, Automation & Productivity Tools",
        "display_order": 5,
        "subcategories": [
            "General-Purpose LLMs",
            "Research Assistants",
            "Coding & Technical Learning",
            "Workflow Automation",
        ]
    },
    {
        "name": "Trading, Execution & Portfolio Infrastructure",
        "display_order": 6,
        "subcategories": [
            "Brokerage & Execution",
            "OMS / EMS / Portfolio Systems",
            "Investor Communications & Data Rooms",
        ]
    },
    {
        "name": "Corporate, Compliance & Filings",
        "display_order": 7,
        "subcategories": [
            "Regulatory Filings",
            "Ownership & Control Analysis",
            "Governance & Risk Monitoring",
        ]
    },
    {
        "name": "Recruiting, Networking & Services",
        "display_order": 8,
        "subcategories": [
            "Recruiting & Talent Intelligence",
            "Expert Networks",
            "Professional Services Platforms",
        ]
    },
    {
        "name": "Connectivity, IT & Utilities",
        "display_order": 9,
        "subcategories": [
            "Connectivity & Access",
            "Security & Privacy",
            "General IT Utilities",
        ]
    },
]


def upgrade() -> None:
    """Create categories, subcategories, and subscriptions tables with seed data."""

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_category_name', 'categories', ['name'], unique=True)
    op.create_index('ix_category_active', 'categories', ['is_active'])

    # Create subcategories table
    op.create_table(
        'subcategories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='RESTRICT')
    )
    op.create_index('ix_subcategory_category', 'subcategories', ['category_id'])
    op.create_index('ix_subcategory_active', 'subcategories', ['is_active'])
    op.create_index('uq_subcategory_name_category', 'subcategories', ['category_id', 'name'], unique=True)

    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('subscription_id', sa.String(10), nullable=False),
        sa.Column('subscription_id_num', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(200), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('subcategory_id', sa.Integer(), nullable=True),
        sa.Column('link', sa.String(500), nullable=True),
        sa.Column('authentication', sa.String(200), nullable=True),
        sa.Column('username', sa.String(200), nullable=True),
        sa.Column('password', sa.String(500), nullable=True),
        sa.Column('in_lastpass', sa.Boolean(), nullable=True),
        sa.Column('access_level_required', sa.String(200), nullable=True),
        sa.Column('status', sa.Enum('Active', 'Inactive', name='subscriptionstatus'), nullable=False, server_default='Active'),
        sa.Column('description_value', sa.Text(), nullable=True),
        sa.Column('value_level', sa.Enum('H', 'M', 'L', name='valuelevel'), nullable=True),
        sa.Column('ccm_owner', sa.String(200), nullable=True),
        sa.Column('subscription_log', sa.Text(), nullable=True),
        sa.Column('payment_method', sa.String(200), nullable=True),
        sa.Column('cost', sa.String(100), nullable=True),
        sa.Column('annual_cost', sa.Numeric(12, 2), nullable=True),
        sa.Column('payment_frequency', sa.Enum('Monthly', 'Annual', 'Other', name='paymentfrequency'), nullable=True),
        sa.Column('renewal_date', sa.Date(), nullable=True),
        sa.Column('subscriber_email', sa.String(200), nullable=True),
        sa.Column('forward_to', sa.String(200), nullable=True),
        sa.Column('email_routing', sa.String(100), nullable=True),
        sa.Column('email_volume_per_week', sa.String(100), nullable=True),
        sa.Column('main_vendor_contact', sa.String(500), nullable=True),
        sa.Column('actions_todos', sa.Text(), nullable=True),
        sa.Column('last_confirmed_alive', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['subcategory_id'], ['subcategories.id'], ondelete='SET NULL')
    )
    op.create_index('ix_subscription_id', 'subscriptions', ['subscription_id'], unique=True)
    op.create_index('ix_subscription_status', 'subscriptions', ['status', 'is_deleted'])
    op.create_index('ix_subscription_provider', 'subscriptions', ['provider', 'is_deleted'])
    op.create_index('ix_subscription_owner', 'subscriptions', ['ccm_owner', 'is_deleted'])
    op.create_index('ix_subscription_category', 'subscriptions', ['category_id', 'is_deleted'])
    op.create_index('ix_subscription_value_level', 'subscriptions', ['value_level', 'is_deleted'])
    op.create_index('ix_subscription_renewal', 'subscriptions', ['renewal_date', 'is_deleted'])

    # Seed default categories and subcategories
    categories_table = sa.table(
        'categories',
        sa.column('id', sa.Integer),
        sa.column('name', sa.String),
        sa.column('display_order', sa.Integer),
        sa.column('is_active', sa.Boolean),
    )

    subcategories_table = sa.table(
        'subcategories',
        sa.column('category_id', sa.Integer),
        sa.column('name', sa.String),
        sa.column('display_order', sa.Integer),
        sa.column('is_active', sa.Boolean),
    )

    # Insert categories
    for i, cat_data in enumerate(DEFAULT_CATEGORIES, start=1):
        op.execute(
            categories_table.insert().values(
                id=i,
                name=cat_data["name"],
                display_order=cat_data["display_order"],
                is_active=True,
            )
        )

        # Insert subcategories for this category
        for j, subcat_name in enumerate(cat_data["subcategories"], start=1):
            op.execute(
                subcategories_table.insert().values(
                    category_id=i,
                    name=subcat_name,
                    display_order=j,
                    is_active=True,
                )
            )


def downgrade() -> None:
    """Drop subscriptions, subcategories, and categories tables."""
    op.drop_table('subscriptions')
    op.drop_table('subcategories')
    op.drop_table('categories')

    # Drop enum types (only needed for PostgreSQL)
    op.execute("DROP TYPE IF EXISTS subscriptionstatus")
    op.execute("DROP TYPE IF EXISTS valuelevel")
    op.execute("DROP TYPE IF EXISTS paymentfrequency")
