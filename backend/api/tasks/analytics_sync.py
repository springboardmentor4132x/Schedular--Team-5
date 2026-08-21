import asyncio
from datetime import datetime, timezone

from celery_app import celery_app

from api.database.session import SessionLocal
from api.models.social_account import SocialAccount
from api.models.platform_analytics import PlatformAnalytics
from api.roles.social_account import Platform
from api.services.analytics_service import calculate_engagement_rate

from api.routers.meta_analytics import (
    get_facebook_overview,
    get_facebook_insights,
    get_instagram_overview,
    get_instagram_insights,
)


def _sync_facebook_account(db, account: SocialAccount) -> None:
    account_id_str = str(account.id)

    overview = asyncio.run(
        get_facebook_overview(account_id_str, db)
    )

    insights = asyncio.run(
        get_facebook_insights(account_id_str, db)
    )

    summary = insights.get("summary", {})

    followers = float(overview.get("followers", 0) or 0)
    impressions = float(summary.get("impressions", 0) or 0)
    engagement = float(summary.get("engaged_users", 0) or 0)
    reach = 0.0

    engagement_rate = calculate_engagement_rate(
        likes=0,
        comments=0,
        shares=0,
        reach=reach,
    )

    row = PlatformAnalytics(
        social_account_id=account.id,
        platform=Platform.FACEBOOK,
        followers=followers,
        reach=reach,
        impressions=impressions,
        likes=0,
        comments=0,
        shares=0,
        clicks=0,
        engagement=engagement,
        engagement_rate=engagement_rate,
    )

    db.add(row)
    db.commit()

    print(
        f">>> ANALYTICS SYNC: facebook account_id={account.id} "
        f"followers={followers} impressions={impressions} "
        f"engagement={engagement}",
        flush=True,
    )


def _sync_instagram_account(db, account: SocialAccount) -> None:
    account_id_str = str(account.id)

    overview = asyncio.run(
        get_instagram_overview(account_id_str, db)
    )

    insights = asyncio.run(
        get_instagram_insights(account_id_str, db)
    )

    summary = insights.get("summary", {})

    followers = float(overview.get("followers", 0) or 0)
    reach = float(summary.get("reach", 0) or 0)
    clicks = float(summary.get("website_clicks", 0) or 0)
    engagement = float(summary.get("total_interactions", 0) or 0)
    impressions = 0.0

    engagement_rate = calculate_engagement_rate(
        likes=0,
        comments=0,
        shares=0,
        reach=reach,
    )

    row = PlatformAnalytics(
        social_account_id=account.id,
        platform=Platform.INSTAGRAM,
        followers=followers,
        reach=reach,
        impressions=impressions,
        likes=0,
        comments=0,
        shares=0,
        clicks=clicks,
        engagement=engagement,
        engagement_rate=engagement_rate,
    )

    db.add(row)
    db.commit()

    print(
        f">>> ANALYTICS SYNC: instagram account_id={account.id} "
        f"followers={followers} reach={reach} "
        f"engagement={engagement}",
        flush=True,
    )


@celery_app.task
def sync_platform_analytics():
    db = SessionLocal()

    synced = 0
    failed = 0

    try:
        now = datetime.now(timezone.utc)

        print(
            f">>> ANALYTICS SYNC STARTED: "
            f"UTC now={now.isoformat()}",
            flush=True,
        )

        accounts = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.is_connected.is_(True),
                SocialAccount.platform.in_(
                    [
                        Platform.FACEBOOK,
                        Platform.INSTAGRAM,
                    ]
                ),
            )
            .all()
        )

        print(
            f">>> ANALYTICS SYNC: "
            f"{len(accounts)} connected account(s) found",
            flush=True,
        )

        for account in accounts:

            try:
                if account.platform == Platform.FACEBOOK:
                    _sync_facebook_account(db, account)

                elif account.platform == Platform.INSTAGRAM:
                    _sync_instagram_account(db, account)

                synced += 1

            except Exception as exc:
                failed += 1

                db.rollback()

                print(
                    f">>> ANALYTICS SYNC FAILED: "
                    f"account_id={account.id}, "
                    f"platform={account.platform}, "
                    f"error={exc}",
                    flush=True,
                )

        print(
            f">>> ANALYTICS SYNC FINISHED: "
            f"synced={synced}, failed={failed}",
            flush=True,
        )

        return {
            "synced_at": now.isoformat(),
            "accounts_synced": synced,
            "accounts_failed": failed,
        }

    finally:
        db.close()