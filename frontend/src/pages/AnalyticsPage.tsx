import { useState } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Download,
} from 'lucide-react';

const platforms = [
  {
    platform: 'Facebook',
    reach: 145000,
    impressions: 312000,
    clicks: 8600,
    engagement: 6.8,
    followers: 42500,
  },
  {
    platform: 'Instagram',
    reach: 198000,
    impressions: 445000,
    clicks: 18600,
    engagement: 9.2,
    followers: 83600,
  },
  {
    platform: 'Twitter',
    reach: 78000,
    impressions: 156000,
    clicks: 6200,
    engagement: 4.1,
    followers: 24800,
  },
  {
    platform: 'LinkedIn',
    reach: 52000,
    impressions: 98000,
    clicks: 4800,
    engagement: 11.4,
    followers: 18200,
  },
];

const campaignFactors: Record<string, number> = {
  'Product Launch Q3': 1,
  'Brand Awareness': 0.82,
  'Summer Sale': 0.64,
  'Content Marketing': 0.48,
};

const contentFactors: Record<string, number> = {
  Image: 1,
  Video: 0.88,
  Carousel: 0.72,
  Text: 0.56,
};

const rangeFactors: Record<string, number> = {
  '7 days': 0.25,
  '30 days': 1,
  '90 days': 2.6,
  '6 months': 5.2,
  '1 year': 10.5,
};

function formatNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return Math.round(value).toLocaleString();
}

export function AnalyticsPage() {
  const [range, setRange] = useState('30 days');
  const [platform, setPlatform] = useState('all');
  const [campaign, setCampaign] = useState('all');
  const [contentType, setContentType] = useState('all');

  const selectedPlatforms =
    platform === 'all'
      ? platforms
      : platforms.filter(
          (item) => item.platform.toLowerCase() === platform
        );

  const campaignFactor =
    campaign === 'all'
      ? 1
      : campaignFactors[campaign] ?? 1;

  const contentFactor =
    contentType === 'all'
      ? 1
      : contentFactors[contentType] ?? 1;

  const rangeFactor = rangeFactors[range] ?? 1;

  const combinedFactor =
    campaignFactor * contentFactor * rangeFactor;

  const totalReach = selectedPlatforms.reduce(
    (sum, item) => sum + item.reach,
    0
  ) * combinedFactor;

  const totalImpressions = selectedPlatforms.reduce(
    (sum, item) => sum + item.impressions,
    0
  ) * combinedFactor;

  const totalClicks = selectedPlatforms.reduce(
    (sum, item) => sum + item.clicks,
    0
  ) * combinedFactor;

  const totalFollowers = selectedPlatforms.reduce(
    (sum, item) => sum + item.followers,
    0
  );

  const averageEngagement =
    selectedPlatforms.length > 0
      ? selectedPlatforms.reduce(
          (sum, item) => sum + item.engagement,
          0
        ) / selectedPlatforms.length
      : 0;

  const displayReach = totalReach;
  const displayImpressions = totalImpressions;
  const displayClicks = totalClicks;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Deep insights into your social media performance
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2">

          {/* PLATFORM */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          {/* CAMPAIGN */}
          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
          >
            <option value="all">All Campaigns</option>
            <option value="Product Launch Q3">
              Product Launch Q3
            </option>
            <option value="Brand Awareness">
              Brand Awareness
            </option>
            <option value="Summer Sale">
              Summer Sale
            </option>
            <option value="Content Marketing">
              Content Marketing
            </option>
          </select>

          {/* CONTENT TYPE */}
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
          >
            <option value="all">All Content Types</option>
            <option value="Image">Image</option>
            <option value="Video">Video</option>
            <option value="Carousel">Carousel</option>
            <option value="Text">Text</option>
          </select>

          {/* EXPORT */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

        </div>
      </div>

      {/* DATE RANGE */}
      <div className="flex flex-wrap gap-2">

        {[
          '7 days',
          '30 days',
          '90 days',
          '6 months',
          '1 year',
        ].map((item) => (

          <button
            type="button"
            key={item}
            onClick={() => setRange(item)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              range === item
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>

        ))}

      </div>

      {/* ACTIVE FILTER */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">

        <p className="text-sm text-indigo-700">

          Showing data for{' '}

          <strong>
            {platform === 'all'
              ? 'All Platforms'
              : platform.charAt(0).toUpperCase() +
                platform.slice(1)}
          </strong>

          {' • '}

          <strong>
            {campaign === 'all'
              ? 'All Campaigns'
              : campaign}
          </strong>

          {' • '}

          <strong>
            {contentType === 'all'
              ? 'All Content Types'
              : contentType}
          </strong>

          {' • '}

          <strong>{range}</strong>

        </p>

      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* REACH */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Total Reach
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(displayReach)}
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +18% growth
              </p>

            </div>

            <Users className="w-5 h-5 text-emerald-600" />

          </div>

        </div>

        {/* IMPRESSIONS */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Total Impressions
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(displayImpressions)}
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +22% growth
              </p>

            </div>

            <Eye className="w-5 h-5 text-violet-600" />

          </div>

        </div>

        {/* CLICKS */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Total Clicks
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(displayClicks)}
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +13% growth
              </p>

            </div>

            <Share2 className="w-5 h-5 text-indigo-600" />

          </div>

        </div>

        {/* ENGAGEMENT */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Engagement Rate
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                {averageEngagement.toFixed(1)}%
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +5% growth
              </p>

            </div>

            <TrendingUp className="w-5 h-5 text-rose-500" />

          </div>

        </div>

      </div>

      {/* FOLLOWER GROWTH */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h3 className="text-base font-semibold text-gray-900">
              Follower Growth
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Followers across selected platforms
            </p>

          </div>

          <span className="text-sm font-semibold text-indigo-600">
            {formatNumber(totalFollowers)}
          </span>

        </div>

        <div className="space-y-4">

          {selectedPlatforms.map((item) => {

            const maxFollowers = Math.max(
              ...selectedPlatforms.map(
                (x) => x.followers
              ),
              1
            );

            return (

              <div
                key={item.platform}
                className="flex items-center gap-3"
              >

                <span className="w-20 text-sm font-medium text-gray-700">
                  {item.platform}
                </span>

                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">

                  <div
                    className="h-full bg-indigo-500 rounded-lg transition-all duration-500"
                    style={{
                      width: `${
                        (item.followers /
                          maxFollowers) *
                        100
                      }%`,
                    }}
                  />

                </div>

                <span className="w-16 text-right text-sm font-semibold">
                  {formatNumber(item.followers)}
                </span>

              </div>

            );
          })}

        </div>

      </div>

      {/* PLATFORM PERFORMANCE */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <h3 className="text-base font-semibold text-gray-900">
          Platform Performance
        </h3>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Reach across selected platforms
        </p>

        <div className="space-y-5">

          {selectedPlatforms.map((item) => {

            const maxReach = Math.max(
              ...selectedPlatforms.map(
                (x) => x.reach
              ),
              1
            );

            const adjustedReach =
              item.reach *
              campaignFactor *
              contentFactor *
              rangeFactor;

            return (

              <div key={item.platform}>

                <div className="flex justify-between mb-2">

                  <span className="text-sm font-semibold text-gray-800">
                    {item.platform}
                  </span>

                  <span className="text-sm text-gray-500">
                    {formatNumber(adjustedReach)}
                  </span>

                </div>

                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">

                  <div
                    className="h-full bg-violet-500 rounded-lg transition-all duration-500"
                    style={{
                      width: `${
                        (item.reach /
                          maxReach) *
                        100
                      }%`,
                    }}
                  />

                </div>

              </div>

            );
          })}

        </div>

      </div>

      {/* PLATFORM BREAKDOWN */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Platform Breakdown
        </h3>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-200">

                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">
                  Platform
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500">
                  Reach
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500">
                  Impressions
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500">
                  Clicks
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500">
                  Engagement
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500">
                  Followers
                </th>

              </tr>

            </thead>

            <tbody>

              {selectedPlatforms.map((item) => (

                <tr
                  key={item.platform}
                  className="border-b border-gray-100"
                >

                  <td className="py-3 px-2 font-medium text-gray-900">
                    {item.platform}
                  </td>

                  <td className="text-right py-3 px-2">
                    {formatNumber(
                      item.reach *
                        campaignFactor *
                        contentFactor *
                        rangeFactor
                    )}
                  </td>

                  <td className="text-right py-3 px-2">
                    {formatNumber(
                      item.impressions *
                        campaignFactor *
                        contentFactor *
                        rangeFactor
                    )}
                  </td>

                  <td className="text-right py-3 px-2">
                    {formatNumber(
                      item.clicks *
                        campaignFactor *
                        contentFactor *
                        rangeFactor
                    )}
                  </td>

                  <td className="text-right py-3 px-2 text-emerald-600 font-semibold">
                    {item.engagement.toFixed(1)}%
                  </td>

                  <td className="text-right py-3 px-2">
                    {formatNumber(item.followers)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* AI INSIGHTS */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <h3 className="text-base font-semibold text-gray-900 mb-4">
          AI Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">

            <div className="flex items-center gap-2">

              <Heart className="w-5 h-5 text-green-600" />

              <h4 className="font-semibold text-green-700">
                Best Performing Platform
              </h4>

            </div>

            <p className="text-sm text-gray-700 mt-2">
              LinkedIn currently has the highest engagement
              rate at 11.4%.
            </p>

          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

            <h4 className="font-semibold text-blue-700">
              Best Posting Time
            </h4>

            <p className="text-sm text-gray-700 mt-2">
              Posts published between 6 PM and 8 PM receive
              higher engagement.
            </p>

          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

            <h4 className="font-semibold text-yellow-700">
              Growth Suggestion
            </h4>

            <p className="text-sm text-gray-700 mt-2">
              Increase LinkedIn posting frequency to improve
              professional audience reach.
            </p>

          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">

            <h4 className="font-semibold text-purple-700">
              Campaign Recommendation
            </h4>

            <p className="text-sm text-gray-700 mt-2">
              Continue monitoring campaign performance and
              focus on high-performing content.
            </p>

          </div>

        </div>

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <Share2 className="w-5 h-5 text-indigo-600" />

            <div>

              <p className="text-xs text-gray-500">
                Total Shares
              </p>

              <p className="text-xl font-bold">
                {formatNumber(
                  8200 *
                    campaignFactor *
                    contentFactor *
                    rangeFactor
                )}
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <MessageCircle className="w-5 h-5 text-blue-600" />

            <div>

              <p className="text-xs text-gray-500">
                Total Comments
              </p>

              <p className="text-xl font-bold">
                {formatNumber(
                  6200 *
                    campaignFactor *
                    contentFactor *
                    rangeFactor
                )}
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <Heart className="w-5 h-5 text-rose-500" />

            <div>

              <p className="text-xs text-gray-500">
                Total Likes
              </p>

              <p className="text-xl font-bold">
                {formatNumber(
                  28400 *
                    campaignFactor *
                    contentFactor *
                    rangeFactor
                )}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}