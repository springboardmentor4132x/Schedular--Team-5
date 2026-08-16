from typing import List, Optional

from pydantic import BaseModel, Field


class AnalyticsKPI(BaseModel):
    published_posts: int = 0
    scheduled_posts: int = 0
    failed_posts: int = 0
    reach: float = 0
    impressions: float = 0
    engagementRate: float = 0
    followers: float = 0
    likes: float = 0
    comments: float = 0
    shares: float = 0
    clicks: float = 0
    engagement: float = 0


class FollowerGrowthItem(BaseModel):
    date: str
    instagram: float = 0
    facebook: float = 0
    twitter: float = 0
    linkedin: float = 0
    youtube: float = 0
    pinterest: float = 0


class EngagementTrendItem(BaseModel):
    date: str
    instagram: float = 0
    facebook: float = 0
    twitter: float = 0
    linkedin: float = 0
    youtube: float = 0
    pinterest: float = 0


class AudienceDemographicItem(BaseModel):
    age: str
    percentage: float = 0


class PlatformPerformanceItem(BaseModel):
    platform: str
    followers: float = 0
    reach: float = 0
    impressions: float = 0
    clicks: float = 0
    likes: float = 0
    comments: float = 0
    shares: float = 0
    engagement: float = 0
    engagement_rate: float = 0
    trend: float = 0


class TopPostItem(BaseModel):
    id: Optional[str] = None
    platform: str
    content: str = ""
    likes: float = 0
    comments: float = 0
    shares: float = 0
    clicks: float = 0
    reach: float = 0
    impressions: float = 0
    engagement: float = 0
    engagement_rate: float = 0


class CampaignAnalyticsItem(BaseModel):
    id: Optional[int] = None
    campaign_id: int
    total_posts: int = 0
    published_posts: int = 0
    scheduled_posts: int = 0
    failed_posts: int = 0
    reach: float = 0
    impressions: float = 0
    likes: float = 0
    comments: float = 0
    shares: float = 0
    clicks: float = 0
    engagement: float = 0
    engagement_rate: float = 0


class PostAnalyticsItem(BaseModel):
    id: Optional[int] = None
    post_id: int
    social_account_id: int
    platform: str
    platform_post_id: Optional[str] = None
    likes: float = 0
    comments: float = 0
    shares: float = 0
    clicks: float = 0
    reach: float = 0
    impressions: float = 0
    engagement: float = 0
    engagement_rate: float = 0
    recorded_at: Optional[str] = None


class AudienceAnalyticsItem(BaseModel):
    id: Optional[int] = None
    social_account_id: int
    platform: str
    age_group: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    followers: float = 0
    following: float = 0
    percentage: float = 0
    recorded_at: Optional[str] = None


class PlatformAnalyticsItem(BaseModel):
    id: Optional[int] = None
    social_account_id: int
    platform: str
    followers: float = 0
    reach: float = 0
    impressions: float = 0
    likes: float = 0
    comments: float = 0
    shares: float = 0
    clicks: float = 0
    engagement: float = 0
    engagement_rate: float = 0
    recorded_at: Optional[str] = None


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


class CampaignAnalyticsResponse(BaseModel):
    campaigns: List[CampaignAnalyticsItem] = Field(default_factory=list)


class PostAnalyticsResponse(BaseModel):
    posts: List[PostAnalyticsItem] = Field(default_factory=list)


class AudienceAnalyticsResponse(BaseModel):
    audience: List[AudienceAnalyticsItem] = Field(default_factory=list)


class PlatformAnalyticsResponse(BaseModel):
    platforms: List[PlatformAnalyticsItem] = Field(default_factory=list)


class AnalyticsTrendResponse(BaseModel):
    followerGrowth: List[FollowerGrowthItem] = Field(default_factory=list)
    engagementTrend: List[EngagementTrendItem] = Field(default_factory=list)