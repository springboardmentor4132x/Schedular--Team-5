import { useState } from 'react';
import {
  Megaphone,
  FileText,
  Eye,
  TrendingUp,
  MousePointerClick,
  Heart,
  DollarSign,
} from 'lucide-react';

export function CampaignAnalyticsPage() {
  const [campaignFilter, setCampaignFilter] =
    useState('All Campaigns');

  const campaigns = [
    {
      name: 'Summer Sale',
      duration: 'Jul 01 - Aug 05, 2026',
      status: 'Active',
      posts: 18,
      reach: '145K',
      impressions: '312K',
      engagement: '9.8%',
      clicks: '8.4K',
      likes: '12.6K',
      roi: '+118%',
    },
    {
      name: 'Product Launch Q3',
      duration: 'Jul 15 - Aug 10, 2026',
      status: 'Active',
      posts: 12,
      reach: '198K',
      impressions: '445K',
      engagement: '11.2%',
      clicks: '10.8K',
      likes: '18.4K',
      roi: '+142%',
    },
    {
      name: 'Brand Awareness',
      duration: 'Jun 10 - Jul 30, 2026',
      status: 'Completed',
      posts: 24,
      reach: '176K',
      impressions: '368K',
      engagement: '8.4%',
      clicks: '7.2K',
      likes: '14.1K',
      roi: '+96%',
    },
    {
      name: 'Social Proof',
      duration: 'Jul 20 - Aug 15, 2026',
      status: 'Active',
      posts: 9,
      reach: '92K',
      impressions: '184K',
      engagement: '10.6%',
      clicks: '5.1K',
      likes: '9.2K',
      roi: '+124%',
    },
  ];

  // Filter campaigns based on selected option
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (campaignFilter === 'All Campaigns') {
      return true;
    }

    if (campaignFilter === 'Active Campaigns') {
      return campaign.status === 'Active';
    }

    if (campaignFilter === 'Completed Campaigns') {
      return campaign.status === 'Completed';
    }

    return true;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Campaign Analytics
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Track and compare the performance of your campaigns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Campaigns */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Campaigns
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                12
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +3 this month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-indigo-600" />
            </div>

          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Posts
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                63
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +12% this month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>

          </div>
        </div>

        {/* Total Reach */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Reach
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                611K
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +18% this month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>

          </div>
        </div>

        {/* Average Engagement */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Avg. Engagement
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                10.0%
              </h2>

              <p className="text-xs text-emerald-600 mt-2">
                +5% this month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-rose-500" />
            </div>

          </div>
        </div>

      </div>

      {/* Campaign Performance */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Campaign Performance
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Compare performance across campaigns
            </p>
          </div>

          {/* Campaign Filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2"
          >
            <option>All Campaigns</option>
            <option>Active Campaigns</option>
            <option>Completed Campaigns</option>
          </select>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-200">

                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Campaign
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Posts
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Reach
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Impressions
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Engagement
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Clicks
                </th>

                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  ROI
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredCampaigns.map((campaign) => (

                <tr
                  key={campaign.name}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >

                  {/* Campaign */}
                  <td className="py-4 px-2">

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        {campaign.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {campaign.duration}
                      </p>

                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {campaign.status}
                      </span>

                    </div>

                  </td>

                  {/* Posts */}
                  <td className="py-4 px-2 text-right text-sm font-medium">
                    {campaign.posts}
                  </td>

                  {/* Reach */}
                  <td className="py-4 px-2 text-right text-sm font-medium">
                    {campaign.reach}
                  </td>

                  {/* Impressions */}
                  <td className="py-4 px-2 text-right text-sm font-medium">
                    {campaign.impressions}
                  </td>

                  {/* Engagement */}
                  <td className="py-4 px-2 text-right">

                    <span className="text-sm font-semibold text-emerald-600">
                      {campaign.engagement}
                    </span>

                  </td>

                  {/* Clicks */}
                  <td className="py-4 px-2 text-right text-sm font-medium">
                    {campaign.clicks}
                  </td>

                  {/* ROI */}
                  <td className="py-4 px-2 text-right">

                    <span className="text-sm font-semibold text-indigo-600">
                      {campaign.roi}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {/* No Results */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">
              No campaigns found
            </div>
          )}

        </div>

      </div>

      {/* Top Campaigns */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <h3 className="text-base font-semibold text-gray-900">
          Top Campaigns
        </h3>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Best performing campaigns this month
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {filteredCampaigns.slice(0, 3).map((campaign, index) => (

            <div
              key={campaign.name}
              className="rounded-xl border border-gray-200 p-4"
            >

              <div className="flex items-center justify-between mb-3">

                <span className="text-xs font-semibold text-indigo-600">
                  #{index + 1}
                </span>

                <TrendingUp className="w-4 h-4 text-emerald-500" />

              </div>

              <h4 className="text-sm font-semibold text-gray-900">
                {campaign.name}
              </h4>

              <div className="grid grid-cols-2 gap-3 mt-4">

                <div>
                  <p className="text-xs text-gray-500">
                    Reach
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {campaign.reach}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Engagement
                  </p>

                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    {campaign.engagement}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Clicks
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {campaign.clicks}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    ROI
                  </p>

                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    {campaign.roi}
                  </p>
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Campaign Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Total Clicks */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-blue-600" />
            </div>

            <div>

              <p className="text-xs text-gray-500">
                Total Clicks
              </p>

              <p className="text-xl font-bold text-gray-900">
                31.5K
              </p>

            </div>

          </div>

        </div>

        {/* Total Likes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>

            <div>

              <p className="text-xs text-gray-500">
                Total Likes
              </p>

              <p className="text-xl font-bold text-gray-900">
                54.3K
              </p>

            </div>

          </div>

        </div>

        {/* Total ROI */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>

            <div>

              <p className="text-xs text-gray-500">
                Total ROI
              </p>

              <p className="text-xl font-bold text-gray-900">
                +118%
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}