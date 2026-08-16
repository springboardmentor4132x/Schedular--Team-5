"""Add analytics tables

Revision ID: 839f00377297
Revises: 5944ad754f2d
Create Date: 2026-08-10 20:01:43.525755

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "839f00377297"
down_revision: Union[str, Sequence[str], None] = "5944ad754f2d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "audience_analytics",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "social_account_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "platform",
            sa.Enum(
                "facebook",
                "instagram",
                "linkedin",
                "twitter",
                "youtube",
                "pinterest",
                name="audience_analytics_platform",
                native_enum=False,
                length=20,
            ),
            nullable=False,
        ),
        sa.Column(
            "age_group",
            sa.String(length=50),
            nullable=True,
        ),
        sa.Column(
            "gender",
            sa.String(length=30),
            nullable=True,
        ),
        sa.Column(
            "country",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "followers",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "following",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "percentage",
            sa.Numeric(precision=8, scale=2),
            nullable=False,
        ),
        sa.Column(
            "recorded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["social_account_id"],
            ["socialaccounts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_audience_analytics_social_account_id"),
        "audience_analytics",
        ["social_account_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_audience_analytics_platform"),
        "audience_analytics",
        ["platform"],
        unique=False,
    )

    op.create_index(
        op.f("ix_audience_analytics_recorded_at"),
        "audience_analytics",
        ["recorded_at"],
        unique=False,
    )

    op.create_table(
        "platform_analytics",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "social_account_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "platform",
            sa.Enum(
                "facebook",
                "instagram",
                "linkedin",
                "twitter",
                "youtube",
                "pinterest",
                name="platform_analytics_platform",
                native_enum=False,
                length=20,
            ),
            nullable=False,
        ),
        sa.Column(
            "followers",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "reach",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "impressions",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "likes",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "comments",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "shares",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "clicks",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "engagement",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "engagement_rate",
            sa.Numeric(precision=8, scale=2),
            nullable=False,
        ),
        sa.Column(
            "recorded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["social_account_id"],
            ["socialaccounts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_platform_analytics_social_account_id"),
        "platform_analytics",
        ["social_account_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_platform_analytics_platform"),
        "platform_analytics",
        ["platform"],
        unique=False,
    )

    op.create_index(
        op.f("ix_platform_analytics_recorded_at"),
        "platform_analytics",
        ["recorded_at"],
        unique=False,
    )

    op.create_table(
        "post_analytics",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "post_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "social_account_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "platform",
            sa.Enum(
                "facebook",
                "instagram",
                "linkedin",
                "twitter",
                "youtube",
                "pinterest",
                name="analytics_platform",
                native_enum=False,
                length=20,
            ),
            nullable=False,
        ),
        sa.Column(
            "platform_post_id",
            sa.String(),
            nullable=True,
        ),
        sa.Column(
            "likes",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "comments",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "shares",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "clicks",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "reach",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "impressions",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "engagement",
            sa.Numeric(precision=15, scale=2),
            nullable=False,
        ),
        sa.Column(
            "engagement_rate",
            sa.Numeric(precision=8, scale=2),
            nullable=False,
        ),
        sa.Column(
            "recorded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["post_id"],
            ["posts.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["social_account_id"],
            ["socialaccounts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_post_analytics_post_id"),
        "post_analytics",
        ["post_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_post_analytics_social_account_id"),
        "post_analytics",
        ["social_account_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_post_analytics_platform"),
        "post_analytics",
        ["platform"],
        unique=False,
    )

    op.create_index(
        op.f("ix_post_analytics_recorded_at"),
        "post_analytics",
        ["recorded_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_post_analytics_recorded_at"),
        table_name="post_analytics",
    )

    op.drop_index(
        op.f("ix_post_analytics_platform"),
        table_name="post_analytics",
    )

    op.drop_index(
        op.f("ix_post_analytics_social_account_id"),
        table_name="post_analytics",
    )

    op.drop_index(
        op.f("ix_post_analytics_post_id"),
        table_name="post_analytics",
    )

    op.drop_table("post_analytics")

    op.drop_index(
        op.f("ix_platform_analytics_recorded_at"),
        table_name="platform_analytics",
    )

    op.drop_index(
        op.f("ix_platform_analytics_platform"),
        table_name="platform_analytics",
    )

    op.drop_index(
        op.f("ix_platform_analytics_social_account_id"),
        table_name="platform_analytics",
    )

    op.drop_table("platform_analytics")

    op.drop_index(
        op.f("ix_audience_analytics_recorded_at"),
        table_name="audience_analytics",
    )

    op.drop_index(
        op.f("ix_audience_analytics_platform"),
        table_name="audience_analytics",
    )

    op.drop_index(
        op.f("ix_audience_analytics_social_account_id"),
        table_name="audience_analytics",
    )

    op.drop_table("audience_analytics")