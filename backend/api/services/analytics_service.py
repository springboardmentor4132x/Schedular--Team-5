from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from api.models.audience_analytics import AudienceAnalytics
from api.models.campaign import Campaign
from api.models.post import Post
from api.models.post_analytics import PostAnalytics
from api.models.platform_analytics import PlatformAnalytics
from api.models.social_account import SocialAccount


def get_date_range(
    range_value: str,
) -> tuple[datetime, datetime]:
    end_date = datetime.now(timezone.utc)

    ranges = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "6m": 180,
        "1y": 365,
    }

    days = ranges.get(range_value, 30)

    start_date = end_date - timedelta(days=days)

    return start_date, end_date


def calculate_engagement_rate(
    likes: float = 0,
    comments: float = 0,
    shares: float = 0,
    reach: float = 0,
) -> float:
    if reach <= 0:
        return 0

    engagement = likes + comments + shares

    return round((engagement / reach) * 100, 2)


def _to_float(value: Any) -> float:
    if value is None:
        return 0.0

    return float(value)


def _platform_name(platform: Any) -> str:
    if platform is None:
        return ""

    return (
        platform.value
        if hasattr(platform, "value")
        else str(platform)
    )


def build_platform_performance(
    platform: str,
    reach: float = 0,
    impressions: float = 0,
    clicks: float = 0,
    engagement: float = 0,
    trend: float = 0,
) -> Dict[str, Any]:
    return {
        "platform": platform,
        "reach": reach,
        "impressions": impressions,
        "clicks": clicks,
        "engagement": engagement,
        "trend": trend,
    }


def build_top_post(
    post_id: Any = None,
    platform: str = "",
    content: str = "",
    likes: float = 0,
    comments: float = 0,
    shares: float = 0,
    reach: float = 0,
) -> Dict[str, Any]:
    return {
        "id": str(post_id) if post_id is not None else None,
        "platform": platform,
        "content": content,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "reach": reach,
    }


def build_follower_growth_item(
    date: str,
    instagram: float = 0,
    facebook: float = 0,
    twitter: float = 0,
    linkedin: float = 0,
) -> Dict[str, Any]:
    return {
        "date": date,
        "instagram": instagram,
        "facebook": facebook,
        "twitter": twitter,
        "linkedin": linkedin,
    }


def build_engagement_trend_item(
    date: str,
    instagram: float = 0,
    facebook: float = 0,
    twitter: float = 0,
    linkedin: float = 0,
) -> Dict[str, Any]:
    return {
        "date": date,
        "instagram": instagram,
        "facebook": facebook,
        "twitter": twitter,
        "linkedin": linkedin,
    }


def build_audience_demographic(
    age: str,
    percentage: float,
) -> Dict[str, Any]:
    return {
        "age": age,
        "percentage": percentage,
    }


def build_dashboard_response(
    kpis: Dict[str, Any] | None = None,
    follower_growth: List[Dict[str, Any]] | None = None,
    engagement_trend: List[Dict[str, Any]] | None = None,
    audience_demographics: List[Dict[str, Any]] | None = None,
    platform_performance: List[Dict[str, Any]] | None = None,
    top_posts: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    return {
        "kpis": kpis
        or {
            "published_posts": 0,
            "scheduled_posts": 0,
            "failed_posts": 0,
            "reach": 0,
            "impressions": 0,
            "engagementRate": 0,
            "followers": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "clicks": 0,
            "engagement": 0,
        },
        "followerGrowth": follower_growth or [],
        "engagementTrend": engagement_trend or [],
        "audienceDemographics": audience_demographics or [],
        "platformPerformance": platform_performance or [],
        "topPosts": top_posts or [],
    }


def get_dashboard_summary(
    db: Session,
    user_id: int,
    range_value: str = "30d",
) -> Dict[str, Any]:
    start_date, end_date = get_date_range(range_value)

    social_account_ids = select(
        SocialAccount.id
    ).where(
        SocialAccount.user_id == user_id,
        SocialAccount.is_connected.is_(True),
    )

    post_stats = db.execute(
        select(
            func.count(PostAnalytics.id),
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.coalesce(func.sum(PostAnalytics.impressions), 0),
            func.coalesce(func.sum(PostAnalytics.likes), 0),
            func.coalesce(func.sum(PostAnalytics.comments), 0),
            func.coalesce(func.sum(PostAnalytics.shares), 0),
            func.coalesce(func.sum(PostAnalytics.clicks), 0),
            func.coalesce(func.sum(PostAnalytics.engagement), 0),
        ).where(
            PostAnalytics.social_account_id.in_(
                social_account_ids
            ),
            PostAnalytics.recorded_at >= start_date,
            PostAnalytics.recorded_at <= end_date,
        )
    ).one()

    (
        _analytics_count,
        reach,
        impressions,
        likes,
        comments,
        shares,
        clicks,
        engagement,
    ) = post_stats

    followers_result = db.execute(
        select(
            func.coalesce(
                func.sum(PlatformAnalytics.followers),
                0,
            )
        ).where(
            PlatformAnalytics.social_account_id.in_(
                social_account_ids
            ),
            PlatformAnalytics.recorded_at >= start_date,
            PlatformAnalytics.recorded_at <= end_date,
        )
    ).scalar_one()

    published_posts = db.execute(
        select(func.count(Post.id)).where(
            Post.user_id == user_id,
            Post.status == "published",
            Post.published_time >= start_date,
            Post.published_time <= end_date,
        )
    ).scalar_one()

    scheduled_posts = db.execute(
        select(func.count(Post.id)).where(
            Post.user_id == user_id,
            Post.status == "scheduled",
            Post.scheduled_time >= start_date,
            Post.scheduled_time <= end_date,
        )
    ).scalar_one()

    failed_posts = db.execute(
        select(func.count(Post.id)).where(
            Post.user_id == user_id,
            Post.status == "failed",
            Post.updated_at >= start_date,
            Post.updated_at <= end_date,
        )
    ).scalar_one()

    reach_value = _to_float(reach)

    kpis = {
        "published_posts": published_posts or 0,
        "scheduled_posts": scheduled_posts or 0,
        "failed_posts": failed_posts or 0,
        "reach": reach_value,
        "impressions": _to_float(impressions),
        "engagementRate": calculate_engagement_rate(
            _to_float(likes),
            _to_float(comments),
            _to_float(shares),
            reach_value,
        ),
        "followers": _to_float(followers_result),
        "likes": _to_float(likes),
        "comments": _to_float(comments),
        "shares": _to_float(shares),
        "clicks": _to_float(clicks),
        "engagement": _to_float(engagement),
    }

    platform_performance = get_platform_analytics(
        db,
        user_id,
        range_value,
    )

    top_posts = get_post_analytics(
        db,
        user_id,
        range_value,
        limit=5,
    )

    audience = get_audience_analytics(
        db,
        user_id,
        range_value,
    )

    trends = get_performance_trends(
        db,
        user_id,
        range_value,
    )

    return build_dashboard_response(
        kpis=kpis,
        follower_growth=trends["followerGrowth"],
        engagement_trend=trends["engagementTrend"],
        audience_demographics=audience,
        platform_performance=platform_performance,
        top_posts=top_posts,
    )


def get_post_analytics(
    db: Session,
    user_id: int,
    range_value: str = "30d",
    limit: int = 50,
) -> List[Dict[str, Any]]:
    start_date, end_date = get_date_range(range_value)

    rows = db.execute(
        select(
            PostAnalytics,
            Post.content,
        )
        .join(
            Post,
            Post.id == PostAnalytics.post_id,
        )
        .join(
            SocialAccount,
            SocialAccount.id
            == PostAnalytics.social_account_id,
        )
        .where(
            SocialAccount.user_id == user_id,
            PostAnalytics.recorded_at >= start_date,
            PostAnalytics.recorded_at <= end_date,
        )
        .order_by(
            PostAnalytics.engagement.desc()
        )
        .limit(limit)
    ).all()

    results = []

    for analytics, content in rows:
        results.append(
            {
                "id": analytics.id,
                "post_id": analytics.post_id,
                "social_account_id": analytics.social_account_id,
                "platform": _platform_name(
                    analytics.platform
                ),
                "platform_post_id": analytics.platform_post_id,
                "likes": _to_float(analytics.likes),
                "comments": _to_float(analytics.comments),
                "shares": _to_float(analytics.shares),
                "clicks": _to_float(analytics.clicks),
                "reach": _to_float(analytics.reach),
                "impressions": _to_float(
                    analytics.impressions
                ),
                "engagement": _to_float(
                    analytics.engagement
                ),
                "engagement_rate": _to_float(
                    analytics.engagement_rate
                ),
                "recorded_at": (
                    analytics.recorded_at.isoformat()
                    if analytics.recorded_at
                    else None
                ),
                "content": content or "",
            }
        )

    return results


def get_campaign_analytics(
    db: Session,
    user_id: int,
    range_value: str = "30d",
) -> List[Dict[str, Any]]:
    start_date, end_date = get_date_range(range_value)

    rows = db.execute(
        select(
            Campaign.id,
            Campaign.title,
            func.count(
                func.distinct(Post.id)
            ).label("total_posts"),
            func.count(
                func.distinct(
                    PostAnalytics.post_id
                )
            ).label("published_posts"),
            func.coalesce(
                func.sum(PostAnalytics.reach),
                0,
            ).label("reach"),
            func.coalesce(
                func.sum(PostAnalytics.impressions),
                0,
            ).label("impressions"),
            func.coalesce(
                func.sum(PostAnalytics.likes),
                0,
            ).label("likes"),
            func.coalesce(
                func.sum(PostAnalytics.comments),
                0,
            ).label("comments"),
            func.coalesce(
                func.sum(PostAnalytics.shares),
                0,
            ).label("shares"),
            func.coalesce(
                func.sum(PostAnalytics.clicks),
                0,
            ).label("clicks"),
            func.coalesce(
                func.sum(PostAnalytics.engagement),
                0,
            ).label("engagement"),
        )
        .join(
            Post,
            Post.campaign_id == Campaign.id,
        )
        .outerjoin(
            PostAnalytics,
            PostAnalytics.post_id == Post.id,
        )
        .where(
            Campaign.user_id == user_id,
            Post.created_at >= start_date,
            Post.created_at <= end_date,
        )
        .group_by(
            Campaign.id,
            Campaign.title,
        )
        .order_by(
            func.sum(PostAnalytics.engagement).desc()
        )
    ).all()

    results = []

    for row in rows:
        reach = _to_float(row.reach)

        results.append(
            {
                "id": row.id,
                "campaign_id": row.id,
                "title": row.title,
                "total_posts": row.total_posts or 0,
                "published_posts": (
                    row.published_posts or 0
                ),
                "scheduled_posts": 0,
                "failed_posts": 0,
                "reach": reach,
                "impressions": _to_float(
                    row.impressions
                ),
                "likes": _to_float(row.likes),
                "comments": _to_float(
                    row.comments
                ),
                "shares": _to_float(row.shares),
                "clicks": _to_float(row.clicks),
                "engagement": _to_float(
                    row.engagement
                ),
                "engagement_rate": calculate_engagement_rate(
                    _to_float(row.likes),
                    _to_float(row.comments),
                    _to_float(row.shares),
                    reach,
                ),
            }
        )

    return results


def get_audience_analytics(
    db: Session,
    user_id: int,
    range_value: str = "30d",
) -> List[Dict[str, Any]]:
    start_date, end_date = get_date_range(range_value)

    rows = db.execute(
        select(AudienceAnalytics)
        .join(
            SocialAccount,
            SocialAccount.id
            == AudienceAnalytics.social_account_id,
        )
        .where(
            SocialAccount.user_id == user_id,
            AudienceAnalytics.recorded_at >= start_date,
            AudienceAnalytics.recorded_at <= end_date,
        )
        .order_by(
            AudienceAnalytics.percentage.desc()
        )
    ).scalars().all()

    results = []

    for item in rows:
        results.append(
            {
                "id": item.id,
                "social_account_id": item.social_account_id,
                "platform": _platform_name(
                    item.platform
                ),
                "age_group": item.age_group,
                "gender": item.gender,
                "country": item.country,
                "followers": _to_float(
                    item.followers
                ),
                "following": _to_float(
                    item.following
                ),
                "percentage": _to_float(
                    item.percentage
                ),
                "recorded_at": (
                    item.recorded_at.isoformat()
                    if item.recorded_at
                    else None
                ),
            }
        )

    return results


def get_platform_analytics(
    db: Session,
    user_id: int,
    range_value: str = "30d",
) -> List[Dict[str, Any]]:
    start_date, end_date = get_date_range(range_value)

    rows = db.execute(
        select(
            PlatformAnalytics.platform,
            func.max(
                PlatformAnalytics.followers
            ).label("followers"),
            func.sum(
                PlatformAnalytics.reach
            ).label("reach"),
            func.sum(
                PlatformAnalytics.impressions
            ).label("impressions"),
            func.sum(
                PlatformAnalytics.likes
            ).label("likes"),
            func.sum(
                PlatformAnalytics.comments
            ).label("comments"),
            func.sum(
                PlatformAnalytics.shares
            ).label("shares"),
            func.sum(
                PlatformAnalytics.clicks
            ).label("clicks"),
            func.sum(
                PlatformAnalytics.engagement
            ).label("engagement"),
        )
        .join(
            SocialAccount,
            SocialAccount.id
            == PlatformAnalytics.social_account_id,
        )
        .where(
            SocialAccount.user_id == user_id,
            PlatformAnalytics.recorded_at >= start_date,
            PlatformAnalytics.recorded_at <= end_date,
        )
        .group_by(
            PlatformAnalytics.platform
        )
        .order_by(
            func.sum(
                PlatformAnalytics.engagement
            ).desc()
        )
    ).all()

    results = []

    for row in rows:
        reach = _to_float(row.reach)

        results.append(
            {
                "platform": _platform_name(
                    row.platform
                ),
                "followers": _to_float(
                    row.followers
                ),
                "reach": reach,
                "impressions": _to_float(
                    row.impressions
                ),
                "clicks": _to_float(row.clicks),
                "likes": _to_float(row.likes),
                "comments": _to_float(
                    row.comments
                ),
                "shares": _to_float(row.shares),
                "engagement": _to_float(
                    row.engagement
                ),
                "engagement_rate": calculate_engagement_rate(
                    _to_float(row.likes),
                    _to_float(row.comments),
                    _to_float(row.shares),
                    reach,
                ),
                "trend": 0,
            }
        )

    return results


def compare_platforms(
    db: Session,
    user_id: int,
    range_value: str = "30d",
) -> List[Dict[str, Any]]:
    return get_platform_analytics(
        db,
        user_id,
        range_value,
    )


def get_performance_trends(
    db: Session,
    user_id: int,
    range_value: str = "30d",
) -> Dict[str, List[Dict[str, Any]]]:
    start_date, end_date = get_date_range(range_value)

    rows = db.execute(
        select(
            func.date(
                PlatformAnalytics.recorded_at
            ).label("date"),
            PlatformAnalytics.platform,
            func.sum(
                PlatformAnalytics.followers
            ).label("followers"),
            func.sum(
                PlatformAnalytics.engagement
            ).label("engagement"),
        )
        .join(
            SocialAccount,
            SocialAccount.id
            == PlatformAnalytics.social_account_id,
        )
        .where(
            SocialAccount.user_id == user_id,
            PlatformAnalytics.recorded_at >= start_date,
            PlatformAnalytics.recorded_at <= end_date,
        )
        .group_by(
            func.date(
                PlatformAnalytics.recorded_at
            ),
            PlatformAnalytics.platform,
        )
        .order_by(
            func.date(
                PlatformAnalytics.recorded_at
            )
        )
    ).all()

    follower_data: Dict[str, Dict[str, float]] = {}
    engagement_data: Dict[str, Dict[str, float]] = {}

    for row in rows:
        date_key = str(row.date)
        platform = _platform_name(
            row.platform
        )

        if date_key not in follower_data:
            follower_data[date_key] = {}

        if date_key not in engagement_data:
            engagement_data[date_key] = {}

        follower_data[date_key][platform] = (
            _to_float(row.followers)
        )

        engagement_data[date_key][platform] = (
            _to_float(row.engagement)
        )

    follower_growth = []

    for date_key, values in follower_data.items():
        follower_growth.append(
            {
                "date": date_key,
                "instagram": values.get(
                    "instagram",
                    0,
                ),
                "facebook": values.get(
                    "facebook",
                    0,
                ),
                "twitter": values.get(
                    "twitter",
                    0,
                ),
                "linkedin": values.get(
                    "linkedin",
                    0,
                ),
                "youtube": values.get(
                    "youtube",
                    0,
                ),
                "pinterest": values.get(
                    "pinterest",
                    0,
                ),
            }
        )

    engagement_trend = []

    for date_key, values in engagement_data.items():
        engagement_trend.append(
            {
                "date": date_key,
                "instagram": values.get(
                    "instagram",
                    0,
                ),
                "facebook": values.get(
                    "facebook",
                    0,
                ),
                "twitter": values.get(
                    "twitter",
                    0,
                ),
                "linkedin": values.get(
                    "linkedin",
                    0,
                ),
                "youtube": values.get(
                    "youtube",
                    0,
                ),
                "pinterest": values.get(
                    "pinterest",
                    0,
                ),
            }
        )

    return {
        "followerGrowth": follower_growth,
        "engagementTrend": engagement_trend,
    }