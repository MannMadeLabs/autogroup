"""create leads table

Revision ID: 001_leads
Revises:
Create Date: 2026-05-09

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_leads"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("tenant_slug", sa.String(length=64), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("customer_name", sa.String(length=255), nullable=False),
        sa.Column("customer_phone", sa.String(length=64), nullable=False),
        sa.Column("customer_email", sa.String(length=255), nullable=False),
        sa.Column("vehicle_make", sa.String(length=128), nullable=False),
        sa.Column("vehicle_model", sa.String(length=128), nullable=False),
        sa.Column("vehicle_service_needed", sa.Text(), nullable=False),
        sa.Column("lead_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_leads_tenant_id", "leads", ["tenant_id"], unique=False)
    op.create_index("ix_leads_tenant_slug", "leads", ["tenant_slug"], unique=False)
    op.create_index("ix_leads_status", "leads", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_leads_status", table_name="leads")
    op.drop_index("ix_leads_tenant_slug", table_name="leads")
    op.drop_index("ix_leads_tenant_id", table_name="leads")
    op.drop_table("leads")
