
from api.core.config import settings
from api.dependencies.database import get_db
from api.exceptions import integrations
from api.models.campaign import Campaign
from api.models.social_account import SocialAccount
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, Dict
import httpx
import random

router = APIRouter(
    prefix="/audience",
    tags=["Analytics"]
)

# =================
# YOUTUBE ANALYTICS
# =================

@router.get("/youtube/{account_id}/analytics")
async def get_youtube_audience_analytics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
        refresh_res = httpx.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": account.refresh_token,
            "grant_type": "refresh_token"
        })
        refresh_res.raise_for_status()
        token_json = refresh_res.json()
        
        account.access_token = token_json["access_token"]
        account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    url: str = "https://youtube.googleapis.com/youtube/v3/channels"
    params: Dict = {
        "part": "statistics",
        "mine": "true"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"YOUTUBE API ERROR: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch YouTube analytics")
            
        data = response.json()
        
        if not data.get("items"):
            raise integrations.YOUTUBE_CHANNEL_NOT_FOUND_EXCEPTION
            
        stats = data["items"][0]["statistics"]
        
        return {
            "platform": "YOUTUBE",
            "audience": {
                "subscriber_count": int(stats.get("subscriberCount", 0)),
                "total_views": int(stats.get("viewCount", 0)),
                "total_videos": int(stats.get("videoCount", 0))
            }
        }

@router.get("/youtube/{account_id}/content/{video_id}")
async def get_youtube_content_analytics(
    account_id: str, video_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
        refresh_res = httpx.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": account.refresh_token,
            "grant_type": "refresh_token"
        })
        refresh_res.raise_for_status()
        token_json = refresh_res.json()
        
        account.access_token = token_json["access_token"]
        account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }
    
    url: str = "https://youtube.googleapis.com/youtube/v3/videos"
    params: Dict = {
        "part": "statistics",
        "id": video_id
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch video analytics")
            
        data = response.json()
        
        if not data.get("items"):
            raise integrations.YOUTUBE_VIDEO_NOT_FOUND_EXCEPTION
            
        stats = data["items"][0]["statistics"]
        
        return {
            "platform": "YOUTUBE",
            "video_id": video_id,
            "engagement": {
                "views": int(stats.get("viewCount", 0)),
                "likes": int(stats.get("likeCount", 0)),
                "comments": int(stats.get("commentCount", 0))
            }
        }

@router.get("/youtube/{account_id}/trends")
async def get_youtube_performance_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
        refresh_res = httpx.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": account.refresh_token,
            "grant_type": "refresh_token"
        })
        refresh_res.raise_for_status()
        token_json = refresh_res.json()
        
        account.access_token = token_json["access_token"]
        account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }
    
    end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_date = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")

    url: str = "https://youtubeanalytics.googleapis.com/v2/reports"
    
    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "views,likes,comments,estimatedMinutesWatched",
        "dimensions": "day",
        "sort": "day"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"YOUTUBE ANALYTICS ERROR: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch performance trends")
            
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

@router.get("/youtube/{account_id}/geography")
async def get_youtube_geography(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
        refresh_res = httpx.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": account.refresh_token,
            "grant_type": "refresh_token"
        })
        refresh_res.raise_for_status()
        token_json = refresh_res.json()
        
        account.access_token = token_json["access_token"]
        account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_date = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")

    url: str = "https://youtubeanalytics.googleapis.com/v2/reports"
    
    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "views,estimatedMinutesWatched",
        "dimensions": "country",
        "sort": "-views",
        "maxResults": 10
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch geography stats")
            
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

@router.get("/youtube/{account_id}/demographics")
async def get_youtube_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    """Fetches audience demographics (age and gender breakdown)."""
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.YOUTUBE_ACCOUNT_NOT_FOUND_EXCEPTION

    if account.token_expiry and datetime.now(timezone.utc) >= account.token_expiry - timedelta(minutes=5):
        refresh_res = httpx.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": account.refresh_token,
            "grant_type": "refresh_token"
        })
        refresh_res.raise_for_status()
        token_json = refresh_res.json()
        
        account.access_token = token_json["access_token"]
        account.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=token_json["expires_in"])
        db.commit()

    headers: Dict = {
        "Authorization": f"Bearer {account.access_token}",
        "Accept": "application/json"
    }

    end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_date = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")

    url: str = "https://youtubeanalytics.googleapis.com/v2/reports"
    
    params: Dict = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "viewerPercentage",
        "dimensions": "ageGroup,gender",
        "sort": "ageGroup,gender"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch demographics stats")
            
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

# ==================
# LINKEDIN ANALYTICS
# ==================

@router.get("/linkedin/{account_id}/analytics")
async def get_linkedin_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
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

@router.get("/linkedin/{account_id}/trends")
async def get_linkedin_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)
    trends = []
    
    for i in range(30, 0, -1):
        current_date = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        trends.append({
            "date": current_date,
            "impressions": random.randint(500, 2000),
            "clicks": random.randint(50, 300),
            "reactions": random.randint(20, 150),
            "comments": random.randint(5, 40)
        })

    return {
        "platform": "LINKEDIN",
        "report_type": "30_DAY_TREND",
        "data": trends
    }

@router.get("/linkedin/{account_id}/demographics")
async def get_linkedin_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.LINKEDIN_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "LINKEDIN",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []# {
        #     "seniority": [
        #         {"level": "Entry", "percentage": 45},
        #         {"level": "Senior", "percentage": 30},
        #         {"level": "Manager", "percentage": 15},
        #         {"level": "Director+", "percentage": 10}
        #     ],
        #     "industry": [
        #         {"name": "Information Technology", "percentage": 60},
        #         {"name": "Financial Services", "percentage": 20},
        #         {"name": "Marketing", "percentage": 15},
        #         {"name": "Other", "percentage": 5}
        #     ]
        # }
    }

# ===================
# CAMPAIGNS ANALYTICS
# ===================

@router.get("/campaigns/{campaign_id}/performance")
async def get_campaign_performance(
    campaign_id: int,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise integrations.CAMPAIGN_NOT_FOUND_EXCEPTION

    budget = float(campaign.budget) if campaign.budget else 0.0
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
            "LINKEDIN": {"clicks": 850, "likes": 320, "comments": 45},
            "YOUTUBE": {"views": 12000, "likes": 950, "comments": 110}
        },
        "roi_tracking": {
            "budget_spent": budget,
            "estimated_revenue_generated": revenue,
            "roi_percentage": 140.0 if budget > 0 else 0.0
        },
        "growth_monitoring": {
            "audience_growth_during_campaign": "+4.5%",
            "engagement_growth_vs_previous": "+12.1%"
        }
    }

# ====================
# X (TWITTER ANALYTICS
# ====================

@router.get("/x/{account_id}/analytics")
async def get_x_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.X_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "X",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(100, 1000),
            "following": random.randint(5, 50),
            "listed_count": random.randint(1, 10)
        }
    }

@router.get("/x/{account_id}/trends")
async def get_x_trends (
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.X_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)
    trends = []
    
    for i in range(30, 0, -1):
        current_date = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        trends.append({
            "date": current_date,
            "impressions": random.randint(500, 2000),
            "likes": random.randint(50, 300),
            "retweets": random.randint(20, 150),
            "replies": random.randint(5, 40)
        })

    return {
        "platform": "X",
        "report_type": "30_DAY_TREND",
        "data": trends
    }

@router.get("/x/{account_id}/demographics")
async def get_x_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.X_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "X",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []
    }

# ===================
# PINTEREST ANALYTICS
# ===================

@router.get("/pinterest/{account_id}/analytics")
async def get_pinterest_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "PINTEREST",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(100, 1000),
            "monthly_views": random.randint(5, 50),
            "saved_pins": random.randint(1, 10)
        }
    }

@router.get("/pinterest/{account_id}/trends")
async def get_pinterest_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)
    trends = []
    
    for i in range(30, 0, -1):
        current_date = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        trends.append({
            "date": current_date,
            "impressions": random.randint(500, 2000),
            "clicks": random.randint(50, 300),
            "saves": random.randint(20, 150),
            "outbound_clicks": random.randint(5, 40)
        })

    return {
        "platform": "PINTEREST",
        "report_type": "30_DAY_TREND",
        "data": trends
    }

@router.get("/pinterest/{account_id}/demographics")
async def get_pinterest_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:
    
    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.PINTEREST_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "PINTEREST",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []
    }

# ===================
# FACEBOOK ANALYTICS
# ===================

@router.get("/facebook/{account_id}/analytics")
async def get_facebook_audience(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_STATS",
        "data": {
            "total_followers": random.randint(100, 1000),
            "monthly_views": random.randint(5, 50),
            "saved_pins": random.randint(1, 10)
        }
    }

@router.get("/facebook/{account_id}/trends")
async def get_facebook_trends(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()
    if not account:
        raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

    end_date = datetime.now(timezone.utc)
    trends = []

    for i in range(30, 0, -1):
        current_date = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        trends.append({
            "date": current_date,
            "impressions": random.randint(500, 2000),
            "clicks": random.randint(50, 300),
            "saves": random.randint(20, 150),
            "outbound_clicks": random.randint(5, 40)
        })

    return {
        "platform": "FACEBOOK",
        "report_type": "30_DAY_TREND",
        "data": trends
    }

@router.get("/facebook/{account_id}/demographics")
async def get_facebook_demographics(
    account_id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Dict:

    account = db.query(SocialAccount).filter(SocialAccount.account_id == account_id).first()

    if not account:
        raise integrations.FACEBOOK_ACCOUNT_NOT_FOUND_EXCEPTION

    return {
        "platform": "FACEBOOK",
        "report_type": "AUDIENCE_DEMOGRAPHICS",
        "data": []
    }
