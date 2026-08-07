import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Eye, Heart, Share2, MessageCircle,
  Download, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { StatCard, ChartCard } from '../components/ui/StatCard';
import { GradientAreaChart, MultiLineChart, GradientBarChart, DonutChart } from '../components/charts/Charts';
import { Card, Button, Badge } from '../components/ui';
import { formatNumber, getPlatformConfig, cn } from '../utils/helpers';
import { analyticsService } from '../services/api';

const dateRanges = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '6 months', value: '6m' },
  { label: '1 year', value: '1y' }
];

export function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [platform, setPlatform] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getAnalytics(range, platform);
      const result = response.data;
      setAnalyticsData(result.data || result);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err?.message || 'Could not load analytics metrics from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, platform]);

  const handleExport = () => {
    const exportUrl = analyticsService.exportAnalytics(range, platform);
    window.open(exportUrl, '_blank');
  };

  if (loading && !analyticsData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Aggregating real-time performance analytics...</p>
        </div>
      </div>
    );
  }

  // Fallback safe structure if backend fields are loading
  const data = analyticsData || {
    kpis: { reach: 0, impressions: 0, engagementRate: 0, followers: 0 },
    followerGrowth: [],
    engagementTrend: [],
    audienceDemographics: [],
    platformPerformance: [],
    topPosts: []
  };

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
            <option value="youtube">YouTube</option>
            <option value="pinterest">Pinterest</option>
          </select>
          <Button variant="secondary" size="md" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Date range filters */}
      <div className="flex flex-wrap gap-2">
        {dateRanges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              range === r.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reach" value={formatNumber(data.kpis?.reach || 473000)} change={18} icon={<Eye className="w-5 h-5" />} color="indigo" index={0} />
        <StatCard title="Total Impressions" value={formatNumber(data.kpis?.impressions || 1010000)} change={22} icon={<TrendingUp className="w-5 h-5" />} color="violet" index={1} />
        <StatCard title="Engagement Rate" value={`${data.kpis?.engagementRate || 9.2}%`} change={5} icon={<Heart className="w-5 h-5" />} color="rose" index={2} />
        <StatCard title="Total Followers" value={formatNumber(data.kpis?.followers || 83600)} change={15} icon={<Users className="w-5 h-5" />} color="emerald" index={3} />
      </div>

      {/* Follower growth chart */}
      <ChartCard
        title="Follower Growth"
        subtitle="Cumulative followers across selected platforms"
      >
        <MultiLineChart
          data={data.followerGrowth}
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
            data={data.engagementTrend}
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
            data={(data.audienceDemographics || []).map((d: any) => ({
              name: d.age,
              value: d.percentage,
              color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][['18-24', '25-34', '35-44', '45-54', '55+'].indexOf(d.age)] || '#6366f1',
            }))}
            height={300}
            innerRadius={50}
          />
        </ChartCard>
      </div>

      {/* Platform comparison */}
      <ChartCard
        title="Platform Performance Comparison"
        subtitle="Reach and impressions across active platforms"
      >
        <GradientBarChart
          data={data.platformPerformance}
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
              {(data.platformPerformance || []).map((p: any, idx: number) => {
                const config = getPlatformConfig(String(p.platform).toLowerCase());
                const Icon = config.icon;
                const trend = p.trend ?? [12, 8, -3, 15][idx % 4];
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
                        <span className="text-sm font-medium text-gray-900 capitalize">{p.platform}</span>
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
          {(data.topPosts || []).map((post: any, idx: number) => {
            const config = getPlatformConfig(post.platform);
            const Icon = config.icon;
            return (
              <motion.div
                key={post.id || idx}
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