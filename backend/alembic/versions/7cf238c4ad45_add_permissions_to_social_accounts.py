"""add permissions to social accounts

Revision ID: 7cf238c4ad45
Revises: 0a25cb3b88a7
Create Date: 2026-07-11 20:18:59.680159

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7cf238c4ad45"

down_revision: Union[str, Sequence[str], None] = None

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "socialaccounts",
        sa.Column(
            "permissions",
            sa.JSON(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "socialaccounts",
        "permissions",
    )