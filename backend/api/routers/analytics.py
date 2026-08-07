from datetime import datetime, timedelta, timezone
from typing import Annotated, Dict, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.social_account import SocialAccount


router = APIRouter(
    prefix="/audience",
    tags=["Analytics"],
)

dashboard_router = APIRouter(
    prefix="/analytics",
    tags=["Analytics Dashboard"],
)

GRAPH_API_VERSION = "v19.0"
GRAPH_BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


def _get_platform_value(account: SocialAccount) -> str:
    if hasattr(account.platform, "value"):
        return account.platform.value

    return str(account.platform).lower()


def _get_account(
    db: Session,
    account_id: str,
    platform: str,
) -> SocialAccount:
    account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.account_id == str(account_id),
            SocialAccount.is_connected.is_(True),
        )
        .first()
    )

    if not account:
        if platform == "facebook":
            raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

        if platform == "instagram":
            raise integrations.INSTAGRAM_ACCOUNT_NOT_FOUND_EXCEPTION

        raise HTTPException(
            status_code=404,
            detail="Social account not found.",
        )

    actual_platform = _get_platform_value(account)

    if actual_platform != platform:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Account {account_id} is connected to "
                f"{actual_platform}, not {platform}."
            ),
        )

    if not account.access_token:
        raise HTTPException(
            status_code=401,
            detail=(
                f"{platform.capitalize()} access token is missing."
            ),
        )

    return account


async def _graph_get(
    endpoint: str,
    access_token: str,
    params: Optional[Dict] = None,
) -> Dict:
    request_params = dict(params or {})
    request_params["access_token"] = access_token

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            endpoint,
            params=request_params,
        )

    if response.status_code != 200:
        try:
            error_data = response.json()
        except Exception:
            error_data = {
                "message": response.text,
            }

        raise HTTPException(
            status_code=response.status_code,
            detail={
                "message": "Meta Graph API request failed.",
                "error": error_data,
            },
        )

    try:
        return response.json()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Meta Graph API returned invalid JSON.",
        ) from exc


def _format_insights(data: list) -> list:
    formatted = []

    for item in data:
        formatted.append(
            {
                "name": item.get("name"),
                "period": item.get("period"),
                "title": item.get("title"),
                "description": item.get("description"),
                "values": item.get("values", []),
            }
        )

    return formatted


# ============================================================
# FACEBOOK
# ============================================================


@router.get("/facebook/{account_id}/overview")
async def get_facebook_overview(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "facebook",
    )

    page_id = account.account_id
    access_token = account.access_token

    page_data = await _graph_get(
        f"{GRAPH_BASE_URL}/{page_id}",
        access_token,
        {
            "fields": (
                "id,"
                "name,"
                "picture,"
                "followers_count,"
                "fan_count,"
                "link,"
                "category"
            )
        },
    )

    return {
        "platform": "FACEBOOK",
        "account_id": page_data.get(
            "id",
            page_id,
        ),
        "account_name": page_data.get(
            "name",
            account.account_name,
        ),
        "profile_picture": (
            page_data.get("picture", {})
            .get("data", {})
            .get("url")
        ),
        "category": page_data.get("category"),
        "followers": int(
            page_data.get(
                "followers_count",
                0,
            )
            or 0
        ),
        "page_likes": int(
            page_data.get(
                "fan_count",
                0,
            )
            or 0
        ),
        "page_url": page_data.get("link"),
    }


@router.get("/facebook/{account_id}/audience")
async def get_facebook_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "facebook",
    )

    page_id = account.account_id
    access_token = account.access_token

    page_data = await _graph_get(
        f"{GRAPH_BASE_URL}/{page_id}",
        access_token,
        {
            "fields": (
                "id,"
                "name,"
                "followers_count,"
                "fan_count"
            )
        },
    )

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "followers": int(
                page_data.get(
                    "followers_count",
                    0,
                )
                or 0
            ),
            "page_likes": int(
                page_data.get(
                    "fan_count",
                    0,
                )
                or 0
            ),
        },
    }


@router.get("/facebook/{account_id}/insights")
async def get_facebook_insights(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "facebook",
    )

    page_id = account.account_id
    access_token = account.access_token

    since = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    metrics = (
        "page_impressions,"
        "page_reach,"
        "page_engaged_users,"
        "page_post_engagements,"
        "page_views_total,"
        "page_fan_adds,"
        "page_fan_removes"
    )

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{page_id}/insights",
        access_token,
        {
            "metric": metrics,
            "period": "day",
            "since": since,
            "until": until,
        },
    )

    formatted = _format_insights(
        data.get("data", [])
    )

    totals = {
        "impressions": 0,
        "reach": 0,
        "engaged_users": 0,
        "post_engagements": 0,
        "page_views": 0,
        "fan_adds": 0,
        "fan_removes": 0,
    }

    metric_mapping = {
        "page_impressions": "impressions",
        "page_reach": "reach",
        "page_engaged_users": "engaged_users",
        "page_post_engagements": "post_engagements",
        "page_views_total": "page_views",
        "page_fan_adds": "fan_adds",
        "page_fan_removes": "fan_removes",
    }

    for item in data.get("data", []):
        metric_name = item.get("name")

        output_name = metric_mapping.get(
            metric_name
        )

        if not output_name:
            continue

        for value_item in item.get(
            "values",
            [],
        ):
            value = value_item.get(
                "value",
                0,
            )

            try:
                value = float(value)
            except (
                TypeError,
                ValueError,
            ):
                value = 0

            totals[output_name] += value

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_INSIGHTS",
        "period": {
            "start": since,
            "end": until,
        },
        "summary": totals,
        "data": formatted,
    }


@router.get("/facebook/{account_id}/trends")
async def get_facebook_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "facebook",
    )

    page_id = account.account_id
    access_token = account.access_token

    since_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    metrics = (
        "page_impressions,"
        "page_reach,"
        "page_post_engagements"
    )

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{page_id}/insights",
        access_token,
        {
            "metric": metrics,
            "period": "day",
            "since": since_date,
            "until": until_date,
        },
    )

    trend_map = {}

    for insight in data.get(
        "data",
        [],
    ):
        metric_name = insight.get("name")

        for value_item in insight.get(
            "values",
            [],
        ):
            date_value = value_item.get(
                "end_time"
            )

            if not date_value:
                continue

            date_key = date_value[:10]

            if date_key not in trend_map:
                trend_map[date_key] = {
                    "date": date_key,
                    "impressions": 0,
                    "reach": 0,
                    "engagement": 0,
                }

            value = value_item.get(
                "value",
                0,
            )

            try:
                value = float(value)
            except (
                TypeError,
                ValueError,
            ):
                value = 0

            if metric_name == "page_impressions":
                trend_map[date_key][
                    "impressions"
                ] = value

            elif metric_name == "page_reach":
                trend_map[date_key][
                    "reach"
                ] = value

            elif metric_name == "page_post_engagements":
                trend_map[date_key][
                    "engagement"
                ] = value

    trends = sorted(
        trend_map.values(),
        key=lambda item: item["date"],
    )

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_TREND",
        "data": trends,
    }


@router.get("/facebook/{account_id}/posts")
async def get_facebook_posts(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "facebook",
    )

    page_id = account.account_id
    access_token = account.access_token

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{page_id}/posts",
        access_token,
        {
            "fields": (
                "id,"
                "message,"
                "created_time,"
                "permalink_url,"
                "shares,"
                "likes.summary(true),"
                "comments.summary(true),"
                "reactions.summary(true)"
            ),
            "limit": 25,
        },
    )

    posts = []

    for post in data.get(
        "data",
        [],
    ):
        likes = (
            post.get("likes", {})
            .get("summary", {})
            .get("total_count", 0)
        )

        comments = (
            post.get("comments", {})
            .get("summary", {})
            .get("total_count", 0)
        )

        reactions = (
            post.get("reactions", {})
            .get("summary", {})
            .get("total_count", 0)
        )

        shares = (
            post.get("shares", {})
            .get("count", 0)
        )

        posts.append(
            {
                "id": post.get("id"),
                "message": post.get(
                    "message",
                    "",
                ),
                "created_time": post.get(
                    "created_time"
                ),
                "permalink_url": post.get(
                    "permalink_url"
                ),
                "likes": likes,
                "comments": comments,
                "reactions": reactions,
                "shares": shares,
                "engagement": (
                    likes
                    + comments
                    + reactions
                    + shares
                ),
            }
        )

    return {
        "platform": "FACEBOOK",
        "report_type": "RECENT_POSTS",
        "data": posts,
    }


# ============================================================
# INSTAGRAM
# ============================================================


@router.get("/instagram/{account_id}/overview")
async def get_instagram_overview(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "instagram",
    )

    ig_user_id = account.account_id
    access_token = account.access_token

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{ig_user_id}",
        access_token,
        {
            "fields": (
                "id,"
                "username,"
                "name,"
                "profile_picture_url,"
                "followers_count,"
                "follows_count,"
                "media_count"
            )
        },
    )

    return {
        "platform": "INSTAGRAM",
        "account_id": data.get(
            "id",
            ig_user_id,
        ),
        "username": data.get(
            "username",
            account.account_name,
        ),
        "name": data.get("name"),
        "profile_picture": data.get(
            "profile_picture_url"
        ),
        "followers": int(
            data.get(
                "followers_count",
                0,
            )
            or 0
        ),
        "following": int(
            data.get(
                "follows_count",
                0,
            )
            or 0
        ),
        "media_count": int(
            data.get(
                "media_count",
                0,
            )
            or 0
        ),
    }


@router.get("/instagram/{account_id}/audience")
async def get_instagram_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "instagram",
    )

    ig_user_id = account.account_id
    access_token = account.access_token

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{ig_user_id}",
        access_token,
        {
            "fields": (
                "id,"
                "username,"
                "followers_count,"
                "follows_count,"
                "media_count"
            )
        },
    )

    return {
        "platform": "INSTAGRAM",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "username": data.get(
                "username",
                account.account_name,
            ),
            "followers": int(
                data.get(
                    "followers_count",
                    0,
                )
                or 0
            ),
            "following": int(
                data.get(
                    "follows_count",
                    0,
                )
                or 0
            ),
            "media_count": int(
                data.get(
                    "media_count",
                    0,
                )
                or 0
            ),
        },
    }


@router.get("/instagram/{account_id}/insights")
async def get_instagram_insights(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "instagram",
    )

    ig_user_id = account.account_id
    access_token = account.access_token

    metrics = (
        "impressions,"
        "reach,"
        "profile_views,"
        "website_clicks"
    )

    since = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{ig_user_id}/insights",
        access_token,
        {
            "metric": metrics,
            "period": "day",
            "since": since,
            "until": until,
        },
    )

    formatted = _format_insights(
        data.get("data", [])
    )

    totals = {
        "impressions": 0,
        "reach": 0,
        "profile_views": 0,
        "website_clicks": 0,
    }

    metric_mapping = {
        "impressions": "impressions",
        "reach": "reach",
        "profile_views": "profile_views",
        "website_clicks": "website_clicks",
    }

    for insight in data.get(
        "data",
        [],
    ):
        metric_name = insight.get("name")

        output_name = metric_mapping.get(
            metric_name
        )

        if not output_name:
            continue

        for value_item in insight.get(
            "values",
            [],
        ):
            value = value_item.get(
                "value",
                0,
            )

            try:
                value = float(value)
            except (
                TypeError,
                ValueError,
            ):
                value = 0

            totals[output_name] += value

    return {
        "platform": "INSTAGRAM",
        "report_type": "30_DAY_INSIGHTS",
        "period": {
            "start": since,
            "end": until,
        },
        "summary": totals,
        "data": formatted,
    }


@router.get("/instagram/{account_id}/trends")
async def get_instagram_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "instagram",
    )

    ig_user_id = account.account_id
    access_token = account.access_token

    since = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{ig_user_id}/insights",
        access_token,
        {
            "metric": (
                "impressions,"
                "reach,"
                "profile_views"
            ),
            "period": "day",
            "since": since,
            "until": until,
        },
    )

    trend_map = {}

    for insight in data.get(
        "data",
        [],
    ):
        metric_name = insight.get("name")

        for value_item in insight.get(
            "values",
            [],
        ):
            end_time = value_item.get(
                "end_time"
            )

            if not end_time:
                continue

            date_key = end_time[:10]

            if date_key not in trend_map:
                trend_map[date_key] = {
                    "date": date_key,
                    "impressions": 0,
                    "reach": 0,
                    "profile_views": 0,
                }

            value = value_item.get(
                "value",
                0,
            )

            try:
                value = float(value)
            except (
                TypeError,
                ValueError,
            ):
                value = 0

            if metric_name == "impressions":
                trend_map[date_key][
                    "impressions"
                ] = value

            elif metric_name == "reach":
                trend_map[date_key][
                    "reach"
                ] = value

            elif metric_name == "profile_views":
                trend_map[date_key][
                    "profile_views"
                ] = value

    trends = sorted(
        trend_map.values(),
        key=lambda item: item["date"],
    )

    return {
        "platform": "INSTAGRAM",
        "report_type": "30_DAY_TREND",
        "data": trends,
    }


@router.get("/instagram/{account_id}/media")
async def get_instagram_media(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "instagram",
    )

    ig_user_id = account.account_id
    access_token = account.access_token

    data = await _graph_get(
        f"{GRAPH_BASE_URL}/{ig_user_id}/media",
        access_token,
        {
            "fields": (
                "id,"
                "caption,"
                "media_type,"
                "media_product_type,"
                "media_url,"
                "thumbnail_url,"
                "permalink,"
                "timestamp,"
                "like_count,"
                "comments_count"
            ),
            "limit": 25,
        },
    )

    media = []

    for item in data.get(
        "data",
        [],
    ):
        likes = int(
            item.get(
                "like_count",
                0,
            )
            or 0
        )

        comments = int(
            item.get(
                "comments_count",
                0,
            )
            or 0
        )

        media.append(
            {
                "id": item.get("id"),
                "caption": item.get(
                    "caption",
                    "",
                ),
                "media_type": item.get(
                    "media_type"
                ),
                "media_product_type": item.get(
                    "media_product_type"
                ),
                "media_url": item.get(
                    "media_url"
                ),
                "thumbnail_url": item.get(
                    "thumbnail_url"
                ),
                "permalink": item.get(
                    "permalink"
                ),
                "timestamp": item.get(
                    "timestamp"
                ),
                "likes": likes,
                "comments": comments,
                "engagement": (
                    likes + comments
                ),
            }
        )

    return {
        "platform": "INSTAGRAM",
        "report_type": "RECENT_MEDIA",
        "data": media,
    }


@router.get(
    "/instagram/{account_id}/media/{media_id}"
)
async def get_instagram_media_analytics(
    account_id: str,
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> Dict:
    account = _get_account(
        db,
        account_id,
        "instagram",
    )

    access_token = account.access_token

    media_data = await _graph_get(
        f"{GRAPH_BASE_URL}/{media_id}",
        access_token,
        {
            "fields": (
                "id,"
                "caption,"
                "media_type,"
                "media_product_type,"
                "media_url,"
                "thumbnail_url,"
                "permalink,"
                "timestamp,"
                "like_count,"
                "comments_count"
            )
        },
    )

    likes = int(
        media_data.get(
            "like_count",
            0,
        )
        or 0
    )

    comments = int(
        media_data.get(
            "comments_count",
            0,
        )
        or 0
    )

    return {
        "platform": "INSTAGRAM",
        "media_id": media_id,
        "data": {
            "caption": media_data.get(
                "caption",
                "",
            ),
            "media_type": media_data.get(
                "media_type"
            ),
            "media_product_type": media_data.get(
                "media_product_type"
            ),
            "media_url": media_data.get(
                "media_url"
            ),
            "thumbnail_url": media_data.get(
                "thumbnail_url"
            ),
            "permalink": media_data.get(
                "permalink"
            ),
            "timestamp": media_data.get(
                "timestamp"
            ),
            "likes": likes,
            "comments": comments,
            "engagement": (
                likes + comments
            ),
        },
    }