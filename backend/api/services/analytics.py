from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List


def get_date_range(range_value: str) -> tuple[datetime, datetime]:
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
        "kpis": kpis or {
            "reach": 0,
            "impressions": 0,
            "engagementRate": 0,
            "followers": 0,
        },
        "followerGrowth": follower_growth or [],
        "engagementTrend": engagement_trend or [],
        "audienceDemographics": audience_demographics or [],
        "platformPerformance": platform_performance or [],
        "topPosts": top_posts or [],
    }