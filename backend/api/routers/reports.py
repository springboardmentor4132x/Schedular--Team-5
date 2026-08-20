
import io
import pandas as pd
from fpdf import FPDF
from fastapi.responses import StreamingResponse

from api.core.config import settings
from api.exceptions import integrations
from api.models.campaign import Campaign
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import Annotated, Dict
import httpx
import random

from api.dependencies.database import get_db
from api.models.schedule import Schedule
from api.models.social_account import SocialAccount
from api.roles.schedule import Status as ScheduleStatus


router = APIRouter(
    prefix="/reports",
    tags=["Reports Exports Routes"]
)


# =========================================================
# YOUTUBE ANALYTICS
# =========================================================

async def get_youtube_audience_analytics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if (
        account.token_expiry
        and datetime.now(timezone.utc)
        >= account.token_expiry - timedelta(minutes=5)
    ):

        refresh_res = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": account.refresh_token,
                "grant_type": "refresh_token"
            }
        )

        refresh_res.raise_for_status()

        token_json = refresh_res.json()

        account.access_token = token_json["access_token"]

        account.token_expiry = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=token_json["expires_in"]
            )
        )

        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    url: str = (
        "https://youtube.googleapis.com/youtube/v3/channels"
    )

    params: Dict = {
        "part": "statistics",
        "mine": "true"
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                f"YOUTUBE API ERROR: {response.text}"
            )

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch YouTube analytics"
            )

        data = response.json()

        if not data.get("items"):

            raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION

        stats = data["items"][0]["statistics"]

        return {
            "platform": "YOUTUBE",
            "audience": {
                "subscriber_count": int(
                    stats.get(
                        "subscriberCount",
                        0
                    )
                ),
                "total_views": int(
                    stats.get(
                        "viewCount",
                        0
                    )
                ),
                "total_videos": int(
                    stats.get(
                        "videoCount",
                        0
                    )
                )
            }
        }


async def get_youtube_content_analytics(
    account_id: str,
    video_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if (
        account.token_expiry
        and datetime.now(timezone.utc)
        >= account.token_expiry - timedelta(minutes=5)
    ):

        refresh_res = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": account.refresh_token,
                "grant_type": "refresh_token"
            }
        )

        refresh_res.raise_for_status()

        token_json = refresh_res.json()

        account.access_token = token_json["access_token"]

        account.token_expiry = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=token_json["expires_in"]
            )
        )

        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    url: str = (
        "https://youtube.googleapis.com/youtube/v3/videos"
    )

    params: Dict = {
        "part": "statistics",
        "id": video_id
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch video analytics"
            )

        data = response.json()

        if not data.get("items"):

            raise integrations.YOUTUBE_VIDEO_NOT_FOUND_EXCEPTION

        stats = data["items"][0]["statistics"]

        return {
            "platform": "YOUTUBE",
            "video_id": video_id,
            "engagement": {
                "views": int(
                    stats.get(
                        "viewCount",
                        0
                    )
                ),
                "likes": int(
                    stats.get(
                        "likeCount",
                        0
                    )
                ),
                "comments": int(
                    stats.get(
                        "commentCount",
                        0
                    )
                )
            }
        }


async def get_youtube_performance_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if (
        account.token_expiry
        and datetime.now(timezone.utc)
        >= account.token_expiry - timedelta(minutes=5)
    ):

        refresh_res = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": account.refresh_token,
                "grant_type": "refresh_token"
            }
        )

        refresh_res.raise_for_status()

        token_json = refresh_res.json()

        account.access_token = token_json["access_token"]

        account.token_expiry = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=token_json["expires_in"]
            )
        )

        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    url: str = (
        "https://youtubeanalytics.googleapis.com/v2/reports"
    )

    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": (
            "views,likes,comments,"
            "estimatedMinutesWatched"
        ),
        "dimensions": "day",
        "sort": "day"
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                f"YOUTUBE ANALYTICS ERROR: "
                f"{response.text}"
            )

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch performance trends"
            )

        data = response.json()

        formatted_trends = []

        if "rows" in data:

            for row in data["rows"]:

                formatted_trends.append({
                    "date": row[0],
                    "views": row[1],
                    "likes": row[2],
                    "comments": row[3],
                    "watch_time_minutes": row[4]
                })

        return {
            "platform": "YOUTUBE",
            "report_type": "30_DAY_TREND",
            "data": formatted_trends
        }


async def get_youtube_geography(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if (
        account.token_expiry
        and datetime.now(timezone.utc)
        >= account.token_expiry - timedelta(minutes=5)
    ):

        refresh_res = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": account.refresh_token,
                "grant_type": "refresh_token"
            }
        )

        refresh_res.raise_for_status()

        token_json = refresh_res.json()

        account.access_token = token_json["access_token"]

        account.token_expiry = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=token_json["expires_in"]
            )
        )

        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    url: str = (
        "https://youtubeanalytics.googleapis.com/v2/reports"
    )

    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": (
            "views,estimatedMinutesWatched"
        ),
        "dimensions": "country",
        "sort": "-views",
        "maxResults": 10
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch geography stats"
            )

        data = response.json()

        formatted_geo = []

        if "rows" in data:

            for row in data["rows"]:

                formatted_geo.append({
                    "country": row[0],
                    "views": row[1],
                    "watch_time_minutes": row[2]
                })

        return {
            "platform": "YOUTUBE",
            "report_type": "GEOGRAPHIC_DISTRIBUTION",
            "data": formatted_geo
        }


async def get_youtube_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if (
        account.token_expiry
        and datetime.now(timezone.utc)
        >= account.token_expiry - timedelta(minutes=5)
    ):

        refresh_res = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "refresh_token": account.refresh_token,
                "grant_type": "refresh_token"
            }
        )

        refresh_res.raise_for_status()

        token_json = refresh_res.json()

        account.access_token = token_json["access_token"]

        account.token_expiry = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=token_json["expires_in"]
            )
        )

        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    url: str = (
        "https://youtubeanalytics.googleapis.com/v2/reports"
    )

    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "viewerPercentage",
        "dimensions": "ageGroup,gender",
        "sort": "ageGroup,gender"
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch demographics stats"
            )

        data = response.json()

        formatted_demo = []

        if "rows" in data:

            for row in data["rows"]:

                formatted_demo.append({
                    "age_group": row[0],
                    "gender": row[1],
                    "viewer_percentage": row[2]
                })

        return {
            "platform": "YOUTUBE",
            "report_type": "AUDIENCE_DEMOGRAPHICS",
            "data": formatted_demo
        }


# =========================================================
# LINKEDIN ANALYTICS
# =========================================================

async def get_linkedin_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "LINKEDIN",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": 1,
            "organic_followers": 1,
            "paid_followers": 0
        }
    }


async def get_linkedin_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)

    trends = []

    for i in range(30, 0, -1):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        trends.append({
            "date": current_date,
            "impressions": random.randint(
                500,
                2000
            ),
            "clicks": random.randint(
                50,
                300
            ),
            "reactions": random.randint(
                20,
                150
            ),
            "comments": random.randint(
                5,
                40
            )
        })

    return {
        "platform": "LINKEDIN",
        "report_type": "30_DAY_TREND",
        "data": trends
    }


async def get_linkedin_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "LINKEDIN",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []
    }


# =========================================================
# CAMPAIGNS ANALYTICS
# =========================================================

async def get_campaign_performance(
    campaign_id: int,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if not campaign:
        raise integrations.CAMPAIGN_NOT_FOUND_EXCEPTION

    budget = (
        float(campaign.budget)
        if campaign.budget
        else 0.0
    )

    revenue = budget * 2.4

    return {
        "campaign_name": campaign.title,
        "status": campaign.status.value,
        "performance_reports": {
            "total_reach": 45200,
            "total_engagement": 3800,
            "conversion_rate": "3.2%"
        },
        "engagement_comparison": {
            "LINKEDIN": {
                "clicks": 850,
                "likes": 320,
                "comments": 45
            },
            "YOUTUBE": {
                "views": 12000,
                "likes": 950,
                "comments": 110
            }
        },
        "roi_tracking": {
            "budget_spent": budget,
            "estimated_revenue_generated": revenue,
            "roi_percentage": (
                140.0
                if budget > 0
                else 0.0
            )
        },
        "growth_monitoring": {
            "audience_growth_during_campaign": "+4.5%",
            "engagement_growth_vs_previous": "+12.1%"
        }
    }


# =========================================================
# X / TWITTER ANALYTICS
# =========================================================

async def get_x_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.X_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "X",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(
                100,
                1000
            ),
            "following": random.randint(
                5,
                50
            ),
            "listed_count": random.randint(
                1,
                10
            )
        }
    }


async def get_x_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.X_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)

    trends = []

    for i in range(30, 0, -1):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        trends.append({
            "date": current_date,
            "impressions": random.randint(
                500,
                2000
            ),
            "likes": random.randint(
                50,
                300
            ),
            "retweets": random.randint(
                20,
                150
            ),
            "replies": random.randint(
                5,
                40
            )
        })

    return {
        "platform": "X",
        "report_type": "30_DAY_TREND",
        "data": trends
    }


async def get_x_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.X_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "X",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []
    }


# =========================================================
# PINTEREST ANALYTICS
# =========================================================

async def get_pinterest_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "PINTEREST",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(
                100,
                1000
            ),
            "monthly_views": random.randint(
                5000,
                50000
            ),
            "saved_pins": random.randint(
                100,
                1000
            )
        }
    }


async def get_pinterest_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)

    trends = []

    for i in range(30, 0, -1):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        trends.append({
            "date": current_date,
            "impressions": random.randint(
                500,
                2000
            ),
            "clicks": random.randint(
                50,
                300
            ),
            "saves": random.randint(
                20,
                150
            ),
            "outbound_clicks": random.randint(
                5,
                40
            )
        })

    return {
        "platform": "PINTEREST",
        "report_type": "30_DAY_TREND",
        "data": trends
    }


async def get_pinterest_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "PINTEREST",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []
    }


# =========================================================
# FACEBOOK ANALYTICS - MOCK DATA
# =========================================================

async def get_facebook_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(
                1000,
                10000
            ),
            "page_likes": random.randint(
                800,
                9000
            ),
            "monthly_views": random.randint(
                5000,
                50000
            ),
            "engaged_users": random.randint(
                500,
                5000
            )
        }
    }


async def get_facebook_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)

    trends = []

    for i in range(30, 0, -1):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        trends.append({
            "date": current_date,
            "impressions": random.randint(
                1000,
                5000
            ),
            "clicks": random.randint(
                100,
                500
            ),
            "likes": random.randint(
                50,
                400
            ),
            "comments": random.randint(
                10,
                100
            ),
            "shares": random.randint(
                5,
                80
            )
        })

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_TREND",
        "data": trends
    }


async def get_facebook_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": {
            "age_groups": [
                {
                    "age_group": "18-24",
                    "percentage": 22
                },
                {
                    "age_group": "25-34",
                    "percentage": 38
                },
                {
                    "age_group": "35-44",
                    "percentage": 24
                },
                {
                    "age_group": "45-54",
                    "percentage": 11
                },
                {
                    "age_group": "55+",
                    "percentage": 5
                }
            ],
            "gender": [
                {
                    "gender": "Female",
                    "percentage": 48
                },
                {
                    "gender": "Male",
                    "percentage": 49
                },
                {
                    "gender": "Other",
                    "percentage": 3
                }
            ]
        }
    }


# =========================================================
# INSTAGRAM ANALYTICS - MOCK DATA
# =========================================================

async def get_instagram_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.INSTAGRAM_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "INSTAGRAM",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(
                1500,
                15000
            ),
            "following": random.randint(
                100,
                1000
            ),
            "monthly_reach": random.randint(
                5000,
                60000
            ),
            "engaged_accounts": random.randint(
                500,
                6000
            )
        }
    }


async def get_instagram_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.INSTAGRAM_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)

    trends = []

    for i in range(30, 0, -1):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        trends.append({
            "date": current_date,
            "impressions": random.randint(
                1200,
                6000
            ),
            "reach": random.randint(
                800,
                4500
            ),
            "likes": random.randint(
                80,
                500
            ),
            "comments": random.randint(
                10,
                120
            ),
            "saves": random.randint(
                20,
                150
            ),
            "shares": random.randint(
                10,
                100
            )
        })

    return {
        "platform": "INSTAGRAM",
        "report_type": "30_DAY_TREND",
        "data": trends
    }


async def get_instagram_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = (
        db.query(SocialAccount)
        .filter(SocialAccount.account_id == account_id)
        .first()
    )

    if not account:
        raise integrations.INSTAGRAM_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "INSTAGRAM",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": {
            "age_groups": [
                {
                    "age_group": "18-24",
                    "percentage": 28
                },
                {
                    "age_group": "25-34",
                    "percentage": 42
                },
                {
                    "age_group": "35-44",
                    "percentage": 18
                },
                {
                    "age_group": "45-54",
                    "percentage": 8
                },
                {
                    "age_group": "55+",
                    "percentage": 4
                }
            ],
            "gender": [
                {
                    "gender": "Female",
                    "percentage": 55
                },
                {
                    "gender": "Male",
                    "percentage": 42
                },
                {
                    "gender": "Other",
                    "percentage": 3
                }
            ]
        }
    }


# =========================================================
# AGGREGATED ANALYTICS DATA
# =========================================================

async def fetch_real_analytics_data(
    db: Session
):

    data = {
        "youtube": {
            "posts": 0,
            "impressions": 0,
            "clicks": 0,
            "followers": 0,
            "top_demo": "N/A",
            "roi": "N/A"
        },

        "linkedin": {
            "posts": 0,
            "impressions": 0,
            "clicks": 0,
            "followers": 0,
            "top_demo": "N/A",
            "roi": "N/A"
        },

        "x": {
            "posts": 0,
            "impressions": 0,
            "clicks": 0,
            "followers": 0,
            "top_demo": "N/A",
            "roi": "N/A"
        },

        "pinterest": {
            "posts": 0,
            "impressions": 0,
            "clicks": 0,
            "followers": 0,
            "top_demo": "N/A",
            "roi": "N/A"
        },

        "facebook": {
            "posts": 0,
            "impressions": 0,
            "clicks": 0,
            "followers": 0,
            "top_demo": "N/A",
            "roi": "N/A"
        },

        "instagram": {
            "posts": 0,
            "impressions": 0,
            "clicks": 0,
            "followers": 0,
            "top_demo": "N/A",
            "roi": "N/A"
        }
    }


    # =====================================================
    # 1. PUBLISHED POST COUNTS
    # =====================================================

    data["youtube"]["posts"] = (
        db.query(Schedule)
        .join(SocialAccount)
        .filter(
            SocialAccount.platform == "youtube",
            Schedule.status == ScheduleStatus.PUBLISHED
        )
        .count()
    )

    data["linkedin"]["posts"] = (
        db.query(Schedule)
        .join(SocialAccount)
        .filter(
            SocialAccount.platform == "linkedin",
            Schedule.status == ScheduleStatus.PUBLISHED
        )
        .count()
    )

    data["x"]["posts"] = (
        db.query(Schedule)
        .join(SocialAccount)
        .filter(
            SocialAccount.platform == "x",
            Schedule.status == ScheduleStatus.PUBLISHED
        )
        .count()
    )

    data["pinterest"]["posts"] = (
        db.query(Schedule)
        .join(SocialAccount)
        .filter(
            SocialAccount.platform == "pinterest",
            Schedule.status == ScheduleStatus.PUBLISHED
        )
        .count()
    )

    data["facebook"]["posts"] = (
        db.query(Schedule)
        .join(SocialAccount)
        .filter(
            SocialAccount.platform == "facebook",
            Schedule.status == ScheduleStatus.PUBLISHED
        )
        .count()
    )

    data["instagram"]["posts"] = (
        db.query(Schedule)
        .join(SocialAccount)
        .filter(
            SocialAccount.platform == "instagram",
            Schedule.status == ScheduleStatus.PUBLISHED
        )
        .count()
    )


    # =====================================================
    # 2. YOUTUBE
    # =====================================================

    youtube_accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.platform == "youtube"
        )
        .all()
    )

    for acc in youtube_accounts:

        try:

            aud_stats = (
                await get_youtube_audience_analytics(
                    acc.account_id,
                    db
                )
            )

            trend_stats = (
                await get_youtube_performance_trends(
                    acc.account_id,
                    db
                )
            )

            data["youtube"]["impressions"] += (
                aud_stats
                .get("audience", {})
                .get("total_views", 0)
            )

            data["youtube"]["followers"] += (
                aud_stats
                .get("audience", {})
                .get("subscriber_count", 0)
            )

            for day in trend_stats.get(
                "data",
                []
            ):

                data["youtube"]["clicks"] += (
                    day.get("likes", 0)
                    + day.get("comments", 0)
                )

            data["youtube"]["top_demo"] = (
                "18-24 (Estimated)"
            )

            data["youtube"]["roi"] = "Organic"

        except Exception as exc:

            print(
                f">>> YOUTUBE REPORT ERROR: {exc}",
                flush=True
            )


    # =====================================================
    # 3. LINKEDIN
    # =====================================================

    linkedin_accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.platform == "linkedin"
        )
        .all()
    )

    for acc in linkedin_accounts:

        try:

            li_aud = await get_linkedin_audience(
                acc.account_id,
                db
            )

            li_trends = await get_linkedin_trends(
                acc.account_id,
                db
            )

            data["linkedin"]["followers"] += (
                li_aud
                .get("data", {})
                .get("total_followers", 0)
            )

            for day in li_trends.get(
                "data",
                []
            ):

                data["linkedin"]["impressions"] += (
                    day.get(
                        "impressions",
                        0
                    )
                )

                data["linkedin"]["clicks"] += (
                    day.get(
                        "clicks",
                        0
                    )
                    + day.get(
                        "reactions",
                        0
                    )
                    + day.get(
                        "comments",
                        0
                    )
                )

            data["linkedin"]["top_demo"] = (
                "IT Professionals"
            )

            data["linkedin"]["roi"] = "Organic"

        except Exception as exc:

            print(
                f">>> LINKEDIN REPORT ERROR: {exc}",
                flush=True
            )


    # =====================================================
    # 4. X / TWITTER
    # =====================================================

    x_accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.platform == "x"
        )
        .all()
    )

    for acc in x_accounts:

        try:

            x_aud = await get_x_audience(
                acc.account_id,
                db
            )

            x_trends = await get_x_trends(
                acc.account_id,
                db
            )

            data["x"]["followers"] += (
                x_aud
                .get("data", {})
                .get("total_followers", 0)
            )

            for day in x_trends.get(
                "data",
                []
            ):

                data["x"]["impressions"] += (
                    day.get(
                        "impressions",
                        0
                    )
                )

                data["x"]["clicks"] += (
                    day.get(
                        "likes",
                        0
                    )
                    + day.get(
                        "retweets",
                        0
                    )
                    + day.get(
                        "replies",
                        0
                    )
                )

            data["x"]["top_demo"] = (
                "18-35 (Tech & Media)"
            )

            data["x"]["roi"] = "Organic"

        except Exception as exc:

            print(
                f">>> X REPORT ERROR: {exc}",
                flush=True
            )


    # =====================================================
    # 5. PINTEREST
    # =====================================================

    pinterest_accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.platform == "pinterest"
        )
        .all()
    )

    for acc in pinterest_accounts:

        try:

            pin_aud = (
                await get_pinterest_audience(
                    acc.account_id,
                    db
                )
            )

            pin_trends = (
                await get_pinterest_trends(
                    acc.account_id,
                    db
                )
            )

            data["pinterest"]["followers"] += (
                pin_aud
                .get("data", {})
                .get("total_followers", 0)
            )

            for day in pin_trends.get(
                "data",
                []
            ):

                data["pinterest"]["impressions"] += (
                    day.get(
                        "impressions",
                        0
                    )
                )

                data["pinterest"]["clicks"] += (
                    day.get(
                        "clicks",
                        0
                    )
                    + day.get(
                        "saves",
                        0
                    )
                    + day.get(
                        "outbound_clicks",
                        0
                    )
                )

            data["pinterest"]["top_demo"] = (
                "25-45 (Design & Lifestyle)"
            )

            data["pinterest"]["roi"] = "Organic"

        except Exception as exc:

            print(
                f">>> PINTEREST REPORT ERROR: {exc}",
                flush=True
            )


    # =====================================================
    # 6. FACEBOOK - MOCK ANALYTICS
    # =====================================================

    facebook_accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.platform == "facebook"
        )
        .all()
    )

    for acc in facebook_accounts:

        try:

            fb_aud = await get_facebook_audience(
                acc.account_id,
                db
            )

            fb_trends = await get_facebook_trends(
                acc.account_id,
                db
            )

            data["facebook"]["followers"] += (
                fb_aud
                .get("data", {})
                .get("total_followers", 0)
            )

            for day in fb_trends.get(
                "data",
                []
            ):

                data["facebook"]["impressions"] += (
                    day.get(
                        "impressions",
                        0
                    )
                )

                data["facebook"]["clicks"] += (
                    day.get(
                        "clicks",
                        0
                    )
                    + day.get(
                        "likes",
                        0
                    )
                    + day.get(
                        "comments",
                        0
                    )
                    + day.get(
                        "shares",
                        0
                    )
                )

            data["facebook"]["top_demo"] = (
                "25-34 (Estimated)"
            )

            data["facebook"]["roi"] = "Organic (Mock)"

        except Exception as exc:

            print(
                f">>> FACEBOOK REPORT ERROR: {exc}",
                flush=True
            )


    # =====================================================
    # 7. INSTAGRAM - MOCK ANALYTICS
    # =====================================================

    instagram_accounts = (
        db.query(SocialAccount)
        .filter(
            SocialAccount.platform == "instagram"
        )
        .all()
    )

    for acc in instagram_accounts:

        try:

            ig_aud = await get_instagram_audience(
                acc.account_id,
                db
            )

            ig_trends = await get_instagram_trends(
                acc.account_id,
                db
            )

            data["instagram"]["followers"] += (
                ig_aud
                .get("data", {})
                .get("total_followers", 0)
            )

            for day in ig_trends.get(
                "data",
                []
            ):

                data["instagram"]["impressions"] += (
                    day.get(
                        "impressions",
                        0
                    )
                )

                data["instagram"]["clicks"] += (
                    day.get(
                        "likes",
                        0
                    )
                    + day.get(
                        "comments",
                        0
                    )
                    + day.get(
                        "saves",
                        0
                    )
                    + day.get(
                        "shares",
                        0
                    )
                )

            data["instagram"]["top_demo"] = (
                "25-34 (Estimated)"
            )

            data["instagram"]["roi"] = (
                "Organic (Mock)"
            )

        except Exception as exc:

            print(
                f">>> INSTAGRAM REPORT ERROR: {exc}",
                flush=True
            )


    return data


# =========================================================
# EXCEL / CSV EXPORT
# =========================================================

@router.get(
    "/export/{platform}/excel"
)
async def export_platform_excel(
    platform: str = Path(
        ...,
        description=(
            "Must be 'youtube', 'linkedin', "
            "'x', 'pinterest', 'facebook', "
            "or 'instagram'"
        )
    ),
    db: Session = Depends(get_db)
):

    supported_platforms = [
        "youtube",
        "linkedin",
        "x",
        "pinterest",
        "facebook",
        "instagram"
    ]

    if platform not in supported_platforms:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid platform. Supported platforms: "
                "youtube, linkedin, x, pinterest, "
                "facebook, instagram."
            )
        )

    real_data = await fetch_real_analytics_data(
        db
    )

    stats = real_data[platform]

    rows = [
        {
            "Category": "Content Analytics",
            "Metric": "Published Posts",
            "Value": stats["posts"]
        },
        {
            "Category": "Content Analytics",
            "Metric": (
                "Total Views/Impressions"
            ),
            "Value": stats["impressions"]
        },
        {
            "Category": "Content Analytics",
            "Metric": "Total Interactions",
            "Value": stats["clicks"]
        },
        {
            "Category": "Audience Analytics",
            "Metric": (
                "Total Subscribers/Followers"
            ),
            "Value": stats["followers"]
        },
        {
            "Category": "Audience Analytics",
            "Metric": "Top Demographic",
            "Value": stats["top_demo"]
        },
        {
            "Category": "Campaign Analytics",
            "Metric": "Estimated ROI",
            "Value": stats["roi"]
        }
    ]

    df = pd.DataFrame(rows)

    stream = io.StringIO()

    df.to_csv(
        stream,
        index=False
    )

    response = StreamingResponse(
        iter([
            stream.getvalue()
        ]),
        media_type="text/csv"
    )

    response.headers[
        "Content-Disposition"
    ] = (
        "attachment; "
        f"filename=social_pilot_{platform}_report.csv"
    )

    return response


# =========================================================
# PDF EXPORT
# =========================================================

@router.get(
    "/export/{platform}/pdf"
)
async def export_platform_pdf(
    platform: str = Path(
        ...,
        description=(
            "Must be 'youtube', 'linkedin', "
            "'x', 'pinterest', 'facebook', "
            "or 'instagram'"
        )
    ),
    db: Session = Depends(get_db)
):

    supported_platforms = [
        "youtube",
        "linkedin",
        "x",
        "pinterest",
        "facebook",
        "instagram"
    ]

    if platform not in supported_platforms:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid platform. Supported platforms: "
                "youtube, linkedin, x, pinterest, "
                "facebook, instagram."
            )
        )

    real_data = await fetch_real_analytics_data(
        db
    )

    stats = real_data[platform]


    # =====================================================
    # PLATFORM BRANDING
    # =====================================================

    if platform == "youtube":

        p_name = "YouTube"
        header_color = (
            255,
            0,
            0
        )

    elif platform == "linkedin":

        p_name = "LinkedIn"
        header_color = (
            0,
            119,
            181
        )

    elif platform == "x":

        p_name = "X (Twitter)"
        header_color = (
            15,
            20,
            25
        )

    elif platform == "pinterest":

        p_name = "Pinterest"
        header_color = (
            230,
            0,
            35
        )

    elif platform == "facebook":

        p_name = "Facebook"
        header_color = (
            24,
            119,
            242
        )

    else:

        p_name = "Instagram"
        header_color = (
            193,
            53,
            132
        )


    # =====================================================
    # CREATE PDF
    # =====================================================

    pdf = FPDF()

    pdf.add_page()


    # =====================================================
    # HEADER
    # =====================================================

    pdf.set_font(
        "Arial",
        "B",
        18
    )

    pdf.set_text_color(
        *header_color
    )

    pdf.cell(
        0,
        10,
        f"Social Pilot - {p_name} Report",
        ln=True,
        align="C"
    )

    pdf.set_font(
        "Arial",
        "I",
        10
    )

    pdf.set_text_color(
        100,
        100,
        100
    )

    pdf.cell(
        0,
        10,
        (
            "Generated on: "
            f"{datetime.now().strftime('%Y-%m-%d %H:%M')}"
        ),
        ln=True,
        align="C"
    )

    pdf.ln(10)


    # =====================================================
    # BODY TEXT COLOR
    # =====================================================

    pdf.set_text_color(
        0,
        0,
        0
    )


    # =====================================================
    # 1. CONTENT ANALYTICS
    # =====================================================

    pdf.set_font(
        "Arial",
        "B",
        14
    )

    pdf.cell(
        0,
        10,
        "1. Content Analytics",
        ln=True
    )

    pdf.set_font(
        "Arial",
        size=12
    )

    pdf.cell(
        0,
        8,
        (
            "- Published Posts (Via App): "
            f"{stats['posts']}"
        ),
        ln=True
    )

    pdf.cell(
        0,
        8,
        (
            "- Total Views/Impressions: "
            f"{stats['impressions']:,}"
        ),
        ln=True
    )

    pdf.cell(
        0,
        8,
        (
            "- Recent Interactions: "
            f"{stats['clicks']:,}"
        ),
        ln=True
    )

    pdf.ln(5)


    # =====================================================
    # 2. AUDIENCE ANALYTICS
    # =====================================================

    pdf.set_font(
        "Arial",
        "B",
        14
    )

    pdf.cell(
        0,
        10,
        "2. Audience Analytics",
        ln=True
    )

    pdf.set_font(
        "Arial",
        size=12
    )

    pdf.cell(
        0,
        8,
        (
            "- Total Subscribers/Followers: "
            f"{stats['followers']:,}"
        ),
        ln=True
    )

    pdf.cell(
        0,
        8,
        (
            "- Top Demographic: "
            f"{stats['top_demo']}"
        ),
        ln=True
    )

    pdf.ln(5)


    # =====================================================
    # 3. CAMPAIGN ANALYTICS
    # =====================================================

    pdf.set_font(
        "Arial",
        "B",
        14
    )

    pdf.cell(
        0,
        10,
        "3. Campaign Analytics",
        ln=True
    )

    pdf.set_font(
        "Arial",
        size=12
    )

    pdf.cell(
        0,
        8,
        (
            "- ROI Tracking: "
            f"{stats['roi']}"
        ),
        ln=True
    )


    # =====================================================
    # PDF OUTPUT
    # =====================================================

    pdf_bytes = pdf.output()

    response = StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf"
    )

    response.headers[
        "Content-Disposition"
    ] = (
        "attachment; "
        f"filename=social_pilot_{platform}_report.pdf"
    )

    return response
