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


GRAPH_API_VERSION = "v25.0"
GRAPH_BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


def _get_platform_value(account: SocialAccount) -> str:
    if hasattr(account.platform, "value"):
        return str(account.platform.value).lower()

    return str(account.platform).lower()


def _get_account(
    db: Session,
    account_id: str,
    platform: str,
) -> SocialAccount:

    try:
        numeric_account_id = int(account_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid social account ID.",
        )

    account = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.id == numeric_account_id,
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
                "total_value": item.get("total_value"),
            }
        )

    return formatted


def _safe_number(value) -> float:

    try:
        if value is None:
            return 0

        return float(value)

    except (TypeError, ValueError):
        return 0


def _clean_number(value):

    value = _safe_number(value)

    if value.is_integer():
        return int(value)

    return value


async def _get_instagram_media_insights(
    media_id: str,
    access_token: str,
) -> Dict:

    metrics = [
        "likes",
        "comments",
        "total_interactions",
        "reach",
        "impressions",
    ]

    result = {
        "likes": 0,
        "comments": 0,
        "engagement": 0,
        "reach": 0,
        "impressions": 0,
    }

    for metric_name in metrics:

        try:
            response = await _graph_get(
                f"{GRAPH_BASE_URL}/{media_id}/insights",
                access_token,
                {
                    "metric": metric_name,
                },
            )

            insight_items = response.get(
                "data",
                [],
            )

            for insight in insight_items:

                if insight.get("name") != metric_name:
                    continue

                values = insight.get(
                    "values",
                    [],
                )

                if not values:
                    continue

                latest_value = values[-1].get(
                    "value",
                    0,
                )

                numeric_value = _clean_number(
                    latest_value
                )

                if metric_name == "likes":
                    result["likes"] = numeric_value

                elif metric_name == "comments":
                    result["comments"] = numeric_value

                elif metric_name == "total_interactions":
                    result["engagement"] = numeric_value

                elif metric_name == "reach":
                    result["reach"] = numeric_value

                elif metric_name == "impressions":
                    result["impressions"] = numeric_value

                break

        except Exception:
            continue

    if (
        result["engagement"] == 0
        and (
            result["likes"] > 0
            or result["comments"] > 0
        )
    ):
        result["engagement"] = (
            result["likes"]
            + result["comments"]
        )

    return result


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
            page_data
            .get("picture", {})
            .get("data", {})
            .get("url")
        ),
        "category": page_data.get(
            "category"
        ),
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
        "page_url": page_data.get(
            "link"
        ),
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

    now = datetime.now(timezone.utc)

    since = (
        now - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until = now.strftime(
        "%Y-%m-%d"
    )

    insights_data = []

    valid_metrics = [
        "page_engaged_users",
        "page_views_total",
        "page_fan_adds",
        "page_fan_removes",
        "page_posts_impressions",
    ]

    for metric_name in valid_metrics:

        try:

            res = await _graph_get(
                f"{GRAPH_BASE_URL}/{page_id}/insights",
                access_token,
                {
                    "metric": metric_name,
                    "period": "day",
                    "since": since,
                    "until": until,
                },
            )

            insights_data.extend(
                res.get(
                    "data",
                    [],
                )
            )

        except HTTPException:
            continue

    formatted = _format_insights(
        insights_data
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
        "page_engaged_users": "engaged_users",
        "page_views_total": "page_views",
        "page_fan_adds": "fan_adds",
        "page_fan_removes": "fan_removes",
        "page_posts_impressions": "impressions",
    }

    for item in insights_data:

        output_name = metric_mapping.get(
            item.get("name")
        )

        if not output_name:
            continue

        for value_item in item.get(
            "values",
            [],
        ):

            totals[output_name] += _safe_number(
                value_item.get(
                    "value",
                    0,
                )
            )

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_INSIGHTS",
        "period": {
            "start": since,
            "until": until,
        },
        "summary": {
            k: _clean_number(v)
            for k, v in totals.items()
        },
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

    now = datetime.now(
        timezone.utc
    )

    since_date = (
        now - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until_date = now.strftime(
        "%Y-%m-%d"
    )

    trend_data = []

    trend_metrics = [
        "page_engaged_users",
        "page_views_total",
    ]

    for metric_name in trend_metrics:

        try:

            res = await _graph_get(
                f"{GRAPH_BASE_URL}/{page_id}/insights",
                access_token,
                {
                    "metric": metric_name,
                    "period": "day",
                    "since": since_date,
                    "until": until_date,
                },
            )

            trend_data.extend(
                res.get(
                    "data",
                    [],
                )
            )

        except HTTPException:
            continue

    trend_map = {}

    for insight in trend_data:

        metric_name = insight.get(
            "name"
        )

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

            value = _clean_number(
                value_item.get(
                    "value",
                    0,
                )
            )

            if metric_name == "page_engaged_users":

                trend_map[date_key][
                    "engagement"
                ] = value

            elif metric_name == "page_views_total":

                trend_map[date_key][
                    "impressions"
                ] = value

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_TREND",
        "data": sorted(
            trend_map.values(),
            key=lambda i: i["date"],
        ),
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

    try:

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

    except HTTPException as exc:

        detail = exc.detail

        error_message = ""

        if isinstance(detail, dict):

            error_data = detail.get(
                "error",
                {}
            )

            if isinstance(error_data, dict):

                nested_error = error_data.get(
                    "error",
                    {}
                )

                if isinstance(
                    nested_error,
                    dict,
                ):

                    error_message = str(
                        nested_error.get(
                            "message",
                            "",
                        )
                    )

        if (
            "pages_read_engagement"
            in error_message
            or "Page Public Content Access"
            in error_message
        ):

            raise HTTPException(
                status_code=403,
                detail={
                    "message": (
                        "Facebook Page posts cannot "
                        "currently be read by this app."
                    ),
                    "reason": (
                        "Meta is rejecting the Page "
                        "posts endpoint even though the "
                        "stored Page access token is valid."
                    ),
                    "page_id": page_id,
                    "account_id": account_id,
                    "meta_error": error_message,
                    "required_permission": (
                        "pages_read_engagement"
                    ),
                    "next_step": (
                        "Enable/obtain the required "
                        "Meta Page access capability "
                        "for this application, then "
                        "reconnect the Facebook account "
                        "to generate a fresh Page access token."
                    ),
                },
            )

        raise exc

    posts = []

    for post in data.get(
        "data",
        [],
    ):

        likes = int(
            post.get(
                "likes",
                {}
            )
            .get(
                "summary",
                {}
            )
            .get(
                "total_count",
                0,
            )
        )

        comments = int(
            post.get(
                "comments",
                {}
            )
            .get(
                "summary",
                {}
            )
            .get(
                "total_count",
                0,
            )
        )

        reactions = int(
            post.get(
                "reactions",
                {}
            )
            .get(
                "summary",
                {}
            )
            .get(
                "total_count",
                0,
            )
        )

        shares = int(
            post.get(
                "shares",
                {}
            ).get(
                "count",
                0,
            )
        )

        posts.append(
            {
                "id": post.get(
                    "id"
                ),
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
        "name": data.get(
            "name"
        ),
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

    now = datetime.now(
        timezone.utc
    )

    since = (
        now - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until = now.strftime(
        "%Y-%m-%d"
    )

    insights_data = []

    try:

        reach_data = await _graph_get(
            f"{GRAPH_BASE_URL}/{ig_user_id}/insights",
            access_token,
            {
                "metric": "reach",
                "period": "day",
                "since": since,
                "until": until,
            },
        )

        insights_data.extend(
            reach_data.get(
                "data",
                [],
            )
        )

    except HTTPException:
        pass

    total_metrics = [
        "profile_views",
        "website_clicks",
        "accounts_engaged",
        "total_interactions",
        "views",
    ]

    for metric_name in total_metrics:

        try:

            metric_data = await _graph_get(
                f"{GRAPH_BASE_URL}/{ig_user_id}/insights",
                access_token,
                {
                    "metric": metric_name,
                    "metric_type": "total_value",
                    "period": "day",
                    "since": since,
                    "until": until,
                },
            )

            insights_data.extend(
                metric_data.get(
                    "data",
                    [],
                )
            )

        except HTTPException:
            pass

    formatted = _format_insights(
        insights_data
    )

    totals = {
        "reach": 0,
        "profile_views": 0,
        "website_clicks": 0,
        "accounts_engaged": 0,
        "total_interactions": 0,
        "views": 0,
    }

    metric_mapping = {
        k: k
        for k in totals.keys()
    }

    for insight in insights_data:

        output_name = metric_mapping.get(
            insight.get("name")
        )

        if not output_name:
            continue

        total_val = insight.get(
            "total_value"
        )

        if total_val is not None:

            if isinstance(
                total_val,
                dict,
            ):
                total_val = total_val.get(
                    "value",
                    0,
                )

            totals[output_name] = _clean_number(
                total_val
            )

            continue

        for value_item in insight.get(
            "values",
            [],
        ):

            totals[output_name] += _safe_number(
                value_item.get(
                    "value",
                    0,
                )
            )

    return {
        "platform": "INSTAGRAM",
        "report_type": "30_DAY_INSIGHTS",
        "period": {
            "start": since,
            "until": until,
        },
        "summary": {
            k: _clean_number(v)
            for k, v in totals.items()
        },
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

    now = datetime.now(
        timezone.utc
    )

    since = (
        now - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    until = now.strftime(
        "%Y-%m-%d"
    )

    trend_data = []

    try:

        reach_data = await _graph_get(
            f"{GRAPH_BASE_URL}/{ig_user_id}/insights",
            access_token,
            {
                "metric": "reach",
                "period": "day",
                "since": since,
                "until": until,
            },
        )

        trend_data.extend(
            reach_data.get(
                "data",
                [],
            )
        )

    except HTTPException:
        pass

    for metric_name in [
        "profile_views",
        "views",
    ]:

        try:

            metric_data = await _graph_get(
                f"{GRAPH_BASE_URL}/{ig_user_id}/insights",
                access_token,
                {
                    "metric": metric_name,
                    "metric_type": "total_value",
                    "period": "day",
                    "since": since,
                    "until": until,
                },
            )

            trend_data.extend(
                metric_data.get(
                    "data",
                    [],
                )
            )

        except HTTPException:
            pass

    trend_map = {}

    for insight in trend_data:

        metric_name = insight.get(
            "name"
        )

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
                    "reach": 0,
                    "profile_views": 0,
                    "views": 0,
                }

            value = _clean_number(
                value_item.get(
                    "value",
                    0,
                )
            )

            if metric_name in [
                "reach",
                "profile_views",
                "views",
            ]:

                trend_map[date_key][
                    metric_name
                ] = value

    return {
        "platform": "INSTAGRAM",
        "report_type": "30_DAY_TREND",
        "data": sorted(
            trend_map.values(),
            key=lambda i: i["date"],
        ),
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

        media_id = item.get(
            "id"
        )

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

        insights = {
            "likes": likes,
            "comments": comments,
            "engagement": likes + comments,
            "reach": 0,
            "impressions": 0,
        }

        if media_id:

            media_insights = (
                await _get_instagram_media_insights(
                    media_id,
                    access_token,
                )
            )

            if media_insights.get(
                "likes",
                0,
            ) > 0:

                insights["likes"] = (
                    media_insights["likes"]
                )

            if media_insights.get(
                "comments",
                0,
            ) > 0:

                insights["comments"] = (
                    media_insights["comments"]
                )

            if media_insights.get(
                "engagement",
                0,
            ) > 0:

                insights["engagement"] = (
                    media_insights["engagement"]
                )

            insights["reach"] = (
                media_insights.get(
                    "reach",
                    0,
                )
            )

            insights["impressions"] = (
                media_insights.get(
                    "impressions",
                    0,
                )
            )

        media.append(
            {
                "id": media_id,
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
                "likes": insights[
                    "likes"
                ],
                "comments": insights[
                    "comments"
                ],
                "engagement": insights[
                    "engagement"
                ],
                "reach": insights[
                    "reach"
                ],
                "impressions": insights[
                    "impressions"
                ],
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

    insights = await _get_instagram_media_insights(
        media_id,
        access_token,
    )

    if insights.get(
        "likes",
        0,
    ) > 0:

        likes = insights[
            "likes"
        ]

    if insights.get(
        "comments",
        0,
    ) > 0:

        comments = insights[
            "comments"
        ]

    engagement = insights.get(
        "engagement",
        0,
    )

    if engagement == 0:
        engagement = (
            likes
            + comments
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
            "engagement": engagement,
            "reach": insights.get(
                "reach",
                0,
            ),
            "impressions": insights.get(
                "impressions",
                0,
            ),
        },
    }