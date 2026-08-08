"""drop server default on failed_attempts

Revision ID: 671cf69cd2ce
Revises: f10858d0047f
Create Date: 2026-08-07 22:42:11.950418

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '671cf69cd2ce'
down_revision: Union[str, Sequence[str], None] = 'f10858d0047f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('users', 'failed_attempts', server_default=None)


def downgrade() -> None:
    op.alter_column('users', 'failed_attempts', server_default='0')
