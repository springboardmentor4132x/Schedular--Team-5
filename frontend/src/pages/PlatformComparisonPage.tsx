import { Card } from '../components/ui';

const platforms = [
  {
    name: 'Facebook',
    followers: '42.5K',
    reach: '145.0K',
    impressions: '312.0K',
    engagement: '6.8%',
    likes: '18.4K',
    comments: '3.2K',
    shares: '2.8K',
    clicks: '8.6K',
  },
  {
    name: 'Instagram',
    followers: '83.6K',
    reach: '198.0K',
    impressions: '445.0K',
    engagement: '9.2%',
    likes: '28.4K',
    comments: '6.2K',
    shares: '8.2K',
    clicks: '18.6K',
  },
  {
    name: 'Twitter',
    followers: '24.8K',
    reach: '78.0K',
    impressions: '156.0K',
    engagement: '4.1%',
    likes: '9.8K',
    comments: '1.4K',
    shares: '2.1K',
    clicks: '6.2K',
  },
  {
    name: 'LinkedIn',
    followers: '18.2K',
    reach: '52.0K',
    impressions: '98.0K',
    engagement: '11.4%',
    likes: '7.2K',
    comments: '2.1K',
    shares: '2.9K',
    clicks: '4.8K',
  },
];

export function PlatformComparisonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Platform Comparison
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Compare the performance of all connected social media platforms
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.name} className="p-5">
            <h3 className="font-semibold text-gray-900">
              {platform.name}
            </h3>

            <p className="text-2xl font-bold text-indigo-600 mt-3">
              {platform.followers}
            </p>

            <p className="text-xs text-gray-500">
              Followers
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Reach</span>
                <b>{platform.reach}</b>
              </div>

              <div className="flex justify-between">
                <span>Impressions</span>
                <b>{platform.impressions}</b>
              </div>

              <div className="flex justify-between">
                <span>Engagement</span>
                <b className="text-emerald-600">
                  {platform.engagement}
                </b>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Platform Performance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3">Platform</th>
                <th className="text-right py-3">Followers</th>
                <th className="text-right py-3">Reach</th>
                <th className="text-right py-3">Impressions</th>
                <th className="text-right py-3">Engagement</th>
                <th className="text-right py-3">Likes</th>
                <th className="text-right py-3">Comments</th>
                <th className="text-right py-3">Shares</th>
                <th className="text-right py-3">Clicks</th>
              </tr>
            </thead>

            <tbody>
              {platforms.map((platform) => (
                <tr
                  key={platform.name}
                  className="border-b border-gray-100"
                >
                  <td className="py-3 font-medium">
                    {platform.name}
                  </td>

                  <td className="text-right py-3">
                    {platform.followers}
                  </td>

                  <td className="text-right py-3">
                    {platform.reach}
                  </td>

                  <td className="text-right py-3">
                    {platform.impressions}
                  </td>

                  <td className="text-right py-3 text-emerald-600 font-semibold">
                    {platform.engagement}
                  </td>

                  <td className="text-right py-3">
                    {platform.likes}
                  </td>

                  <td className="text-right py-3">
                    {platform.comments}
                  </td>

                  <td className="text-right py-3">
                    {platform.shares}
                  </td>

                  <td className="text-right py-3">
                    {platform.clicks}
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