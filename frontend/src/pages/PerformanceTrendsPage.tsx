import { useState } from 'react';
import { Card } from '../components/ui';

type Period = 'Monthly' | 'Weekly' | 'Quarterly' | 'Yearly';

const monthlyData = [
  {
    label: 'Jan',
    engagement: 4200,
    reach: 52000,
    impressions: 89000,
    clicks: 3200,
    followers: 72000,
  },
  {
    label: 'Feb',
    engagement: 5100,
    reach: 68000,
    impressions: 110000,
    clicks: 4100,
    followers: 74500,
  },
  {
    label: 'Mar',
    engagement: 5900,
    reach: 82000,
    impressions: 145000,
    clicks: 5200,
    followers: 76800,
  },
  {
    label: 'Apr',
    engagement: 6700,
    reach: 96000,
    impressions: 178000,
    clicks: 6400,
    followers: 79200,
  },
  {
    label: 'May',
    engagement: 7200,
    reach: 118000,
    impressions: 215000,
    clicks: 7800,
    followers: 81500,
  },
  {
    label: 'Jun',
    engagement: 8100,
    reach: 136000,
    impressions: 258000,
    clicks: 9200,
    followers: 83600,
  },
];

const weeklyData = [
  {
    label: 'Week 1',
    engagement: 1200,
    reach: 21000,
    impressions: 38000,
    clicks: 900,
    followers: 81200,
  },
  {
    label: 'Week 2',
    engagement: 1450,
    reach: 26000,
    impressions: 45000,
    clicks: 1100,
    followers: 81900,
  },
  {
    label: 'Week 3',
    engagement: 1680,
    reach: 31000,
    impressions: 52000,
    clicks: 1350,
    followers: 82700,
  },
  {
    label: 'Week 4',
    engagement: 1900,
    reach: 36000,
    impressions: 61000,
    clicks: 1600,
    followers: 83600,
  },
];

const quarterlyData = [
  {
    label: 'Q1',
    engagement: 15200,
    reach: 202000,
    impressions: 344000,
    clicks: 12500,
    followers: 76800,
  },
  {
    label: 'Q2',
    engagement: 20100,
    reach: 315000,
    impressions: 548000,
    clicks: 18300,
    followers: 83600,
  },
  {
    label: 'Q3',
    engagement: 24500,
    reach: 398000,
    impressions: 682000,
    clicks: 22400,
    followers: 91200,
  },
  {
    label: 'Q4',
    engagement: 28600,
    reach: 465000,
    impressions: 795000,
    clicks: 26700,
    followers: 98400,
  },
];

const yearlyData = [
  {
    label: '2023',
    engagement: 42000,
    reach: 620000,
    impressions: 980000,
    clicks: 42000,
    followers: 52000,
  },
  {
    label: '2024',
    engagement: 58000,
    reach: 840000,
    impressions: 1240000,
    clicks: 58000,
    followers: 65000,
  },
  {
    label: '2025',
    engagement: 76000,
    reach: 1080000,
    impressions: 1680000,
    clicks: 72000,
    followers: 74800,
  },
  {
    label: '2026',
    engagement: 92400,
    reach: 1320000,
    impressions: 2140000,
    clicks: 86400,
    followers: 83600,
  },
];

export function PerformanceTrendsPage() {
  const [period, setPeriod] = useState<Period>('Monthly');

  const getData = () => {
    switch (period) {
      case 'Weekly':
        return weeklyData;

      case 'Quarterly':
        return quarterlyData;

      case 'Yearly':
        return yearlyData;

      default:
        return monthlyData;
    }
  };

  const trends = getData();

  const maxEngagement = Math.max(
    ...trends.map((item) => item.engagement)
  );

  const maxReach = Math.max(
    ...trends.map((item) => item.reach)
  );

  const latest = trends[trends.length - 1];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Performance Trends
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Track your social media performance over time
        </p>
      </div>

      {/* Time Period */}
      <div className="flex flex-wrap gap-2">

        {(['Monthly', 'Weekly', 'Quarterly', 'Yearly'] as Period[]).map(
          (item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`px-4 py-2 rounded-lg text-sm ${
                period === item
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              {item}
            </button>
          )
        )}

      </div>

      {/* Selected Period */}
      <div className="text-sm text-gray-500">
        Showing performance for:
        <span className="font-semibold text-gray-900 ml-1">
          {period}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Engagement */}
        <Card className="p-5">

          <p className="text-sm text-gray-500">
            Engagement
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {latest.engagement.toLocaleString()}
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +14% growth
          </p>

        </Card>

        {/* Reach */}
        <Card className="p-5">

          <p className="text-sm text-gray-500">
            Reach
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {latest.reach.toLocaleString()}
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +18% growth
          </p>

        </Card>

        {/* Impressions */}
        <Card className="p-5">

          <p className="text-sm text-gray-500">
            Impressions
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {latest.impressions.toLocaleString()}
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +22% growth
          </p>

        </Card>

        {/* Followers */}
        <Card className="p-5">

          <p className="text-sm text-gray-500">
            Followers
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {latest.followers.toLocaleString()}
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +15% growth
          </p>

        </Card>

      </div>

      {/* Engagement Trend */}
      <Card className="p-5">

        <h3 className="text-base font-semibold text-gray-900">
          Engagement Trend
        </h3>

        <p className="text-sm text-gray-500 mb-5">
          {period} engagement performance
        </p>

        <div className="space-y-4">

          {trends.map((item) => (

            <div
              key={item.label}
              className="flex items-center gap-4"
            >

              <span className="w-16 text-sm font-medium text-gray-600">
                {item.label}
              </span>

              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">

                <div
                  className="h-full bg-indigo-500 rounded-lg"
                  style={{
                    width: `${(item.engagement / maxEngagement) * 100}%`,
                  }}
                />

              </div>

              <span className="w-20 text-right text-sm font-semibold">
                {item.engagement.toLocaleString()}
              </span>

            </div>

          ))}

        </div>

      </Card>

      {/* Reach Trend */}
      <Card className="p-5">

        <h3 className="text-base font-semibold text-gray-900">
          Reach Trend
        </h3>

        <p className="text-sm text-gray-500 mb-5">
          {period} audience reach
        </p>

        <div className="space-y-4">

          {trends.map((item) => (

            <div
              key={item.label}
              className="flex items-center gap-4"
            >

              <span className="w-16 text-sm font-medium text-gray-600">
                {item.label}
              </span>

              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">

                <div
                  className="h-full bg-violet-500 rounded-lg"
                  style={{
                    width: `${(item.reach / maxReach) * 100}%`,
                  }}
                />

              </div>

              <span className="w-24 text-right text-sm font-semibold">
                {item.reach.toLocaleString()}
              </span>

            </div>

          ))}

        </div>

      </Card>

      {/* Historical Performance */}
      <Card className="p-5">

        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Historical Performance
        </h3>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-200">

                <th className="text-left py-3">
                  {period === 'Monthly'
                    ? 'Month'
                    : period === 'Weekly'
                    ? 'Week'
                    : period === 'Quarterly'
                    ? 'Quarter'
                    : 'Year'}
                </th>

                <th className="text-right py-3">
                  Engagement
                </th>

                <th className="text-right py-3">
                  Reach
                </th>

                <th className="text-right py-3">
                  Impressions
                </th>

                <th className="text-right py-3">
                  Clicks
                </th>

                <th className="text-right py-3">
                  Followers
                </th>

              </tr>

            </thead>

            <tbody>

              {trends.map((item) => (

                <tr
                  key={item.label}
                  className="border-b border-gray-100"
                >

                  <td className="py-3 font-medium">
                    {item.label}
                  </td>

                  <td className="text-right py-3">
                    {item.engagement.toLocaleString()}
                  </td>

                  <td className="text-right py-3">
                    {item.reach.toLocaleString()}
                  </td>

                  <td className="text-right py-3">
                    {item.impressions.toLocaleString()}
                  </td>

                  <td className="text-right py-3">
                    {item.clicks.toLocaleString()}
                  </td>

                  <td className="text-right py-3">
                    {item.followers.toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}