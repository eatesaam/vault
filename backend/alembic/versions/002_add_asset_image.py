"""Add asset image field

Revision ID: b7f3c4d5e6a1
Revises: a3f8b2c1d4e5
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'b7f3c4d5e6a1'
down_revision = 'a3f8b2c1d4e5'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('assets', sa.Column('image_path', sa.String(length=512), nullable=True))

def downgrade():
    op.drop_column('assets', 'image_path')