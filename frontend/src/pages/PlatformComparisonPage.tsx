import { Card } from '../components/ui';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa';

type Platform = {
  name: string;
  followers: string;
  reach: string;
  impressions: string;
  engagement: string;
  likes: string;
  comments: string;
  shares: string;
  clicks: string;
};

const platforms: Platform[] = [
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

const platformIcons = {
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  LinkedIn: FaLinkedin,
};

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

      {/* Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const Icon =
            platformIcons[
              platform.name as keyof typeof platformIcons
            ];

          return (
            <Card key={platform.name} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="text-xl text-gray-700" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {platform.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Social Platform
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-2xl font-bold text-indigo-600">
                  {platform.followers}
                </p>

                <p className="text-xs text-gray-500">
                  Followers
                </p>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reach</span>
                  <span className="font-semibold text-gray-900">
                    {platform.reach}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Impressions</span>
                  <span className="font-semibold text-gray-900">
                    {platform.impressions}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Engagement</span>
                  <span className="font-semibold text-emerald-600">
                    {platform.engagement}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Platform Performance */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Platform Performance
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Detailed performance across connected platforms
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  Platform
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Followers
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Reach
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Impressions
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Engagement
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Likes
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Comments
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Shares
                </th>

                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  Clicks
                </th>
              </tr>
            </thead>

            <tbody>
              {platforms.map((platform) => {
                const Icon =
                  platformIcons[
                    platform.name as keyof typeof platformIcons
                  ];

                return (
                  <tr
                    key={platform.name}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon className="text-gray-700" />
                        </div>

                        <span className="font-medium text-gray-900">
                          {platform.name}
                        </span>
                      </div>
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.followers}
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.reach}
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.impressions}
                    </td>

                    <td className="text-right py-4 px-2 font-semibold text-emerald-600">
                      {platform.engagement}
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.likes}
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.comments}
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.shares}
                    </td>

                    <td className="text-right py-4 px-2">
                      {platform.clicks}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}