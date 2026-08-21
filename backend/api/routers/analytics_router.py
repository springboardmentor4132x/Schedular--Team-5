from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.campaign import Campaign
from api.models.social_account import SocialAccount
from api.services.youtube import get_valid_youtube_token

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Annotated, Dict

import httpx
import random


router = APIRouter(
    prefix="/audience",
    tags=["Analytics"]
)


# ============================================================
# YOUTUBE ANALYTICS
# ============================================================


@router.get("/youtube/{account_id}/analytics")
async def get_youtube_audience_analytics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "youtube"
    ).first()

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    # Get a valid access token.
    # This automatically refreshes the token when required.
    access_token = await get_valid_youtube_token(
        db,
        account
    )

    headers: Dict = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    url = "https://youtube.googleapis.com/youtube/v3/channels"

    params: Dict = {
        "part": "statistics",
        "mine": "true"
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                "YOUTUBE API ERROR:",
                response.status_code,
                response.text
            )

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch YouTube analytics"
            )

        data = response.json()

        if not data.get("items"):
            raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION

        stats = data["items"][0].get(
            "statistics",
            {}
        )

        return {
            "platform": "YOUTUBE",
            "audience": {
                "follower_count": int(
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


# ============================================================
# YOUTUBE SINGLE VIDEO ANALYTICS
# ============================================================


@router.get(
    "/youtube/{account_id}/content/{video_id}"
)
async def get_youtube_content_analytics(
    account_id: str,
    video_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "youtube"
    ).first()

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    access_token = await get_valid_youtube_token(
        db,
        account
    )

    headers: Dict = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    url = "https://youtube.googleapis.com/youtube/v3/videos"

    params: Dict = {
        "part": "statistics",
        "id": video_id
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                "YOUTUBE VIDEO API ERROR:",
                response.status_code,
                response.text
            )

            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch video analytics"
            )

        data = response.json()

        if not data.get("items"):
            raise integrations.YOUTUBE_VIDEO_NOT_FOUND_EXCEPTION

        stats = data["items"][0].get(
            "statistics",
            {}
        )

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


# ============================================================
# YOUTUBE CHANNEL CONTENT
# ============================================================


@router.get(
    "/youtube/{account_id}/content"
)
async def get_youtube_channel_content(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(
        10,
        ge=1,
        le=25,
        description="Number of recent YouTube videos to return"
    )
) -> Dict:
    """
    Fetches the latest videos from the connected YouTube channel.
    """

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "youtube"
    ).first()

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    access_token = await get_valid_youtube_token(
        db,
        account
    )

    headers: Dict = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        # ========================================================
        # STEP 1
        # Get authenticated channel and uploads playlist
        # ========================================================

        channel_url = (
            "https://youtube.googleapis.com/youtube/v3/channels"
        )

        channel_params: Dict = {
            "part": "contentDetails",
            "mine": "true"
        }

        channel_response = await client.get(
            channel_url,
            headers=headers,
            params=channel_params
        )

        if channel_response.status_code != 200:

            print(
                "YOUTUBE CHANNEL CONTENT ERROR:",
                channel_response.status_code,
                channel_response.text
            )

            raise HTTPException(
                status_code=channel_response.status_code,
                detail="Failed to fetch YouTube channel information"
            )

        channel_data = channel_response.json()

        if not channel_data.get("items"):
            raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION

        channel_item = channel_data["items"][0]

        uploads_playlist_id = (
            channel_item
            .get("contentDetails", {})
            .get("relatedPlaylists", {})
            .get("uploads")
        )

        if not uploads_playlist_id:

            return {
                "platform": "YOUTUBE",
                "report_type": "CHANNEL_CONTENT",
                "data": []
            }

        # ========================================================
        # STEP 2
        # Get recent videos from uploads playlist
        # ========================================================

        playlist_url = (
            "https://youtube.googleapis.com/youtube/v3/playlistItems"
        )

        playlist_params: Dict = {
            "part": "snippet,contentDetails",
            "playlistId": uploads_playlist_id,
            "maxResults": limit
        }

        playlist_response = await client.get(
            playlist_url,
            headers=headers,
            params=playlist_params
        )

        if playlist_response.status_code != 200:

            print(
                "YOUTUBE PLAYLIST ITEMS ERROR:",
                playlist_response.status_code,
                playlist_response.text
            )

            raise HTTPException(
                status_code=playlist_response.status_code,
                detail="Failed to fetch YouTube channel videos"
            )

        playlist_data = playlist_response.json()

        playlist_items = playlist_data.get(
            "items",
            []
        )

        if not playlist_items:

            return {
                "platform": "YOUTUBE",
                "report_type": "CHANNEL_CONTENT",
                "data": []
            }

        # ========================================================
        # STEP 3
        # Extract video IDs and metadata
        # ========================================================

        video_ids = []
        video_metadata = {}

        for item in playlist_items:

            content_details = item.get(
                "contentDetails",
                {}
            )

            snippet = item.get(
                "snippet",
                {}
            )

            video_id = content_details.get(
                "videoId"
            )

            if not video_id:
                continue

            video_ids.append(video_id)

            thumbnails = snippet.get(
                "thumbnails",
                {}
            )

            thumbnail_url = (
                thumbnails
                .get("maxres", {})
                .get("url")
            )

            if not thumbnail_url:
                thumbnail_url = (
                    thumbnails
                    .get("high", {})
                    .get("url")
                )

            if not thumbnail_url:
                thumbnail_url = (
                    thumbnails
                    .get("medium", {})
                    .get("url")
                )

            if not thumbnail_url:
                thumbnail_url = (
                    thumbnails
                    .get("default", {})
                    .get("url")
                )

            video_metadata[video_id] = {
                "title": snippet.get(
                    "title",
                    "Untitled video"
                ),
                "description": snippet.get(
                    "description",
                    ""
                ),
                "published_at": snippet.get(
                    "publishedAt"
                ),
                "channel_title": snippet.get(
                    "channelTitle"
                ),
                "thumbnail": thumbnail_url
            }

        if not video_ids:

            return {
                "platform": "YOUTUBE",
                "report_type": "CHANNEL_CONTENT",
                "data": []
            }

        # ========================================================
        # STEP 4
        # Get statistics for all videos
        # ========================================================

        videos_url = (
            "https://youtube.googleapis.com/youtube/v3/videos"
        )

        videos_params: Dict = {
            "part": "statistics,contentDetails",
            "id": ",".join(video_ids)
        }

        videos_response = await client.get(
            videos_url,
            headers=headers,
            params=videos_params
        )

        if videos_response.status_code != 200:

            print(
                "YOUTUBE VIDEO STATISTICS ERROR:",
                videos_response.status_code,
                videos_response.text
            )

            raise HTTPException(
                status_code=videos_response.status_code,
                detail="Failed to fetch YouTube video statistics"
            )

        videos_data = videos_response.json()

        # ========================================================
        # STEP 5
        # Create frontend-friendly response
        # ========================================================

        formatted_content = []

        for item in videos_data.get(
            "items",
            []
        ):

            video_id = item.get("id")

            if not video_id:
                continue

            metadata = video_metadata.get(
                video_id,
                {}
            )

            stats = item.get(
                "statistics",
                {}
            )

            content_details = item.get(
                "contentDetails",
                {}
            )

            formatted_content.append({

                "video_id": video_id,

                "title": metadata.get(
                    "title",
                    "Untitled video"
                ),

                "description": metadata.get(
                    "description",
                    ""
                ),

                "published_at": metadata.get(
                    "published_at"
                ),

                "channel_title": metadata.get(
                    "channel_title"
                ),

                "thumbnail": metadata.get(
                    "thumbnail"
                ),

                "duration": content_details.get(
                    "duration"
                ),

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
            })

        return {
            "platform": "YOUTUBE",
            "report_type": "CHANNEL_CONTENT",
            "data": formatted_content
        }


# ============================================================
# YOUTUBE PERFORMANCE TRENDS
# ============================================================


@router.get(
    "/youtube/{account_id}/trends"
)
async def get_youtube_performance_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "youtube"
    ).first()

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    access_token = await get_valid_youtube_token(
        db,
        account
    )

    headers: Dict = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    url = (
        "https://youtubeanalytics.googleapis.com/v2/reports"
    )

    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": (
            "views,likes,comments,estimatedMinutesWatched"
        ),
        "dimensions": "day",
        "sort": "day"
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                "YOUTUBE ANALYTICS ERROR:",
                response.status_code,
                response.text
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


# ============================================================
# YOUTUBE GEOGRAPHY
# ============================================================


@router.get(
    "/youtube/{account_id}/geography"
)
async def get_youtube_geography(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "youtube"
    ).first()

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    access_token = await get_valid_youtube_token(
        db,
        account
    )

    headers: Dict = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    url = (
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

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                "YOUTUBE GEOGRAPHY ERROR:",
                response.status_code,
                response.text
            )

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


# ============================================================
# YOUTUBE DEMOGRAPHICS
# ============================================================


@router.get(
    "/youtube/{account_id}/demographics"
)
async def get_youtube_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "youtube"
    ).first()

    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    access_token = await get_valid_youtube_token(
        db,
        account
    )

    headers: Dict = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")

    start_date = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    ).strftime("%Y-%m-%d")

    url = (
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

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:

            print(
                "YOUTUBE DEMOGRAPHICS ERROR:",
                response.status_code,
                response.text
            )

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


# ============================================================
# FACEBOOK ANALYTICS - MOCK DATA
# ============================================================


@router.get(
    "/facebook/{account_id}/analytics"
)
async def get_facebook_audience_analytics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:
    """
    Returns mock Facebook audience analytics.

    This is intentionally mock data for the Analytics page.
    """

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "facebook"
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Facebook account not found"
        )

    return {
        "platform": "FACEBOOK",
        "audience": {
            "follower_count": 15840,
            "total_views": 284600,
            "total_videos": 0
        }
    }


# Alias using the same structure as LinkedIn-style audience routes.
@router.get(
    "/facebook/{account_id}/audience"
)
async def get_facebook_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:
    """
    Returns mock Facebook audience statistics.
    """

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "facebook"
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Facebook account not found"
        )

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": 15840,
            "followers_growth": 6.8,
            "page_views": 284600,
            "reach": 186400,
            "engagement": 12450
        }
    }


# ============================================================
# FACEBOOK PERFORMANCE TRENDS - MOCK DATA
# ============================================================


@router.get(
    "/facebook/{account_id}/trends"
)
async def get_facebook_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:
    """
    Returns mock 30-day Facebook performance trends.
    """

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "facebook"
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Facebook account not found"
        )

    end_date = datetime.now(
        timezone.utc
    )

    mock_trends = []

    for i in range(
        30,
        0,
        -1
    ):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        mock_trends.append({
            "date": current_date,
            "reach": random.randint(
                3500,
                9500
            ),
            "impressions": random.randint(
                6000,
                18000
            ),
            "likes": random.randint(
                100,
                450
            ),
            "comments": random.randint(
                10,
                80
            ),
            "shares": random.randint(
                15,
                120
            ),
            "clicks": random.randint(
                50,
                350
            )
        })

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_TREND",
        "data": mock_trends
    }


# ============================================================
# FACEBOOK DEMOGRAPHICS - MOCK DATA
# ============================================================


@router.get(
    "/facebook/{account_id}/demographics"
)
async def get_facebook_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:
    """
    Returns mock Facebook audience demographics.
    """

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "facebook"
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Facebook account not found"
        )

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": {
            "age_groups": [
                {
                    "age_group": "18-24",
                    "percentage": 18
                },
                {
                    "age_group": "25-34",
                    "percentage": 34
                },
                {
                    "age_group": "35-44",
                    "percentage": 25
                },
                {
                    "age_group": "45-54",
                    "percentage": 14
                },
                {
                    "age_group": "55+",
                    "percentage": 9
                }
            ],
            "gender": [
                {
                    "gender": "Female",
                    "percentage": 52
                },
                {
                    "gender": "Male",
                    "percentage": 45
                },
                {
                    "gender": "Other",
                    "percentage": 3
                }
            ]
        }
    }


# ============================================================
# LINKEDIN ANALYTICS
# ============================================================


@router.get(
    "/linkedin/{account_id}/audience"
)
async def get_linkedin_audience_mock(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "linkedin"
    ).first()

    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "LINKEDIN",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": 12450,
            "organic_followers": 10200,
            "paid_followers": 2250
        }
    }


@router.get(
    "/linkedin/{account_id}/trends"
)
async def get_linkedin_trends_mock(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "linkedin"
    ).first()

    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(
        timezone.utc
    )

    mock_trends = []

    for i in range(
        30,
        0,
        -1
    ):

        current_date = (
            end_date - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        mock_trends.append({
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
        "data": mock_trends
    }


@router.get(
    "/linkedin/{account_id}/demographics"
)
async def get_linkedin_demographics_mock(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    range: str = Query(
        "30d",
        description="Time range for analytics"
    )
) -> Dict:

    account = db.query(SocialAccount).filter(
        SocialAccount.id == int(account_id),
        SocialAccount.platform == "linkedin"
    ).first()

    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "LINKEDIN",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": {
            "seniority": [
                {
                    "level": "Entry",
                    "percentage": 45
                },
                {
                    "level": "Senior",
                    "percentage": 30
                },
                {
                    "level": "Manager",
                    "percentage": 15
                },
                {
                    "level": "Director+",
                    "percentage": 10
                }
            ],
            "industry": [
                {
                    "name": "Information Technology",
                    "percentage": 60
                },
                {
                    "name": "Financial Services",
                    "percentage": 20
                },
                {
                    "name": "Marketing",
                    "percentage": 15
                },
                {
                    "name": "Other",
                    "percentage": 5
                }
            ]
        }
    }


# ============================================================
# CAMPAIGN PERFORMANCE
# ============================================================


@router.get(
    "/campaigns/{campaign_id}/performance"
)
async def get_campaign_performance(
    campaign_id: int,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    """
    Fetches performance, ROI, and engagement comparison
    for a specific campaign.
    """

    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id
    ).first()

    if not campaign:
        raise integrations.CAMPAIGN_NOT_FOUND_EXCEPTION

    budget = (
        float(campaign.budget)
        if campaign.budget
        else 0.0
    )

    mock_revenue = budget * 2.4

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
            },

            "FACEBOOK": {
                "reach": 186400,
                "likes": 1250,
                "comments": 185,
                "shares": 340
            }
        },

        "roi_tracking": {
            "budget_spent": budget,
            "estimated_revenue_generated": mock_revenue,
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