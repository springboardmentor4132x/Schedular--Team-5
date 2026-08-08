import { Card } from '../components/ui';

const trends = [
  {
    month: 'Jan',
    engagement: 4200,
    reach: 52000,
    impressions: 89000,
    clicks: 3200,
    followers: 72000,
  },
  {
    month: 'Feb',
    engagement: 5100,
    reach: 68000,
    impressions: 110000,
    clicks: 4100,
    followers: 74500,
  },
  {
    month: 'Mar',
    engagement: 5900,
    reach: 82000,
    impressions: 145000,
    clicks: 5200,
    followers: 76800,
  },
  {
    month: 'Apr',
    engagement: 6700,
    reach: 96000,
    impressions: 178000,
    clicks: 6400,
    followers: 79200,
  },
  {
    month: 'May',
    engagement: 7200,
    reach: 118000,
    impressions: 215000,
    clicks: 7800,
    followers: 81500,
  },
  {
    month: 'Jun',
    engagement: 8100,
    reach: 136000,
    impressions: 258000,
    clicks: 9200,
    followers: 83600,
  },
];

export function PerformanceTrendsPage() {
  const maxEngagement = Math.max(
    ...trends.map((item) => item.engagement)
  );

  const maxReach = Math.max(
    ...trends.map((item) => item.reach)
  );

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

        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">
          Monthly
        </button>

        <button className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm">
          Weekly
        </button>

        <button className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm">
          Quarterly
        </button>

        <button className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm">
          Yearly
        </button>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Engagement
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            8.1K
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +14% growth
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Reach
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            136K
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +18% growth
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Impressions
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            258K
          </h2>

          <p className="text-sm text-emerald-600 mt-1">
            +22% growth
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Followers
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            83.6K
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
          Monthly engagement performance
        </p>

        <div className="space-y-4">

          {trends.map((item) => (
            <div
              key={item.month}
              className="flex items-center gap-4"
            >

              <span className="w-10 text-sm font-medium text-gray-600">
                {item.month}
              </span>

              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">

                <div
                  className="h-full bg-indigo-500 rounded-lg"
                  style={{
                    width: `${(item.engagement / maxEngagement) * 100}%`,
                  }}
                />

              </div>

              <span className="w-16 text-right text-sm font-semibold">
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
          Monthly audience reach
        </p>

        <div className="space-y-4">

          {trends.map((item) => (
            <div
              key={item.month}
              className="flex items-center gap-4"
            >

              <span className="w-10 text-sm font-medium text-gray-600">
                {item.month}
              </span>

              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">

                <div
                  className="h-full bg-violet-500 rounded-lg"
                  style={{
                    width: `${(item.reach / maxReach) * 100}%`,
                  }}
                />

              </div>

              <span className="w-20 text-right text-sm font-semibold">
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
                  Month
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
                  key={item.month}
                  className="border-b border-gray-100"
                >

                  <td className="py-3 font-medium">
                    {item.month}
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