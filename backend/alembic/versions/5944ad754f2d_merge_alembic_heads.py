"""merge alembic heads

Revision ID: 5944ad754f2d
Revises: 3f04ee66dc4c, e44cf1f35dbd
Create Date: 2026-08-09 19:20:22.348003

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5944ad754f2d'
down_revision: Union[str, Sequence[str], None] = ('3f04ee66dc4c', 'e44cf1f35dbd')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
