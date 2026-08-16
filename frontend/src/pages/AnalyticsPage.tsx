import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Heart,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  Users,
  Video,
  ExternalLink,
  Instagram,
  Youtube,
  Linkedin,
  CalendarDays,
  BarChart3,
  Activity,
  Image as ImageIcon,
  Globe2,
  UserRound,
} from 'lucide-react';

import {
  Card,
  Button,
  Badge,
} from '../components/ui';

import { cn } from '../utils/helpers';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

/* ============================================================
   COMMON TYPES
============================================================ */

type SocialAccount = {
  id: number;
  account_id?: string;
  account_name?: string;
  platform?: string;
  is_connected?: boolean;
  [key: string]: any;
};

type MetricCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  className?: string;
};

/* ============================================================
   INSTAGRAM TYPES
============================================================ */

type InstagramOverview = {
  platform?: string;
  account_id?: string;
  username?: string;
  name?: string | null;
  profile_picture?: string | null;
  followers?: number;
  following?: number;
  media_count?: number;
};

type InstagramAudience = {
  platform?: string;
  report_type?: string;
  data?: {
    username?: string;
    followers?: number;
    following?: number;
    media_count?: number;
  };
};

type InstagramInsightValue = {
  value?: number;
  end_time?: string;
};

type InstagramInsightItem = {
  name?: string;
  period?: string;
  title?: string;
  description?: string;
  values?: InstagramInsightValue[];
  total_value?: {
    value?: number;
  } | null;
};

type InstagramInsights = {
  platform?: string;
  report_type?: string;
  period?: {
    start?: string;
    until?: string;
  };
  summary?: {
    reach?: number;
    profile_views?: number;
    website_clicks?: number;
    accounts_engaged?: number;
    total_interactions?: number;
    views?: number;
  };
  data?: InstagramInsightItem[];
};

type InstagramTrendItem = {
  date?: string;
  reach?: number;
  profile_views?: number;
  views?: number;
};

type InstagramTrends = {
  platform?: string;
  report_type?: string;
  data?: InstagramTrendItem[];
};

type InstagramMedia = {
  id?: string;
  caption?: string | null;
  media_type?: string;
  media_product_type?: string;
  media_url?: string | null;
  thumbnail_url?: string | null;
  permalink?: string | null;
  timestamp?: string;
  likes?: number;
  comments?: number;
  engagement?: number;
  reach?: number;
  impressions?: number;
};

type InstagramMediaAnalyticsResponse = {
  platform?: string;
  media_id?: string;
  data?: InstagramMedia;
};

/* ============================================================
   YOUTUBE TYPES
============================================================ */

type YouTubeAnalytics = {
  platform?: string;
  audience?: {
    follower_count?: number;
    total_views?: number;
    total_videos?: number;
  };
};

type YouTubeContentItem = {
  video_id?: string;
  title?: string;
  description?: string;
  published_at?: string;
  channel_title?: string;
  thumbnail?: string | null;
  duration?: string;
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
};

type YouTubeContentAnalytics = {
  platform?: string;
  report_type?: string;
  data?: YouTubeContentItem[];
};

type YouTubeTrendItem = {
  date?: string;
  views?: number;
  likes?: number;
  comments?: number;
  watch_time_minutes?: number;
};

type YouTubeTrends = {
  platform?: string;
  report_type?: string;
  data?: YouTubeTrendItem[];
};

type YouTubeGeographyItem = {
  country?: string;
  views?: number;
  watch_time_minutes?: number;
};

type YouTubeGeography = {
  platform?: string;
  report_type?: string;
  data?: YouTubeGeographyItem[];
};

type YouTubeDemographicItem = {
  age_group?: string;
  gender?: string;
  viewer_percentage?: number;
};

type YouTubeDemographics = {
  platform?: string;
  report_type?: string;
  data?: YouTubeDemographicItem[];
};

/* ============================================================
   LINKEDIN TYPES
============================================================ */

type LinkedInAudience = {
  platform?: string;
  report_type?: string;
  data?: {
    total_followers?: number;
    organic_followers?: number;
    paid_followers?: number;
  };
};

type LinkedInTrendItem = {
  date?: string;
  followers?: number;
  total_followers?: number;
  organic_followers?: number;
  paid_followers?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  engagement?: number;
  [key: string]: any;
};

type LinkedInTrends = {
  platform?: string;
  report_type?: string;
  data?: LinkedInTrendItem[] | { items?: LinkedInTrendItem[]; results?: LinkedInTrendItem[] };
  [key: string]: any;
};

type LinkedInDemographicItem = {
  level?: string;
  name?: string;
  percentage?: number;
};

type LinkedInDemographics = {
  platform?: string;
  report_type?: string;
  data?: {
    seniority?: LinkedInDemographicItem[];
    industry?: LinkedInDemographicItem[];
  };
};

/* ============================================================
   HELPERS
============================================================ */

function formatNumber(
  value: number | string | null | undefined
): string {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN').format(numberValue);
}

function formatCompactNumber(
  value: number | string | null | undefined
): string {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return '0';
  }

  if (numberValue >= 10000000) {
    return `${(numberValue / 10000000).toFixed(1)}Cr`;
  }

  if (numberValue >= 100000) {
    return `${(numberValue / 100000).toFixed(1)}L`;
  }

  if (numberValue >= 1000) {
    return `${(numberValue / 1000).toFixed(1)}K`;
  }

  return String(numberValue);
}

function formatDate(
  value: string | undefined | null
): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateShort(
  value: string | undefined | null
): string {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

function getInstagramMediaImage(
  media: InstagramMedia
): string | null {
  const mediaType = String(
    media.media_type || ''
  ).toUpperCase();

  const productType = String(
    media.media_product_type || ''
  ).toUpperCase();

  if (
    mediaType === 'VIDEO' ||
    productType === 'REELS'
  ) {
    return media.thumbnail_url || null;
  }

  return (
    media.media_url ||
    media.thumbnail_url ||
    null
  );
}

function getMetricFromInsights(
  insights: InstagramInsights | null,
  metricName: string
): number {
  if (!insights) {
    return 0;
  }

  const directValue =
    insights.summary?.[
      metricName as keyof NonNullable<
        InstagramInsights['summary']
      >
    ];

  if (typeof directValue === 'number') {
    return directValue;
  }

  const item = insights.data?.find(
    (entry) =>
      entry.name === metricName
  );

  if (!item) {
    return 0;
  }

  if (
    typeof item.total_value?.value ===
    'number'
  ) {
    return item.total_value.value;
  }

  if (item.values?.length) {
    return item.values.reduce(
      (total, current) =>
        total +
        Number(current.value || 0),
      0
    );
  }

  return 0;
}

/* ============================================================
   COMMON UI
============================================================ */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-950">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function LoadingState({
  platform,
}: {
  platform: 'instagram' | 'youtube' | 'linkedin' | 'all' | 'all';
}) {
  const label =
    platform === 'youtube'
      ? 'YouTube'
      : platform === 'linkedin'
      ? 'LinkedIn'
      : platform === 'all'
      ? 'All Platforms'
      : 'Instagram';

  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-8 h-8 text-pink-600 animate-spin" />

        <p className="text-sm text-gray-500">
          Loading {label} analytics...
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="py-16 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        {icon || (
          <BarChart3 className="w-7 h-7 text-gray-400" />
        )}
      </div>

      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   YOUTUBE ANALYTICS PAGE
============================================================ */

function YouTubeAnalyticsView({
  accounts,
  selectedAccountId,
  onAccountChange,
  onRefresh,
  refreshing,
}: {
  accounts: SocialAccount[];
  selectedAccountId: number | null;
  onAccountChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [analytics, setAnalytics] =
    useState<YouTubeAnalytics | null>(null);

  const [trends, setTrends] =
    useState<YouTubeTrends | null>(null);

  const [geography, setGeography] =
    useState<YouTubeGeography | null>(null);

  const [demographics, setDemographics] =
    useState<YouTubeDemographics | null>(null);

  const [content, setContent] =
    useState<YouTubeContentAnalytics | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<
      'Overview' | 'Content' | 'Trends' | 'Audience'
    >('Overview');

  const [trendMetric, setTrendMetric] =
    useState<
      'views' | 'likes' | 'comments' | 'watch_time_minutes'
    >('views');

  const selectedAccount =
    accounts.find(
      (account) =>
        account.id === selectedAccountId
    );

  const fetchYouTubeEndpoint =
    async (
      accountId: number,
      endpoint: string
    ): Promise<any> => {
      const token =
        localStorage.getItem(
          'auth_token'
        );

      const response = await fetch(
        `${API_BASE_URL}/audience/youtube/${accountId}/${endpoint}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              }
            : {
                Accept: 'application/json',
              },
        }
      );

      if (!response.ok) {
        let message =
          `YouTube ${endpoint} request failed (${response.status})`;

        try {
          const body =
            await response.json();

          if (body?.detail) {
            message =
              typeof body.detail ===
              'string'
                ? body.detail
                : JSON.stringify(
                    body.detail
                  );
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      return response.json();
    };

  const loadAnalytics =
    async (
      accountId: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const [
          analyticsResponse,
          trendsResponse,
          geographyResponse,
          demographicsResponse,
          contentResponse,
        ] = await Promise.all([
          fetchYouTubeEndpoint(
            accountId,
            'analytics'
          ),
          fetchYouTubeEndpoint(
            accountId,
            'trends?range=30d'
          ),
          fetchYouTubeEndpoint(
            accountId,
            'geography?range=30d'
          ),
          fetchYouTubeEndpoint(
            accountId,
            'demographics?range=30d'
          ),
          fetchYouTubeEndpoint(
            accountId,
            'content?limit=10'
          ),
        ]);

        setAnalytics(
          analyticsResponse
        );

        setTrends(
          trendsResponse
        );

        setGeography(
          geographyResponse
        );

        setDemographics(
          demographicsResponse
        );

        setContent(
          contentResponse
        );
      } catch (err: any) {
        console.error(
          'YouTube analytics error:',
          err
        );

        setError(
          err?.message ||
            'Could not load YouTube analytics.'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (selectedAccountId !== null) {
      loadAnalytics(
        selectedAccountId
      );
    }
  }, [selectedAccountId]);

  const handleRefresh =
    async () => {
      if (
        selectedAccountId === null
      ) {
        return;
      }

      setError(null);

      try {
        await loadAnalytics(
          selectedAccountId
        );
      } catch (err) {
        console.error(err);
      }

      onRefresh();
    };

  const trendData =
    Array.isArray(trends?.data)
      ? trends.data
      : [];

  const maxTrendValue =
    Math.max(
      ...trendData.map(
        (item) =>
          Number(
            item[
              trendMetric
            ] || 0
          )
      ),
      1
    );

  const geographyData =
    Array.isArray(geography?.data)
      ? geography.data
      : [];

  const demographicsData =
    Array.isArray(
      demographics?.data
    )
      ? demographics.data
      : [];

  const contentData =
    Array.isArray(content?.data)
      ? content.data
      : [];

  const totalContentViews =
    contentData.reduce(
      (sum, item) =>
        sum + Number(item.engagement?.views || 0),
      0
    );

  const totalContentLikes =
    contentData.reduce(
      (sum, item) =>
        sum + Number(item.engagement?.likes || 0),
      0
    );

  const totalContentComments =
    contentData.reduce(
      (sum, item) =>
        sum + Number(item.engagement?.comments || 0),
      0
    );

  const totalViews =
    Number(
      analytics?.audience
        ?.total_views || 0
    );

  const subscriberCount =
    Number(
      analytics?.audience
        ?.follower_count || 0
    );

  const totalVideos =
    Number(
      analytics?.audience
        ?.total_videos || 0
    );

  const totalTrendViews =
    trendData.reduce(
      (sum, item) =>
        sum +
        Number(item.views || 0),
      0
    );

  const totalTrendLikes =
    trendData.reduce(
      (sum, item) =>
        sum +
        Number(item.likes || 0),
      0
    );

  const totalTrendComments =
    trendData.reduce(
      (sum, item) =>
        sum +
        Number(item.comments || 0),
      0
    );

  const totalWatchTime =
    trendData.reduce(
      (sum, item) =>
        sum +
        Number(
          item.watch_time_minutes ||
            0
        ),
      0
    );

  const highestCountryViews =
    Math.max(
      ...geographyData.map(
        (item) =>
          Number(
            item.views || 0
          )
      ),
      0
    );

  const accountName =
    selectedAccount?.account_name ||
    'YouTube Channel';

  if (
    loading &&
    !analytics
  ) {
    return (
      <LoadingState platform="youtube" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="w-5 h-5 text-red-600" />

              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                YouTube Analytics
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-950">
              YouTube Performance
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Channel performance, engagement,
              audience trends and geographic analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {accounts.length > 0 && (
              <select
                value={
                  selectedAccountId ?? ''
                }
                onChange={
                  onAccountChange
                }
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
              >
                {accounts.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.account_name ||
                        `YouTube Account ${account.id}`}
                    </option>
                  )
                )}
              </select>
            )}

            <Button
              variant="secondary"
              size="md"
              icon={
                <RefreshCw
                  className={cn(
                    'w-4 h-4',
                    refreshing &&
                      'animate-spin'
                  )}
                />
              }
              onClick={
                handleRefresh
              }
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
          {[
            'Overview',
            'Content',
            'Trends',
            'Audience',
          ].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab as
                    | 'Overview'
                    | 'Content'
                    | 'Trends'
                    | 'Audience'
                )
              }
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                activeTab === tab
                  ? 'border-red-600 text-red-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Channel summary */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <Youtube className="w-7 h-7 text-red-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-950">
                  {accountName}
                </h2>

                <Badge
                  variant="success"
                  className="!py-0.5"
                >
                  Connected
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                YouTube channel analytics
                connected to SocialPilot.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500">
                Subscribers
              </p>

              <p className="text-lg font-bold text-gray-900">
                {formatNumber(
                  subscriberCount
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Total Views
              </p>

              <p className="text-lg font-bold text-gray-900">
                {formatNumber(
                  totalViews
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Videos
              </p>

              <p className="text-lg font-bold text-gray-900">
                {formatNumber(
                  totalVideos
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Subscribers"
              value={formatNumber(
                subscriberCount
              )}
              subtitle="Current subscribers"
              icon={
                <Users className="w-5 h-5" />
              }
            />

            <MetricCard
              title="Total Views"
              value={formatNumber(
                totalViews
              )}
              subtitle="Lifetime channel views"
              icon={
                <Eye className="w-5 h-5" />
              }
            />

            <MetricCard
              title="Total Videos"
              value={formatNumber(
                totalVideos
              )}
              subtitle="Published videos"
              icon={
                <Video className="w-5 h-5" />
              }
            />

            <MetricCard
              title="30-Day Views"
              value={formatNumber(
                totalTrendViews
              )}
              subtitle="Views during trend period"
              icon={
                <TrendingUp className="w-5 h-5" />
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="30-Day Likes"
              value={formatNumber(
                totalTrendLikes
              )}
              subtitle="Likes during last 30 days"
              icon={
                <Heart className="w-5 h-5" />
              }
            />

            <MetricCard
              title="30-Day Comments"
              value={formatNumber(
                totalTrendComments
              )}
              subtitle="Comments during last 30 days"
              icon={
                <MessageCircle className="w-5 h-5" />
              }
            />

            <MetricCard
              title="Watch Time"
              value={`${formatNumber(
                Math.round(
                  totalWatchTime
                )
              )} min`}
              subtitle="Estimated watch time"
              icon={
                <Activity className="w-5 h-5" />
              }
            />
          </div>

          {/* Engagement summary */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <BarChart3 className="w-5 h-5 text-red-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  YouTube Engagement Overview
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Aggregated performance from the
                  YouTube Analytics API.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <Eye className="w-5 h-5 text-blue-500" />

                <p className="text-xs text-gray-500 mt-3">
                  Views
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCompactNumber(
                    totalTrendViews
                  )}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <Heart className="w-5 h-5 text-red-500" />

                <p className="text-xs text-gray-500 mt-3">
                  Likes
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCompactNumber(
                    totalTrendLikes
                  )}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <MessageCircle className="w-5 h-5 text-emerald-500" />

                <p className="text-xs text-gray-500 mt-3">
                  Comments
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCompactNumber(
                    totalTrendComments
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Reach explanation */}
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Recent YouTube Content
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Latest videos from the connected YouTube channel.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('Content')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                View all
              </button>
            </div>
            {contentData.length === 0 ? (
              <EmptyState message="No YouTube content available." icon={<Video className="w-7 h-7 text-gray-400" />} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {contentData.slice(0, 4).map((item, index) => (
                  <div key={item.video_id || index} className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title || 'YouTube video'} className="w-full aspect-video object-cover" />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center bg-gray-100"><Video className="w-8 h-8 text-gray-400" /></div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">{item.title || 'Untitled video'}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(item.published_at)}</p>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center"><Eye className="w-4 h-4 mx-auto text-blue-500" /><p className="text-xs font-semibold text-gray-900 mt-1">{formatCompactNumber(item.engagement?.views)}</p></div>
                        <div className="text-center"><Heart className="w-4 h-4 mx-auto text-red-500" /><p className="text-xs font-semibold text-gray-900 mt-1">{formatCompactNumber(item.engagement?.likes)}</p></div>
                        <div className="text-center"><MessageCircle className="w-4 h-4 mx-auto text-emerald-500" /><p className="text-xs font-semibold text-gray-900 mt-1">{formatCompactNumber(item.engagement?.comments)}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-red-600 mt-0.5" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  About YouTube reach
                </h3>

                <p className="text-sm text-gray-500 mt-2 leading-6">
                  The current YouTube backend endpoint
                  returns channel views, subscribers,
                  videos, likes, comments and watch time.
                  It does not return a separate metric
                  named "reach". Therefore, SocialPilot
                  displays YouTube Views as the primary
                  content-reach indicator instead of
                  inventing a reach value.
                </p>
              </div>
            </div>
          </Card>

          {/* Top countries */}
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-red-600" />

                  <h3 className="text-base font-semibold text-gray-900">
                    Top Audience Countries
                  </h3>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Countries generating the most views.
                </p>
              </div>

              <button
                onClick={() =>
                  setActiveTab(
                    'Audience'
                  )
                }
                className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                View details
              </button>
            </div>

            {geographyData.length ===
            0 ? (
              <EmptyState
                message="No geographic data available."
                icon={
                  <Globe2 className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="space-y-3">
                {geographyData
                  .slice(0, 5)
                  .map(
                    (
                      item,
                      index
                    ) => {
                      const views =
                        Number(
                          item.views ||
                            0
                        );

                      const width =
                        Math.max(
                          2,
                          (views /
                            Math.max(
                              highestCountryViews,
                              1
                            )) *
                            100
                        );

                      return (
                        <div
                          key={
                            item.country ||
                            index
                          }
                          className="grid grid-cols-[80px_1fr_70px] items-center gap-3"
                        >
                          <span className="text-xs font-medium text-gray-600">
                            {item.country ||
                              'Unknown'}
                          </span>

                          <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full rounded-lg bg-red-500"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-semibold text-gray-900 text-right">
                            {formatCompactNumber(
                              views
                            )}
                          </span>
                        </div>
                      );
                    }
                  )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {activeTab === 'Content' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Video className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  YouTube Content
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recent videos, thumbnails and engagement statistics from the connected YouTube channel.
                </p>
              </div>
            </div>

            {contentData.length === 0 ? (
              <EmptyState
                message="No YouTube videos found."
                icon={<Video className="w-7 h-7 text-gray-400" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {contentData.map((item, index) => (
                  <div
                    key={item.video_id || index}
                    className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {item.thumbnail ? (
                      <a
                        href={item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full aspect-video bg-gray-100 overflow-hidden"
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.title || 'YouTube video'}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </a>
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center bg-gray-100">
                        <Video className="w-10 h-10 text-gray-400" />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Video
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          {formatDate(item.published_at)}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px]">
                        {item.title || 'Untitled video'}
                      </h4>

                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 min-h-[32px]">
                        {item.description || 'No description'}
                      </p>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="text-center p-2 rounded-lg bg-gray-50">
                          <Eye className="w-4 h-4 mx-auto text-blue-500" />
                          <p className="text-xs text-gray-500 mt-1">Views</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatNumber(item.engagement?.views)}
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gray-50">
                          <Heart className="w-4 h-4 mx-auto text-red-500" />
                          <p className="text-xs text-gray-500 mt-1">Likes</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatNumber(item.engagement?.likes)}
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-gray-50">
                          <MessageCircle className="w-4 h-4 mx-auto text-emerald-500" />
                          <p className="text-xs text-gray-500 mt-1">Comments</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatNumber(item.engagement?.comments)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-4">
                        <span className="text-xs text-gray-500">
                          Duration: {item.duration || '—'}
                        </span>
                        {item.video_id && (
                          <a
                            href={`https://www.youtube.com/watch?v=${item.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                          >
                            Open Video
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Videos Loaded"
                value={formatNumber(contentData.length)}
                subtitle="Recent channel videos"
                icon={<Video className="w-5 h-5" />}
              />
              <MetricCard
                title="Content Views"
                value={formatNumber(totalContentViews)}
                subtitle="Views across loaded videos"
                icon={<Eye className="w-5 h-5" />}
              />
              <MetricCard
                title="Content Likes"
                value={formatNumber(totalContentLikes)}
                subtitle="Likes across loaded videos"
                icon={<Heart className="w-5 h-5" />}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================
          TRENDS
      ====================================================== */}

      {activeTab === 'Demographics' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Audience by Seniority
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  LinkedIn audience distribution by professional seniority.
                </p>
              </div>
            </div>
            {seniorityData.length === 0 ? (
              <EmptyState message="No LinkedIn seniority data available." icon={<Users className="w-7 h-7 text-gray-400" />} />
            ) : (
              <div className="space-y-4">
                {seniorityData.map((item, index) => {
                  const percentage = Number(item.percentage || 0);
                  const width = Math.max(2, (percentage / seniorityMax) * 100);
                  return (
                    <div key={`${item.level}-${index}`} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-900">{item.level || 'Unknown'}</span>
                        <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, width))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Globe2 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Audience by Industry
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  LinkedIn audience distribution by industry.
                </p>
              </div>
            </div>
            {industryData.length === 0 ? (
              <EmptyState message="No LinkedIn industry data available." icon={<Globe2 className="w-7 h-7 text-gray-400" />} />
            ) : (
              <div className="space-y-4">
                {industryData.map((item, index) => {
                  const percentage = Number(item.percentage || 0);
                  const width = Math.max(2, (percentage / industryMax) * 100);
                  return (
                    <div key={`${item.name}-${index}`} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-900">{item.name || 'Unknown'}</span>
                        <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, width))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'Trends' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  YouTube 30-Day Trends
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Daily performance returned by the
                  YouTube Analytics API.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto">
                {[
                  {
                    key: 'views',
                    label: 'Views',
                  },
                  {
                    key: 'likes',
                    label: 'Likes',
                  },
                  {
                    key: 'comments',
                    label: 'Comments',
                  },
                  {
                    key: 'watch_time_minutes',
                    label: 'Watch Time',
                  },
                ].map(
                  (metric) => (
                    <button
                      key={
                        metric.key
                      }
                      onClick={() =>
                        setTrendMetric(
                          metric.key as
                            | 'views'
                            | 'likes'
                            | 'comments'
                            | 'watch_time_minutes'
                        )
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap',
                        trendMetric ===
                          metric.key
                          ? 'bg-white text-red-600 shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-900'
                      )}
                    >
                      {
                        metric.label
                      }
                    </button>
                  )
                )}
              </div>
            </div>

            {trendData.length ===
            0 ? (
              <EmptyState
                message="No YouTube trend data available."
                icon={
                  <TrendingUp className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="space-y-3">
                {trendData.map(
                  (
                    item,
                    index
                  ) => {
                    const value =
                      Number(
                        item[
                          trendMetric
                        ] || 0
                      );

                    const width =
                      Math.max(
                        2,
                        (value /
                          maxTrendValue) *
                          100
                      );

                    return (
                      <div
                        key={
                          item.date ||
                          index
                        }
                        className="grid grid-cols-[70px_1fr_70px] items-center gap-3"
                      >
                        <span className="text-xs text-gray-500">
                          {formatDateShort(
                            item.date
                          )}
                        </span>

                        <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg bg-red-500 transition-all"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs font-semibold text-gray-900 text-right">
                          {formatCompactNumber(
                            value
                          )}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-5 h-5 text-red-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Trend Summary
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Aggregated metrics from the last 30
                  days.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">
                  Total Views
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(
                    totalTrendViews
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">
                  Total Likes
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(
                    totalTrendLikes
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">
                  Total Comments
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(
                    totalTrendComments
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">
                  Watch Time
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(
                    Math.round(
                      totalWatchTime
                    )
                  )}{' '}
                  min
                </p>
              </div>
            </div>
          </Card>

          {/* Daily data table */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <CalendarDays className="w-5 h-5 text-red-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Daily Performance
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Exact values returned by YouTube.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                      Views
                    </th>

                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                      Likes
                    </th>

                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                      Comments
                    </th>

                    <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                      Watch Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {trendData
                    .slice()
                    .reverse()
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            item.date ||
                            index
                          }
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-3 px-2 text-gray-700">
                            {formatDate(
                              item.date
                            )}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(
                              item.views
                            )}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(
                              item.likes
                            )}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(
                              item.comments
                            )}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(
                              item.watch_time_minutes
                            )}{' '}
                            min
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================
          AUDIENCE
      ====================================================== */}

      {activeTab === 'Audience' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Subscribers"
              value={formatNumber(
                subscriberCount
              )}
              subtitle="Current subscribers"
              icon={
                <Users className="w-5 h-5" />
              }
            />

            <MetricCard
              title="Total Views"
              value={formatNumber(
                totalViews
              )}
              subtitle="Lifetime views"
              icon={
                <Eye className="w-5 h-5" />
              }
            />

            <MetricCard
              title="Total Videos"
              value={formatNumber(
                totalVideos
              )}
              subtitle="Published videos"
              icon={
                <Video className="w-5 h-5" />
              }
            />
          </div>

          {/* Geography */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Globe2 className="w-5 h-5 text-red-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Geographic Distribution
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Views and watch time by country.
                </p>
              </div>
            </div>

            {geographyData.length ===
            0 ? (
              <EmptyState
                message="No geographic audience data available."
                icon={
                  <Globe2 className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="space-y-4">
                {geographyData.map(
                  (
                    item,
                    index
                  ) => {
                    const countryViews =
                      Number(
                        item.views ||
                          0
                      );

                    const width =
                      Math.max(
                        2,
                        (countryViews /
                          Math.max(
                            highestCountryViews,
                            1
                          )) *
                          100
                      );

                    return (
                      <div
                        key={
                          item.country ||
                          index
                        }
                        className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4 text-red-600" />

                            <span className="text-sm font-semibold text-gray-900">
                              {item.country ||
                                'Unknown'}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-gray-900">
                            {formatNumber(
                              countryViews
                            )}{' '}
                            views
                          </span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          Watch time:{' '}
                          {formatNumber(
                            item.watch_time_minutes
                          )}{' '}
                          minutes
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </Card>

          {/* Demographics */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <UserRound className="w-5 h-5 text-red-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Audience Demographics
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Viewer percentage by age group and
                  gender.
                </p>
              </div>
            </div>

            {demographicsData.length ===
            0 ? (
              <EmptyState
                message="No YouTube demographic data available."
                icon={
                  <UserRound className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demographicsData.map(
                  (
                    item,
                    index
                  ) => {
                    const percentage =
                      Number(
                        item.viewer_percentage ||
                          0
                      );

                    return (
                      <div
                        key={`${item.age_group}-${item.gender}-${index}`}
                        className="p-5 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.age_group ||
                                'Unknown age'}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {item.gender ||
                                'Unknown gender'}
                            </p>
                          </div>

                          <p className="text-xl font-bold text-red-600">
                            {percentage.toFixed(
                              1
                            )}
                            %
                          </p>
                        </div>

                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  percentage
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-red-600 mt-0.5" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  YouTube audience data
                </h3>

                <p className="text-sm text-gray-500 mt-2 leading-6">
                  Subscriber count and total channel
                  views come from the YouTube Data API.
                  Geographic and demographic statistics
                  come from the YouTube Analytics API for
                  the selected 30-day period.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


/* ============================================================
   LINKEDIN ANALYTICS PAGE
============================================================ */

function LinkedInAnalyticsView({
  accounts,
  selectedAccountId,
  onAccountChange,
  onRefresh,
  refreshing,
}: {
  accounts: SocialAccount[];
  selectedAccountId: number | null;
  onAccountChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [audience, setAudience] =
    useState<LinkedInAudience | null>(null);
  const [trends, setTrends] =
    useState<LinkedInTrends | null>(null);
  const [demographics, setDemographics] =
    useState<LinkedInDemographics | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);
  const [trendsError, setTrendsError] =
    useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<'Overview' | 'Audience' | 'Demographics' | 'Trends'>('Overview');
  const [trendMetric, setTrendMetric] =
    useState<
      'followers' | 'impressions' | 'reach' | 'clicks' |
      'reactions' | 'comments' | 'shares' | 'engagement'
    >('followers');

  const selectedAccount =
    accounts.find(
      (account) => account.id === selectedAccountId
    );

  const fetchLinkedInEndpoint =
    async (
      accountId: number,
      endpoint: string
    ): Promise<any> => {
      const token =
        localStorage.getItem('auth_token');

      const response = await fetch(
        `${API_BASE_URL}/audience/linkedin/${accountId}/${endpoint}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              }
            : {
                Accept: 'application/json',
              },
        }
      );

      if (!response.ok) {
        let message =
          `LinkedIn ${endpoint} request failed (${response.status})`;

        try {
          const body = await response.json();

          if (body?.detail) {
            message =
              typeof body.detail === 'string'
                ? body.detail
                : JSON.stringify(body.detail);
          }
        } catch {
          // Keep default error.
        }

        throw new Error(message);
      }

      return response.json();
    };

  const loadAnalytics =
    async (accountId: number) => {
      setLoading(true);
      setError(null);
      setTrendsError(null);

      try {
        /*
         * IMPORTANT:
         * The LinkedIn trends backend currently returns HTTP 500.
         * Promise.allSettled prevents that one endpoint from
         * breaking the working audience/demographics dashboard.
         */
        const [
          audienceResult,
          demographicsResult,
          trendsResult,
        ] = await Promise.allSettled([
          fetchLinkedInEndpoint(
            accountId,
            'audience?range=30d'
          ),
          fetchLinkedInEndpoint(
            accountId,
            'demographics?range=30d'
          ),
          fetchLinkedInEndpoint(
            accountId,
            'trends?range=30d'
          ),
        ]);

        if (
          audienceResult.status === 'fulfilled'
        ) {
          setAudience(
            audienceResult.value
          );
        } else {
          throw audienceResult.reason;
        }

        if (
          demographicsResult.status === 'fulfilled'
        ) {
          setDemographics(
            demographicsResult.value
          );
        } else {
          console.error(
            'LinkedIn demographics error:',
            demographicsResult.reason
          );
          setDemographics(null);
        }

        if (
          trendsResult.status === 'fulfilled'
        ) {
          setTrends(
            trendsResult.value
          );
          setTrendsError(null);
        } else {
          console.error(
            'LinkedIn trends error:',
            trendsResult.reason
          );
          setTrends(null);
          setTrendsError(
            trendsResult.reason?.message ||
              'LinkedIn trends are currently unavailable.'
          );
        }
      } catch (err: any) {
        console.error(
          'LinkedIn analytics error:',
          err
        );

        setError(
          err?.message ||
            'Could not load LinkedIn analytics.'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (selectedAccountId === null) {
      setLoading(false);
      setAudience(null);
      setTrends(null);
      setDemographics(null);
      setError(null);
      setTrendsError(null);
      return;
    }

    loadAnalytics(selectedAccountId);
  }, [selectedAccountId]);

  const audienceData = audience?.data;

  const totalFollowers =
    Number(audienceData?.total_followers || 0);
  const organicFollowers =
    Number(audienceData?.organic_followers || 0);
  const paidFollowers =
    Number(audienceData?.paid_followers || 0);

  const seniorityData =
    Array.isArray(demographics?.data?.seniority)
      ? demographics.data.seniority
      : [];

  const industryData =
    Array.isArray(demographics?.data?.industry)
      ? demographics.data.industry
      : [];

  const trendData = (() => {
    const data: any = trends?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray((trends as any)?.items)) {
      return (trends as any).items;
    }

    if (Array.isArray((trends as any)?.results)) {
      return (trends as any).results;
    }

    return [];
  })() as LinkedInTrendItem[];

  const trendMetricOptions = [
    { key: 'followers' as const, label: 'Followers' },
    { key: 'impressions' as const, label: 'Impressions' },
    { key: 'reach' as const, label: 'Reach' },
    { key: 'clicks' as const, label: 'Clicks' },
    { key: 'reactions' as const, label: 'Reactions' },
    { key: 'comments' as const, label: 'Comments' },
    { key: 'shares' as const, label: 'Shares' },
    { key: 'engagement' as const, label: 'Engagement' },
  ];

  const maxTrendValue =
    Math.max(
      ...trendData.map(
        (item) => Number(item[trendMetric] || 0)
      ),
      1
    );

  const hasTrendMetric =
    trendData.some(
      (item) => Number(item[trendMetric] || 0) > 0
    );

  const seniorityMax =
    Math.max(
      ...seniorityData.map(
        (item) => Number(item.percentage || 0)
      ),
      1
    );

  const industryMax =
    Math.max(
      ...industryData.map(
        (item) => Number(item.percentage || 0)
      ),
      1
    );

  if (loading && !audience) {
    return <LoadingState platform="linkedin" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Linkedin className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                LinkedIn Analytics
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-950">
              LinkedIn Performance
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Audience statistics, demographics and historical
              performance for the connected LinkedIn Organization Page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {accounts.length > 0 && (
              <select
                value={selectedAccountId ?? ''}
                onChange={onAccountChange}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
              >
                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.account_name ||
                      `LinkedIn Account ${account.id}`}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant="secondary"
              size="md"
              icon={
                <RefreshCw
                  className={cn(
                    'w-4 h-4',
                    refreshing && 'animate-spin'
                  )}
                />
              }
              onClick={async () => {
                if (
                  selectedAccountId !==
                  null
                ) {
                  await loadAnalytics(
                    selectedAccountId
                  );
                }

                onRefresh();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
          {['Overview', 'Audience', 'Demographics', 'Trends'].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab as
                    | 'Overview'
                    | 'Audience'
                    | 'Trends'
                )
              }
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Linkedin className="w-7 h-7 text-blue-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-950">
                  {selectedAccount?.account_name ||
                    'LinkedIn Organization Page'}
                </h2>

                <Badge
                  variant="success"
                  className="!py-0.5"
                >
                  Connected
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                LinkedIn Account ID:{' '}
                {selectedAccount?.account_id ||
                  selectedAccountId ||
                  '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500">
                Followers
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(totalFollowers)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Organic
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(organicFollowers)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Paid
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(paidFollowers)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total Followers"
              value={formatNumber(totalFollowers)}
              subtitle="Current LinkedIn followers"
              icon={<Users className="w-5 h-5" />}
            />

            <MetricCard
              title="Organic Followers"
              value={formatNumber(organicFollowers)}
              subtitle="Organic followers"
              icon={<TrendingUp className="w-5 h-5" />}
            />

            <MetricCard
              title="Paid Followers"
              value={formatNumber(paidFollowers)}
              subtitle="Paid followers"
              icon={<Activity className="w-5 h-5" />}
            />
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Users className="w-5 h-5 text-blue-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  LinkedIn Audience
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  Audience statistics returned by the LinkedIn analytics backend.
                </p>
              </div>
            </div>

            {audienceData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500">
                    Total Followers
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatNumber(totalFollowers)}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500">
                    Organic Followers
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatNumber(organicFollowers)}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500">
                    Paid Followers
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatNumber(paidFollowers)}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                message="No LinkedIn audience data available."
                icon={
                  <Linkedin className="w-7 h-7 text-gray-400" />
                }
              />
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  LinkedIn analytics
                </h3>

                <p className="text-sm text-gray-500 mt-2 leading-6">
                  Audience and demographic statistics are loaded for
                  the selected 30-day period. Historical trends are
                  loaded separately so a temporary trends API failure
                  does not prevent the rest of the LinkedIn dashboard
                  from rendering.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'Audience' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total Followers"
              value={formatNumber(totalFollowers)}
              subtitle="All followers"
              icon={<Users className="w-5 h-5" />}
            />

            <MetricCard
              title="Organic Followers"
              value={formatNumber(organicFollowers)}
              subtitle="Organic"
              icon={<TrendingUp className="w-5 h-5" />}
            />

            <MetricCard
              title="Paid Followers"
              value={formatNumber(paidFollowers)}
              subtitle="Paid"
              icon={<Activity className="w-5 h-5" />}
            />
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Users className="w-5 h-5 text-blue-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Audience Demographics
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  LinkedIn audience distribution by seniority and industry.
                </p>
              </div>
            </div>

            {seniorityData.length === 0 ? (
              <EmptyState
                message="No LinkedIn seniority data available."
                icon={
                  <Users className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="space-y-4">
                {seniorityData.map((item, index) => {
                  const percentage =
                    Number(item.percentage || 0);

                  const width =
                    Math.max(
                      2,
                      (percentage / seniorityMax) * 100
                    );

                  return (
                    <div
                      key={`${item.level}-${index}`}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.level || 'Unknown'}
                        </span>

                        <span className="text-sm font-bold text-gray-900">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Globe2 className="w-5 h-5 text-blue-600" />

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Audience by Industry
                </h3>

                <p className="text-xs text-gray-500 mt-0.5">
                  LinkedIn audience distribution by industry.
                </p>
              </div>
            </div>

            {industryData.length === 0 ? (
              <EmptyState
                message="No LinkedIn industry data available."
                icon={
                  <Globe2 className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="space-y-4">
                {industryData.map((item, index) => {
                  const percentage =
                    Number(item.percentage || 0);

                  const width =
                    Math.max(
                      2,
                      (percentage / industryMax) * 100
                    );

                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.name || 'Unknown'}
                        </span>

                        <span className="text-sm font-bold text-gray-900">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'Trends' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  LinkedIn Trends
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Historical LinkedIn performance returned by the trends API.
                </p>
              </div>

              {trendData.length > 0 && (
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto">
                  {trendMetricOptions.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() =>
                        setTrendMetric(metric.key)
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap',
                        trendMetric === metric.key
                          ? 'bg-white text-blue-600 shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-900'
                      )}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {trendsError ? (
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />

                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      LinkedIn trends are currently unavailable
                    </p>

                    <p className="text-xs text-amber-700 mt-1">
                      The frontend is connected to the trends endpoint,
                      but the backend is currently returning HTTP 500.
                      Audience and demographics continue to work independently.
                    </p>
                  </div>
                </div>
              </div>
            ) : trendData.length === 0 ? (
              <EmptyState
                message="No LinkedIn trend data available."
                icon={
                  <TrendingUp className="w-7 h-7 text-gray-400" />
                }
              />
            ) : !hasTrendMetric ? (
              <EmptyState
                message={`The trends response does not contain a populated "${trendMetric}" metric.`}
                icon={
                  <TrendingUp className="w-7 h-7 text-gray-400" />
                }
              />
            ) : (
              <div className="space-y-3">
                {trendData.map((item, index) => {
                  const value =
                    Number(item[trendMetric] || 0);

                  const width =
                    Math.max(
                      2,
                      (value / maxTrendValue) * 100
                    );

                  return (
                    <div
                      key={item.date || index}
                      className="grid grid-cols-[90px_1fr_80px] items-center gap-3"
                    >
                      <span className="text-xs text-gray-500">
                        {formatDateShort(item.date) ||
                          item.date ||
                          `Day ${index + 1}`}
                      </span>

                      <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg bg-blue-500 transition-all"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs font-semibold text-gray-900 text-right">
                        {formatCompactNumber(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {trendData.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <CalendarDays className="w-5 h-5 text-blue-600" />

                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Daily Performance
                  </h3>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Values returned by the LinkedIn trends endpoint.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                        Followers
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                        Impressions
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                        Clicks
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                        Engagement
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {trendData
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <tr
                          key={item.date || index}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-3 px-2 text-gray-700">
                            {formatDate(item.date)}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(
                              item.followers ??
                                item.total_followers
                            )}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(item.impressions)}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(item.clicks)}
                          </td>

                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatNumber(item.engagement)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ALL PLATFORMS ANALYTICS
============================================================ */

type AllPlatformSummary = {
  platform: 'instagram' | 'youtube' | 'linkedin';
  accountName: string;
  followers: number;
  reach: number;
  views: number;
  engagement: number;
  content: number;
  loading: boolean;
  error?: string;
};

function AllPlatformsAnalyticsView({
  accounts,
  onRefresh,
}: {
  accounts: SocialAccount[];
  onRefresh: () => void;
}) {
  const [summaries, setSummaries] = useState<AllPlatformSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getJson = async (endpoint: string) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: token
        ? { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        : { Accept: 'application/json' },
    });
    if (!response.ok) {
      let message = `Analytics request failed (${response.status})`;
      try {
        const body = await response.json();
        if (body?.detail) message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      } catch {}
      throw new Error(message);
    }
    return response.json();
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    const connected = accounts.filter((account) => account.is_connected !== false);
    const next: AllPlatformSummary[] = [];

    await Promise.all(
      connected.map(async (account) => {
        const platform = String(account.platform || '').toLowerCase() as AllPlatformSummary['platform'];
        if (!['instagram', 'youtube', 'linkedin'].includes(platform)) return;
        try {
          if (platform === 'instagram') {
            const [overview, insights] = await Promise.all([
              getJson(`/audience/instagram/${account.id}/overview`),
              getJson(`/audience/instagram/${account.id}/insights`),
            ]);
            next.push({
              platform,
              accountName: overview?.username || account.account_name || 'Instagram Account',
              followers: Number(overview?.followers || 0),
              reach: Number(insights?.summary?.reach || 0),
              views: Number(insights?.summary?.views || 0),
              engagement: Number(insights?.summary?.total_interactions || insights?.summary?.accounts_engaged || 0),
              content: Number(overview?.media_count || 0),
              loading: false,
            });
          } else if (platform === 'youtube') {
            const analytics = await getJson(`/audience/youtube/${account.id}/analytics`);
            next.push({
              platform,
              accountName: account.account_name || 'YouTube Channel',
              followers: Number(analytics?.audience?.follower_count || 0),
              reach: Number(analytics?.audience?.total_views || 0),
              views: Number(analytics?.audience?.total_views || 0),
              engagement: 0,
              content: Number(analytics?.audience?.total_videos || 0),
              loading: false,
            });
          } else {
            const audience = await getJson(`/audience/linkedin/${account.id}/audience?range=30d`);
            next.push({
              platform,
              accountName: account.account_name || 'LinkedIn Organization Page',
              followers: Number(audience?.data?.total_followers || 0),
              reach: 0,
              views: 0,
              engagement: 0,
              content: 0,
              loading: false,
            });
          }
        } catch (err: any) {
          next.push({
            platform,
            accountName: account.account_name || `${platform} Account`,
            followers: 0,
            reach: 0,
            views: 0,
            engagement: 0,
            content: 0,
            loading: false,
            error: err?.message || `Could not load ${platform} analytics.`,
          });
        }
      })
    );

    const order = { instagram: 0, youtube: 1, linkedin: 2 };
    next.sort((a, b) => order[a.platform] - order[b.platform]);
    setSummaries(next);
    if (next.length === 0) setError('No connected Instagram, YouTube, or LinkedIn accounts were found.');
    setLoading(false);
  };

  useEffect(() => { load(); }, [accounts]);

  const totalFollowers = summaries.reduce((sum, item) => sum + item.followers, 0);
  const totalReach = summaries.reduce((sum, item) => sum + item.reach, 0);
  const totalViews = summaries.reduce((sum, item) => sum + item.views, 0);
  const totalContent = summaries.reduce((sum, item) => sum + item.content, 0);

  if (loading) return <LoadingState platform="all" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-5 h-5 text-pink-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-600">All Platforms</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-950">Cross-Platform Performance</h1>
          <p className="text-sm text-gray-500 mt-1">A combined view of connected Instagram, YouTube and LinkedIn accounts.</p>
        </div>
        <Button variant="secondary" size="md" icon={<RefreshCw className="w-4 h-4" />} onClick={() => { load(); onRefresh(); }}>Refresh</Button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Followers" value={formatNumber(totalFollowers)} subtitle="Across connected platforms" icon={<Users className="w-5 h-5" />} />
        <MetricCard title="Total Reach" value={formatNumber(totalReach)} subtitle="Available reach metrics" icon={<Eye className="w-5 h-5" />} />
        <MetricCard title="Total Views" value={formatNumber(totalViews)} subtitle="Available content views" icon={<Video className="w-5 h-5" />} />
        <MetricCard title="Total Content" value={formatNumber(totalContent)} subtitle="Profiles/videos/media" icon={<BarChart3 className="w-5 h-5" />} />
      </div>

      {summaries.length === 0 ? (
        <Card className="p-8"><EmptyState message="No connected platform analytics are available." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {summaries.map((item, index) => {
            const icon = item.platform === 'instagram' ? <Instagram className="w-6 h-6 text-pink-600" /> : item.platform === 'youtube' ? <Youtube className="w-6 h-6 text-red-600" /> : <Linkedin className="w-6 h-6 text-blue-600" />;
            const label = item.platform === 'instagram' ? 'Instagram' : item.platform === 'youtube' ? 'YouTube' : 'LinkedIn';
            return (
              <Card key={`${item.platform}-${index}`} className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{item.accountName}</h3>
                  </div>
                </div>
                {item.error ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">{item.error}</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500">Followers</p><p className="text-lg font-bold mt-1">{formatNumber(item.followers)}</p></div>
                    <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500">Reach</p><p className="text-lg font-bold mt-1">{formatNumber(item.reach)}</p></div>
                    <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500">Views</p><p className="text-lg font-bold mt-1">{formatNumber(item.views)}</p></div>
                    <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-500">Content</p><p className="text-lg font-bold mt-1">{formatNumber(item.content)}</p></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-pink-600 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-gray-900">Cross-platform analytics</h3>
            <p className="text-sm text-gray-500 mt-2 leading-6">Only metrics actually returned by each platform backend are displayed. Metrics unavailable from a platform are shown as zero rather than being invented.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   MAIN ANALYTICS PAGE
============================================================ */

export function AnalyticsPage() {
  const [accounts, setAccounts] =
    useState<SocialAccount[]>([]);

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<number | null>(null);

  const [
    platform,
    setPlatform,
  ] = useState<
    'instagram' | 'youtube' | 'linkedin' | 'all'
  >('instagram');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  /* ==========================================================
     INSTAGRAM STATE
  ========================================================== */

  const [
    instagramOverview,
    setInstagramOverview,
  ] =
    useState<InstagramOverview | null>(
      null
    );

  const [
    instagramAudience,
    setInstagramAudience,
  ] =
    useState<InstagramAudience | null>(
      null
    );

  const [
    instagramInsights,
    setInstagramInsights,
  ] =
    useState<InstagramInsights | null>(
      null
    );

  const [
    instagramTrends,
    setInstagramTrends,
  ] =
    useState<InstagramTrends | null>(
      null
    );

  const [
    instagramMedia,
    setInstagramMedia,
  ] =
    useState<InstagramMedia[]>([]);

  const [
    selectedMedia,
    setSelectedMedia,
  ] =
    useState<InstagramMedia | null>(
      null
    );

  const [
    selectedMediaAnalytics,
    setSelectedMediaAnalytics,
  ] =
    useState<InstagramMedia | null>(
      null
    );

  const [
    mediaLoading,
    setMediaLoading,
  ] = useState(false);

  const [
    instagramActiveTab,
    setInstagramActiveTab,
  ] = useState<
    'Overview' | 'Content' | 'Audience' | 'Trends'
  >('Overview');

  const [
    instagramTrendMetric,
    setInstagramTrendMetric,
  ] = useState<
    'reach' | 'profile_views' | 'views'
  >('reach');

  /* ==========================================================
     LOAD SOCIAL ACCOUNTS
  ========================================================== */

  const loadAccounts =
    async (): Promise<
      SocialAccount[]
    > => {
      const token =
        localStorage.getItem(
          'auth_token'
        );

      const response =
        await fetch(
          `${API_BASE_URL}/social-accounts/`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                  Accept:
                    'application/json',
                }
              : {
                  Accept:
                    'application/json',
                },
          }
        );

      if (!response.ok) {
        throw new Error(
          `Could not load social accounts (${response.status})`
        );
      }

      const body =
        await response.json();

      const data = Array.isArray(body)
        ? body
        : body?.items ||
          body?.accounts ||
          [];

      return data;
    };

  /* ==========================================================
     GENERIC ANALYTICS FETCH
  ========================================================== */

  const fetchAnalyticsEndpoint =
    async (
      endpoint: string
    ): Promise<any> => {
      const token =
        localStorage.getItem(
          'auth_token'
        );

      const response =
        await fetch(
          `${API_BASE_URL}${endpoint}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                  Accept:
                    'application/json',
                }
              : {
                  Accept:
                    'application/json',
                },
          }
        );

      if (!response.ok) {
        let message =
          `Analytics request failed (${response.status})`;

        try {
          const body =
            await response.json();

          if (body?.detail) {
            message =
              typeof body.detail ===
              'string'
                ? body.detail
                : JSON.stringify(
                    body.detail
                  );
          }
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      return response.json();
    };

  /* ==========================================================
     INSTAGRAM FETCH
  ========================================================== */

  const loadInstagramAnalytics =
    async (
      accountId: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const [
          overviewResponse,
          audienceResponse,
          insightsResponse,
          trendsResponse,
        ] = await Promise.all([
          fetchAnalyticsEndpoint(
            `/audience/instagram/${accountId}/overview`
          ),
          fetchAnalyticsEndpoint(
            `/audience/instagram/${accountId}/audience`
          ),
          fetchAnalyticsEndpoint(
            `/audience/instagram/${accountId}/insights`
          ),
          fetchAnalyticsEndpoint(
            `/audience/instagram/${accountId}/trends`
          ),
        ]);

        setInstagramOverview(
          overviewResponse
        );

        setInstagramAudience(
          audienceResponse
        );

        setInstagramInsights(
          insightsResponse
        );

        setInstagramTrends(
          trendsResponse
        );

        // Load media independently so the main Instagram dashboard is not
        // blocked by the heavier media endpoint.
        setInstagramMedia([]);
        fetchAnalyticsEndpoint(
          `/audience/instagram/${accountId}/media`
        )
          .then((mediaResponse) => {
            setInstagramMedia(
              Array.isArray(mediaResponse?.data)
                ? mediaResponse.data
                : []
            );
          })
          .catch((mediaError) => {
            console.error('Instagram media load error:', mediaError);
            setInstagramMedia([]);
          });
      } catch (err: any) {
        console.error(
          'Instagram analytics error:',
          err
        );

        setError(
          err?.message ||
            'Could not load Instagram analytics.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  const initialize =
    async () => {
      setLoading(true);
      setError(null);

      try {
        const accountData =
          await loadAccounts();

        setAccounts(
          accountData
        );

        const instagramAccounts =
          accountData.filter(
            (account) =>
              String(
                account.platform || ''
              ).toLowerCase() ===
                'instagram' &&
              account.is_connected !==
                false
          );

        const youtubeAccounts =
          accountData.filter(
            (account) =>
              String(
                account.platform || ''
              ).toLowerCase() ===
                'youtube' &&
              account.is_connected !==
                false
          );

        const linkedinAccounts =
          accountData.filter(
            (account) =>
              String(
                account.platform || ''
              ).toLowerCase() ===
                'linkedin' &&
              account.is_connected !==
                false
          );

        /*
         * Keep Instagram as the default if it exists.
         * Otherwise open YouTube, then LinkedIn.
         */
        if (
          instagramAccounts.length >
          0
        ) {
          setPlatform(
            'instagram'
          );

          const first =
            instagramAccounts[0];

          setSelectedAccountId(
            first.id
          );

          await loadInstagramAnalytics(
            first.id
          );

          return;
        }

        if (
          youtubeAccounts.length >
          0
        ) {
          setPlatform(
            'youtube'
          );

          const first =
            youtubeAccounts[0];

          setSelectedAccountId(
            first.id
          );

          /*
           * YouTubeAnalyticsView itself loads
           * its analytics when the account ID
           * changes.
           */
          setLoading(false);

          return;
        }

        if (
          linkedinAccounts.length >
          0
        ) {
          setPlatform(
            'linkedin'
          );

          const first =
            linkedinAccounts[0];

          setSelectedAccountId(
            first.id
          );

          /*
           * LinkedInAnalyticsView loads its
           * analytics when the account ID changes.
           */
          setLoading(false);

          return;
        }

        setSelectedAccountId(
          null
        );

        setError(
          'No connected Instagram, YouTube, or LinkedIn account was found.'
        );

        setLoading(false);
      } catch (err: any) {
        console.error(
          'Analytics initialization error:',
          err
        );

        setError(
          err?.message ||
            'Could not initialize analytics.'
        );

        setLoading(false);
      }
    };

  useEffect(() => {
    initialize();
  }, []);

  /* ==========================================================
     ACCOUNT FILTERS
  ========================================================== */

  const instagramAccounts =
    useMemo(
      () =>
        accounts.filter(
          (account) =>
            String(
              account.platform || ''
            ).toLowerCase() ===
              'instagram' &&
            account.is_connected !==
              false
        ),
      [accounts]
    );

  const youtubeAccounts =
    useMemo(
      () =>
        accounts.filter(
          (account) =>
            String(
              account.platform || ''
            ).toLowerCase() ===
              'youtube' &&
            account.is_connected !==
              false
        ),
      [accounts]
    );

  const linkedinAccounts =
    useMemo(
      () =>
        accounts.filter(
          (account) =>
            String(
              account.platform || ''
            ).toLowerCase() ===
              'linkedin' &&
            account.is_connected !==
              false
        ),
      [accounts]
    );

  const currentPlatformAccounts =
    platform === 'all'
      ? accounts.filter((account) => account.is_connected !== false)
      : platform === 'youtube'
      ? youtubeAccounts
      : platform === 'linkedin'
      ? linkedinAccounts
      : instagramAccounts;

  /* ==========================================================
     PLATFORM CHANGE
  ========================================================== */

  const handlePlatformChange =
    async (
      nextPlatform:
        | 'instagram'
        | 'youtube'
        | 'linkedin'
        | 'all'
    ) => {
      setPlatform(
        nextPlatform
      );

      setError(null);
      setSelectedMedia(null);
      setSelectedMediaAnalytics(
        null
      );

      const nextAccounts =
        nextPlatform === 'all'
          ? accounts.filter((account) => account.is_connected !== false)
          : nextPlatform === 'youtube'
          ? youtubeAccounts
          : nextPlatform === 'linkedin'
          ? linkedinAccounts
          : instagramAccounts;

      if (
        nextAccounts.length === 0 &&
        nextPlatform !== 'all'
      ) {
        setSelectedAccountId(
          null
        );

        setError(
          `No connected ${
            nextPlatform ===
            'youtube'
              ? 'YouTube'
              : nextPlatform ===
                'linkedin'
              ? 'LinkedIn'
              : 'Instagram'
          } account was found.`
        );

        return;
      }

      const firstAccount =
        nextAccounts[0];

      setSelectedAccountId(
        firstAccount.id
      );

      if (nextPlatform === 'all') {
        setLoading(false);
        return;
      }

      if (
        nextPlatform ===
        'instagram'
      ) {
        await loadInstagramAnalytics(
          firstAccount.id
        );
      } else {
        /*
         * YouTubeAnalyticsView loads its
         * own data.
         */
        setLoading(false);
      }
    };

  /* ==========================================================
     ACCOUNT CHANGE
  ========================================================== */

  const handleAccountChange =
    async (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const id =
        Number(
          event.target.value
        );

      if (!Number.isFinite(id)) {
        return;
      }

      setSelectedAccountId(
        id
      );

      if (platform === 'all') {
        setRefreshing(false);
        return;
      }

      if (
        platform ===
        'instagram'
      ) {
        await loadInstagramAnalytics(
          id
        );
      }
    };

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    async () => {
      if (
        selectedAccountId ===
        null
      ) {
        await initialize();
        return;
      }

      setRefreshing(true);

      if (platform === 'all') {
        setRefreshing(false);
        return;
      }

      if (
        platform ===
        'instagram'
      ) {
        await loadInstagramAnalytics(
          selectedAccountId
        );

        return;
      }

      /*
       * YouTubeAnalyticsView handles
       * its own refresh.
       */
      setRefreshing(false);
    };

  /* ==========================================================
     INSTAGRAM MEDIA ANALYTICS
  ========================================================== */

  const loadInstagramMediaAnalytics =
    async (
      mediaItem: InstagramMedia
    ) => {
      if (
        !selectedAccountId ||
        !mediaItem.id
      ) {
        return;
      }

      setSelectedMedia(
        mediaItem
      );

      setMediaLoading(true);

      try {
        const response =
          (await fetchAnalyticsEndpoint(
            `/audience/instagram/${selectedAccountId}/media/${mediaItem.id}`
          )) as InstagramMediaAnalyticsResponse;

        setSelectedMediaAnalytics(
          response?.data ||
            mediaItem
        );
      } catch (err) {
        console.error(
          'Instagram media analytics error:',
          err
        );

        setSelectedMediaAnalytics(
          mediaItem
        );
      } finally {
        setMediaLoading(false);
      }
    };

  /* ==========================================================
     INSTAGRAM METRICS
  ========================================================== */

  const instagramReach =
    getMetricFromInsights(
      instagramInsights,
      'reach'
    );

  const instagramProfileViews =
    getMetricFromInsights(
      instagramInsights,
      'profile_views'
    );

  const instagramWebsiteClicks =
    getMetricFromInsights(
      instagramInsights,
      'website_clicks'
    );

  const instagramAccountsEngaged =
    getMetricFromInsights(
      instagramInsights,
      'accounts_engaged'
    );

  const instagramTotalInteractions =
    getMetricFromInsights(
      instagramInsights,
      'total_interactions'
    );

  const instagramViews =
    getMetricFromInsights(
      instagramInsights,
      'views'
    );

  const instagramTrendData =
    Array.isArray(
      instagramTrends?.data
    )
      ? instagramTrends.data
      : [];

  const instagramMaxTrendValue =
    Math.max(
      ...instagramTrendData.map(
        (item) =>
          Number(
            item[
              instagramTrendMetric
            ] || 0
          )
      ),
      1
    );

  const selectedInstagramAccount =
    instagramAccounts.find(
      (account) =>
        account.id ===
        selectedAccountId
    );

  const instagramAccountUsername =
    instagramOverview?.username ||
    instagramAudience?.data?.username ||
    selectedInstagramAccount?.account_name ||
    'Instagram Account';

  /* ==========================================================
     INSTAGRAM UI
  ========================================================== */

  const renderInstagram =
    () => {
      if (
        loading &&
        !instagramOverview
      ) {
        return (
          <LoadingState platform="instagram" />
        );
      }

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Instagram className="w-5 h-5 text-pink-600" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-pink-600">
                    Instagram Analytics
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-950">
                  Instagram Performance
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Real-time Instagram account,
                  insights, trends and content
                  analytics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {instagramAccounts.length >
                  0 && (
                  <select
                    value={
                      selectedAccountId ??
                      ''
                    }
                    onChange={
                      handleAccountChange
                    }
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 shadow-sm cursor-pointer"
                  >
                    {instagramAccounts.map(
                      (
                        account
                      ) => (
                        <option
                          key={
                            account.id
                          }
                          value={
                            account.id
                          }
                        >
                          {account.account_name ||
                            `Instagram Account ${account.id}`}
                        </option>
                      )
                    )}
                  </select>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  icon={
                    <RefreshCw
                      className={cn(
                        'w-4 h-4',
                        refreshing &&
                          'animate-spin'
                      )}
                    />
                  }
                  onClick={
                    handleRefresh
                  }
                >
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
              {[
                'Overview',
                'Content',
                'Audience',
                'Trends',
              ].map(
                (
                  tab
                ) => (
                  <button
                    key={
                      tab
                    }
                    onClick={() =>
                      setInstagramActiveTab(
                        tab as
                          | 'Overview'
                          | 'Content'
                          | 'Audience'
                          | 'Trends'
                      )
                    }
                    className={cn(
                      'px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer',
                      instagramActiveTab ===
                        tab
                        ? 'border-pink-600 text-pink-600 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {
                      tab
                    }
                  </button>
                )
              )}
            </div>
          </div>

          {/* Account summary */}
          {instagramOverview && (
            <Card className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center">
                    <Instagram className="w-7 h-7 text-pink-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-950">
                        @
                        {
                          instagramAccountUsername
                        }
                      </h2>

                      <Badge
                        variant="success"
                        className="!py-0.5"
                      >
                        Connected
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      Instagram Account ID:{' '}
                      {instagramOverview.account_id ||
                        selectedInstagramAccount?.account_id ||
                        '—'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">
                      Followers
                    </p>

                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(
                        instagramOverview.followers
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Following
                    </p>

                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(
                        instagramOverview.following
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Media
                    </p>

                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(
                        instagramOverview.media_count
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {instagramActiveTab ===
            'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Reach"
                  value={formatNumber(
                    instagramReach
                  )}
                  subtitle="30-day reach"
                  icon={
                    <Eye className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Profile Views"
                  value={formatNumber(
                    instagramProfileViews
                  )}
                  subtitle="Profile visits"
                  icon={
                    <Users className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Website Clicks"
                  value={formatNumber(
                    instagramWebsiteClicks
                  )}
                  subtitle="Website link taps"
                  icon={
                    <MousePointerClick className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Accounts Engaged"
                  value={formatNumber(
                    instagramAccountsEngaged
                  )}
                  subtitle="Accounts interacting"
                  icon={
                    <Activity className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Interactions"
                  value={formatNumber(
                    instagramTotalInteractions
                  )}
                  subtitle="Content interactions"
                  icon={
                    <Heart className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Views"
                  value={formatNumber(
                    instagramViews
                  )}
                  subtitle="Content views"
                  icon={
                    <Video className="w-5 h-5" />
                  }
                />
              </div>

              {instagramInsights?.period && (
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-pink-600" />

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Analytics period
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(
                          instagramInsights.period.start
                        )}{' '}
                        —{' '}
                        {formatDate(
                          instagramInsights.period.until
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <BarChart3 className="w-5 h-5 text-pink-600" />

                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Instagram Insights
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Metrics returned directly by
                      Instagram.
                    </p>
                  </div>
                </div>

                {instagramInsights?.data &&
                instagramInsights.data.length >
                  0 ? (
                  <div className="space-y-4">
                    {instagramInsights.data.map(
                      (
                        item
                      ) => {
                        const value =
                          getMetricFromInsights(
                            instagramInsights,
                            String(
                              item.name ||
                                ''
                            )
                          );

                        return (
                          <div
                            key={
                              item.name
                            }
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {item.title ||
                                  item.name}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {item.description ||
                                  'Instagram insight metric'}
                              </p>
                            </div>

                            <p className="text-lg font-bold text-gray-950">
                              {formatNumber(
                                value
                              )}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <EmptyState message="No Instagram insight data available." />
                )}
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Recent Instagram Content
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Latest media returned by
                      Instagram.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setInstagramActiveTab(
                        'Content'
                      )
                    }
                    className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {instagramMedia.length ===
                0 ? (
                  <EmptyState message="No Instagram media available." />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {instagramMedia
                      .slice(0, 4)
                      .map(
                        (
                          item
                        ) => {
                          const image =
                            getInstagramMediaImage(
                              item
                            );

                          return (
                            <button
                              key={
                                item.id
                              }
                              onClick={() =>
                                loadInstagramMediaAnalytics(
                                  item
                                )
                              }
                              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group cursor-pointer"
                            >
                              {image ? (
                                <img
                                  src={
                                    image
                                  }
                                  alt={
                                    item.caption ||
                                    'Instagram media'
                                  }
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              )}

                              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-left">
                                <p className="text-xs text-white font-medium truncate">
                                  {item.caption ||
                                    'Instagram content'}
                                </p>
                              </div>
                            </button>
                          );
                        }
                      )}
                  </div>
                )}
              </Card>
            </div>
          )}

          {instagramActiveTab ===
            'Content' && (
            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <ImageIcon className="w-5 h-5 text-pink-600" />

                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Instagram Media
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Click any post or reel to view
                      analytics.
                    </p>
                  </div>
                </div>

                {instagramMedia.length ===
                0 ? (
                  <EmptyState message="No Instagram media found." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {instagramMedia.map(
                      (
                        item,
                        index
                      ) => {
                        const image =
                          getInstagramMediaImage(
                            item
                          );

                        return (
                          <div
                            key={
                              item.id ||
                              index
                            }
                            className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            <button
                              onClick={() =>
                                loadInstagramMediaAnalytics(
                                  item
                                )
                              }
                              className="w-full aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                            >
                              {image ? (
                                <img
                                  src={
                                    image
                                  }
                                  alt={
                                    item.caption ||
                                    'Instagram media'
                                  }
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-10 h-10 text-gray-400" />
                                </div>
                              )}
                            </button>

                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Instagram className="w-4 h-4 text-pink-600" />

                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  {item.media_product_type ||
                                    item.media_type ||
                                    'MEDIA'}
                                </span>

                                <span className="ml-auto text-xs text-gray-400">
                                  {formatDate(
                                    item.timestamp
                                  )}
                                </span>
                              </div>

                              <p className="text-sm text-gray-900 line-clamp-2 min-h-[40px]">
                                {item.caption ||
                                  'No caption'}
                              </p>

                              <div className="grid grid-cols-4 gap-2 mt-4">
                                <div className="text-center">
                                  <Heart className="w-4 h-4 mx-auto text-pink-500" />

                                  <p className="text-xs font-semibold text-gray-900 mt-1">
                                    {formatNumber(
                                      item.likes
                                    )}
                                  </p>
                                </div>

                                <div className="text-center">
                                  <MessageCircle className="w-4 h-4 mx-auto text-blue-500" />

                                  <p className="text-xs font-semibold text-gray-900 mt-1">
                                    {formatNumber(
                                      item.comments
                                    )}
                                  </p>
                                </div>

                                <div className="text-center">
                                  <TrendingUp className="w-4 h-4 mx-auto text-emerald-500" />

                                  <p className="text-xs font-semibold text-gray-900 mt-1">
                                    {formatNumber(
                                      item.engagement
                                    )}
                                  </p>
                                </div>

                                <div className="text-center">
                                  <Eye className="w-4 h-4 mx-auto text-violet-500" />

                                  <p className="text-xs font-semibold text-gray-900 mt-1">
                                    {formatNumber(
                                      item.reach
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-4">
                                <button
                                  onClick={() =>
                                    loadInstagramMediaAnalytics(
                                      item
                                    )
                                  }
                                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer"
                                >
                                  View Analytics
                                </button>

                                {item.permalink && (
                                  <a
                                    href={
                                      item.permalink
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600"
                                    onClick={(
                                      event
                                    ) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}

          {instagramActiveTab ===
            'Audience' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Followers"
                  value={formatNumber(
                    instagramOverview?.followers
                  )}
                  subtitle="Current followers"
                  icon={
                    <Users className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Following"
                  value={formatNumber(
                    instagramOverview?.following
                  )}
                  subtitle="Current following"
                  icon={
                    <Users className="w-5 h-5" />
                  }
                />

                <MetricCard
                  title="Media Count"
                  value={formatNumber(
                    instagramOverview?.media_count
                  )}
                  subtitle="Published media"
                  icon={
                    <ImageIcon className="w-5 h-5" />
                  }
                />
              </div>

              <Card className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <Users className="w-5 h-5 text-pink-600" />

                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Audience Statistics
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Account-level Instagram audience
                      statistics.
                    </p>
                  </div>
                </div>

                {instagramAudience?.data ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500">
                        Username
                      </p>

                      <p className="mt-2 text-lg font-bold text-gray-900">
                        @
                        {instagramAudience.data.username ||
                          instagramAccountUsername}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500">
                        Followers
                      </p>

                      <p className="mt-2 text-lg font-bold text-gray-900">
                        {formatNumber(
                          instagramAudience.data.followers
                        )}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500">
                        Media Count
                      </p>

                      <p className="mt-2 text-lg font-bold text-gray-900">
                        {formatNumber(
                          instagramAudience.data.media_count
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyState message="No audience data available." />
                )}
              </Card>
            </div>
          )}

          {instagramActiveTab ===
            'Trends' && (
            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Instagram 30-Day Trends
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Daily metrics from Instagram.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    {[
                      {
                        key: 'reach',
                        label: 'Reach',
                      },
                      {
                        key: 'profile_views',
                        label: 'Profile Views',
                      },
                      {
                        key: 'views',
                        label: 'Views',
                      },
                    ].map(
                      (
                        metric
                      ) => (
                        <button
                          key={
                            metric.key
                          }
                          onClick={() =>
                            setInstagramTrendMetric(
                              metric.key as
                                | 'reach'
                                | 'profile_views'
                                | 'views'
                            )
                          }
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all',
                            instagramTrendMetric ===
                              metric.key
                              ? 'bg-white text-pink-600 shadow-sm font-semibold'
                              : 'text-gray-500 hover:text-gray-900'
                          )}
                        >
                          {
                            metric.label
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>

                {instagramTrendData.length ===
                0 ? (
                  <EmptyState message="No Instagram trend data available." />
                ) : (
                  <div className="space-y-3">
                    {instagramTrendData.map(
                      (
                        item,
                        index
                      ) => {
                        const value =
                          Number(
                            item[
                              instagramTrendMetric
                            ] || 0
                          );

                        const width =
                          Math.max(
                            2,
                            (value /
                              instagramMaxTrendValue) *
                              100
                          );

                        return (
                          <div
                            key={
                              item.date ||
                              index
                            }
                            className="grid grid-cols-[70px_1fr_50px] items-center gap-3"
                          >
                            <span className="text-xs text-gray-500">
                              {formatDateShort(
                                item.date
                              )}
                            </span>

                            <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                              <div
                                className="h-full rounded-lg bg-pink-500 transition-all"
                                style={{
                                  width: `${width}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs font-semibold text-gray-900 text-right">
                              {formatNumber(
                                value
                              )}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      );
    };

  /* ==========================================================
     PLATFORM SELECTOR + MAIN RETURN
  ========================================================== */

  if (
    loading &&
    accounts.length === 0
  ) {
    return (
      <LoadingState
        platform={platform}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform selector */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() =>
              handlePlatformChange(
                'instagram'
              )
            }
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              platform ===
                'instagram'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            <Instagram className="w-4 h-4" />

            Instagram
          </button>

          <button
            onClick={() =>
              handlePlatformChange(
                'youtube'
              )
            }
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              platform ===
                'youtube'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            <Youtube className="w-4 h-4" />

            YouTube
          </button>
          <button
            onClick={() =>
              handlePlatformChange(
                'linkedin'
              )
            }
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              platform ===
                'linkedin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            <Linkedin className="w-4 h-4" />

            LinkedIn
          </button>
          <button
            onClick={() => handlePlatformChange('all')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              platform === 'all'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            <Globe2 className="w-4 h-4" />
            All Platforms
          </button>
        </div>
      </Card>

      {/* Global error */}
      {error &&
        (
          (platform ===
            'youtube' &&
            youtubeAccounts.length ===
              0) ||
          (platform ===
            'linkedin' &&
            linkedinAccounts.length ===
              0)
        ) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

      {/* All Platforms */}
      {platform === 'all' && (
        <AllPlatformsAnalyticsView
          accounts={accounts}
          onRefresh={() => setRefreshing(false)}
        />
      )}

      {/* YouTube */}
      {platform ===
        'youtube' &&
        youtubeAccounts.length >
          0 && (
          <YouTubeAnalyticsView
            accounts={
              youtubeAccounts
            }
            selectedAccountId={
              selectedAccountId
            }
            onAccountChange={
              handleAccountChange
            }
            onRefresh={
              () => {
                setRefreshing(
                  false
                );
              }
            }
            refreshing={
              refreshing
            }
          />
        )}

      {/* YouTube empty state */}
      {platform ===
        'youtube' &&
        youtubeAccounts.length ===
          0 && (
          <Card className="p-8">
            <EmptyState
              message="No connected YouTube account was found. Connect a YouTube account first to view analytics."
              icon={
                <Youtube className="w-7 h-7 text-gray-400" />
              }
            />
          </Card>
        )}

      {/* LinkedIn */}
      {platform ===
        'linkedin' &&
        linkedinAccounts.length >
          0 && (
          <LinkedInAnalyticsView
            accounts={
              linkedinAccounts
            }
            selectedAccountId={
              selectedAccountId
            }
            onAccountChange={
              handleAccountChange
            }
            onRefresh={() => {
              setRefreshing(
                false
              );
            }}
            refreshing={
              refreshing
            }
          />
        )}

      {/* LinkedIn empty state */}
      {platform ===
        'linkedin' &&
        linkedinAccounts.length ===
          0 && (
          <Card className="p-8">
            <EmptyState
              message="No connected LinkedIn account was found. Connect a LinkedIn account first to view analytics."
              icon={
                <Linkedin className="w-7 h-7 text-gray-400" />
              }
            />
          </Card>
        )}

      {/* Instagram */}
      {platform ===
        'instagram' &&
        instagramAccounts.length >
          0 &&
        renderInstagram()}

      {/* Instagram empty state */}
      {platform ===
        'instagram' &&
        instagramAccounts.length ===
          0 && (
          <Card className="p-8">
            <EmptyState
              message="No connected Instagram account was found. Connect an Instagram account first to view analytics."
              icon={
                <Instagram className="w-7 h-7 text-gray-400" />
              }
            />
          </Card>
        )}

      {/* Instagram media analytics modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Media Analytics
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Instagram media ID:{' '}
                  {selectedMedia.id}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedMedia(
                    null
                  );

                  setSelectedMediaAnalytics(
                    null
                  );
                }}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5">
              {mediaLoading ? (
                <div className="py-16 flex justify-center">
                  <RefreshCw className="w-7 h-7 text-pink-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  {getInstagramMediaImage(
                    selectedMediaAnalytics ||
                      selectedMedia
                  ) && (
                    <div className="rounded-xl overflow-hidden bg-gray-100 max-h-[420px]">
                      <img
                        src={getInstagramMediaImage(
                          selectedMediaAnalytics ||
                            selectedMedia
                        )!}
                        alt="Instagram media"
                        className="w-full max-h-[420px] object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-900">
                      {(
                        selectedMediaAnalytics ||
                        selectedMedia
                      ).caption ||
                        'No caption'}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      Published:{' '}
                      {formatDate(
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).timestamp
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <MetricCard
                      title="Likes"
                      value={formatNumber(
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).likes
                      )}
                      icon={
                        <Heart className="w-5 h-5" />
                      }
                    />

                    <MetricCard
                      title="Comments"
                      value={formatNumber(
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).comments
                      )}
                      icon={
                        <MessageCircle className="w-5 h-5" />
                      }
                    />

                    <MetricCard
                      title="Engagement"
                      value={formatNumber(
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).engagement
                      )}
                      icon={
                        <TrendingUp className="w-5 h-5" />
                      }
                    />

                    <MetricCard
                      title="Reach"
                      value={formatNumber(
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).reach
                      )}
                      icon={
                        <Eye className="w-5 h-5" />
                      }
                    />

                    <MetricCard
                      title="Impressions"
                      value={formatNumber(
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).impressions
                      )}
                      icon={
                        <BarChart3 className="w-5 h-5" />
                      }
                    />

                    <MetricCard
                      title="Media Type"
                      value={
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).media_product_type ||
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).media_type ||
                        '—'
                      }
                      icon={
                        <Video className="w-5 h-5" />
                      }
                    />
                  </div>

                  {(
                    selectedMediaAnalytics ||
                    selectedMedia
                  ).permalink && (
                    <a
                      href={
                        (
                          selectedMediaAnalytics ||
                          selectedMedia
                        ).permalink!
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold"
                    >
                      Open on Instagram

                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;