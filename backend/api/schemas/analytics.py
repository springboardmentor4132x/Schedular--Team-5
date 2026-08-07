from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyticsKPI(BaseModel):
    reach: float = 0
    impressions: float = 0
    engagementRate: float = 0
    followers: float = 0


class FollowerGrowthItem(BaseModel):
    date: str
    instagram: float = 0
    facebook: float = 0
    twitter: float = 0
    linkedin: float = 0


class EngagementTrendItem(BaseModel):
    date: str
    instagram: float = 0
    facebook: float = 0
    twitter: float = 0
    linkedin: float = 0


class AudienceDemographicItem(BaseModel):
    age: str
    percentage: float = 0


class PlatformPerformanceItem(BaseModel):
    platform: str
    reach: float = 0
    impressions: float = 0
    clicks: float = 0
    engagement: float = 0
    trend: float = 0


class TopPostItem(BaseModel):
    id: Optional[str] = None
    platform: str
    content: str = ""
    likes: float = 0
    comments: float = 0
    shares: float = 0
    reach: float = 0


class AnalyticsDashboardResponse(BaseModel):
    kpis: AnalyticsKPI = Field(default_factory=AnalyticsKPI)
    followerGrowth: List[FollowerGrowthItem] = Field(default_factory=list)
    engagementTrend: List[EngagementTrendItem] = Field(default_factory=list)
    audienceDemographics: List[AudienceDemographicItem] = Field(
        default_factory=list
    )
    platformPerformance: List[PlatformPerformanceItem] = Field(
        default_factory=list
    )
    topPosts: List[TopPostItem] = Field(default_factory=list)