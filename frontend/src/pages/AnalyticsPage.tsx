import { useState } from 'react';

import { ContentAnalyticsPage } from './ContentAnalyticsPage';
import { AudienceAnalyticsPage } from './AudienceAnalyticsPage';
import { CampaignAnalyticsPage } from './CampaignAnalyticsPage';
import { PlatformComparisonPage } from './PlatformComparisonPage';
import { PerformanceTrendsPage } from './PerformanceTrendsPage';

type Tab =
  | 'content'
  | 'audience'
  | 'campaign'
  | 'platform'
  | 'performance';

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('content');

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Track your content, audience, campaigns, platforms and performance trends.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 bg-white border border-gray-200 rounded-xl p-3">

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Content
        </button>

        <button
          onClick={() => setActiveTab('audience')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'audience'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Audience
        </button>

        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'campaign'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Campaign
        </button>

        <button
          onClick={() => setActiveTab('platform')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'platform'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Platform
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'performance'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Performance Trends
        </button>

      </div>

      {activeTab === 'content' && <ContentAnalyticsPage />}

      {activeTab === 'audience' && <AudienceAnalyticsPage />}

      {activeTab === 'campaign' && <CampaignAnalyticsPage />}

      {activeTab === 'platform' && <PlatformComparisonPage />}

      {activeTab === 'performance' && <PerformanceTrendsPage />}

    </div>
  );
}

export default AnalyticsPage;