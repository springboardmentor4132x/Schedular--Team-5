import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Eye, Heart, Share2, MessageCircle,
  Download, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { StatCard, ChartCard } from '../components/ui/StatCard';
import { GradientAreaChart, MultiLineChart, GradientBarChart, DonutChart } from '../components/charts/Charts';
import { Card, Button, Badge } from '../components/ui';
import { analyticsData } from '../data/mockData';
import { formatNumber, getPlatformConfig, cn } from '../utils/helpers';

const dateRanges = ['7 days', '30 days', '90 days', '6 months', '1 year'];

export function AnalyticsPage() {
  const [range, setRange] = useState('30 days');
  const [platform, setPlatform] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Deep insights into your social media performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <Button variant="secondary" size="md" icon={<Download className="w-4 h-4" />}>Export</Button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-2">
        {dateRanges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              range === r ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reach" value="473K" change={18} icon={<Eye className="w-5 h-5" />} color="indigo" index={0} />
        <StatCard title="Total Impressions" value="1.01M" change={22} icon={<TrendingUp className="w-5 h-5" />} color="violet" index={1} />
        <StatCard title="Engagement Rate" value="9.2%" change={5} icon={<Heart className="w-5 h-5" />} color="rose" index={2} />
        <StatCard title="Total Followers" value="83.6K" change={15} icon={<Users className="w-5 h-5" />} color="emerald" index={3} />
      </div>

      {/* Follower growth */}
      <ChartCard
        title="Follower Growth"
        subtitle="Cumulative followers across all platforms"
        action={
          <select className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Last 7 months</option>
            <option>Last 30 days</option>
          </select>
        }
      >
        <MultiLineChart
          data={analyticsData.followerGrowth}
          xKey="date"
          lines={[
            { key: 'instagram', name: 'Instagram', color: '#E1306C' },
            { key: 'facebook', name: 'Facebook', color: '#1877F2' },
            { key: 'twitter', name: 'Twitter', color: '#1DA1F2' },
            { key: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
          ]}
          height={320}
        />
      </ChartCard>

      {/* Engagement trend + demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Engagement Trend" subtitle="Monthly engagement by platform" className="lg:col-span-2">
          <GradientAreaChart
            data={analyticsData.engagementTrend}
            xKey="date"
            areas={[
              { key: 'instagram', name: 'Instagram', color: '#E1306C' },
              { key: 'facebook', name: 'Facebook', color: '#1877F2' },
            ]}
            height={300}
          />
        </ChartCard>

        <ChartCard title="Audience Age" subtitle="Demographic breakdown">
          <DonutChart
            data={analyticsData.audienceDemographics.map((d) => ({
              name: d.age,
              value: d.percentage,
              color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][['18-24', '25-34', '35-44', '45-54', '55+'].indexOf(d.age)],
            }))}
            height={300}
            innerRadius={50}
          />
        </ChartCard>
      </div>

      {/* Platform comparison */}
      <ChartCard
        title="Platform Performance Comparison"
        subtitle="Reach and impressions across platforms"
      >
        <GradientBarChart
          data={analyticsData.platformPerformance}
          xKey="platform"
          bars={[
            { key: 'reach', name: 'Reach', color: '#6366f1' },
            { key: 'impressions', name: 'Impressions', color: '#8b5cf6' },
          ]}
          height={300}
        />
      </ChartCard>

      {/* Platform breakdown table */}
      <Card className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reach</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Impressions</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.platformPerformance.map((p, idx) => {
                const config = getPlatformConfig(p.platform.toLowerCase());
                const Icon = config.icon;
                const trend = [12, 8, -3, 15][idx];
                return (
                  <motion.tr
                    key={p.platform}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15` }}>
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{p.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-sm text-gray-900 font-medium">{formatNumber(p.reach)}</td>
                    <td className="py-3 px-2 text-right text-sm text-gray-900 font-medium">{formatNumber(p.impressions)}</td>
                    <td className="py-3 px-2 text-right text-sm text-gray-900 font-medium">{formatNumber(p.clicks)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-semibold text-emerald-600">{p.engagement}%</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top posts */}
      <Card className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analyticsData.topPosts.map((post, idx) => {
            const config = getPlatformConfig(post.platform);
            const Icon = config.icon;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                  <span className="text-xs font-medium text-gray-500 capitalize">{post.platform}</span>
                  <Badge variant="success" className="ml-auto !py-0.5">Top Post</Badge>
                </div>
                <p className="text-sm text-gray-900 line-clamp-2 mb-3">{post.content}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Heart, label: formatNumber(post.likes), color: 'text-rose-500' },
                    { icon: MessageCircle, label: formatNumber(post.comments), color: 'text-blue-500' },
                    { icon: Share2, label: formatNumber(post.shares), color: 'text-emerald-500' },
                    { icon: Eye, label: formatNumber(post.reach), color: 'text-violet-500' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs font-semibold text-gray-900">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
