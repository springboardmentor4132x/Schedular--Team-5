import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Megaphone, Users, TrendingUp, ArrowUpRight,
  FileText, Eye, Heart, MessageCircle, Share2, Plus,
  CheckCircle2, Clock, AlertCircle, Megaphone as Campaign,
} from 'lucide-react';
import { StatCard, ChartCard } from '../components/ui/StatCard';
import { GradientAreaChart, DonutChart } from '../components/charts/Charts';
import { Card, Badge, Button } from '../components/ui';
import { currentUser, analyticsData, recentActivities, scheduledPosts } from '../data/mockData';
import { formatNumber, getPlatformConfig, formatTime } from '../utils/helpers';

const platformIcons: Record<string, any> = {};
['facebook', 'instagram', 'twitter', 'linkedin'].forEach((p) => {
  platformIcons[p] = getPlatformConfig(p);
});

export function DashboardPage() {
  const upcomingPosts = scheduledPosts.filter((p) => p.status === 'scheduled').slice(0, 4);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting}, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening with your social media today.
          </p>
        </div>
        <Link to="/app/create-post">
          <Button icon={<Plus className="w-4 h-4" />}>Create Post</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Scheduled Posts" value={43} change={12} icon={<Calendar className="w-5 h-5" />} color="indigo" index={0} />
        <StatCard title="Active Campaigns" value={5} change={8} icon={<Megaphone className="w-5 h-5" />} color="violet" index={1} />
        <StatCard title="Total Followers" value="83.6K" change={15} icon={<Users className="w-5 h-5" />} color="emerald" index={2} />
        <StatCard title="Engagement Rate" value="9.2%" change={-2} icon={<TrendingUp className="w-5 h-5" />} color="amber" index={3} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Engagement Overview"
          subtitle="Total engagement across all platforms"
          className="lg:col-span-2"
          action={
            <select className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>Last 7 months</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          }
        >
          <GradientAreaChart
            data={analyticsData.engagementTrend}
            xKey="date"
            areas={[
              { key: 'instagram', name: 'Instagram', color: '#E1306C' },
              { key: 'facebook', name: 'Facebook', color: '#1877F2' },
              { key: 'twitter', name: 'Twitter', color: '#1DA1F2' },
              { key: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
            ]}
            height={300}
          />
        </ChartCard>

        <ChartCard title="Post Status" subtitle="Distribution of all posts">
          <DonutChart data={analyticsData.postsByStatus} height={300} innerRadius={50} />
        </ChartCard>
      </div>

      {/* Upcoming posts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Upcoming Posts</h3>
              <p className="text-sm text-gray-500">Scheduled content going live soon</p>
            </div>
            <Link to="/app/calendar" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View calendar <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-1">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(post.scheduledAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {post.platforms.map((p) => {
                        const config = getPlatformConfig(p);
                        const Icon = config.icon;
                        return <Icon key={p} className="w-3.5 h-3.5" style={{ color: config.color }} />;
                      })}
                    </div>
                    {post.campaign && <Badge variant="purple" className="!py-0.5">{post.campaign}</Badge>}
                  </div>
                </div>
                <Badge variant={post.status === 'scheduled' ? 'info' : 'default'} dot>
                  {post.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Recent Activity</h3>
          <p className="text-sm text-gray-500 mb-4">Latest events across your workspace</p>
          <div className="space-y-4">
            {recentActivities.slice(0, 6).map((activity, idx) => {
              const iconMap = {
                published: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                scheduled: { icon: Clock, color: 'bg-blue-50 text-blue-600' },
                campaign: { icon: Campaign, color: 'bg-violet-50 text-violet-600' },
                failed: { icon: AlertCircle, color: 'bg-red-50 text-red-600' },
              };
              const config = iconMap[activity.type as keyof typeof iconMap];
              const Icon = config.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Platform performance */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Platform Performance</h3>
            <p className="text-sm text-gray-500">How your connected accounts are performing</p>
          </div>
          <Link to="/app/analytics">
            <Button variant="ghost" size="sm">View details <ArrowUpRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.platformPerformance.map((platform, idx) => {
            const config = getPlatformConfig(platform.platform.toLowerCase());
            const Icon = config.icon;
            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -3 }}
                className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Reach</span>
                    <span className="font-semibold text-gray-900">{formatNumber(platform.reach)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Impressions</span>
                    <span className="font-semibold text-gray-900">{formatNumber(platform.impressions)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Engagement</span>
                    <span className="font-semibold text-emerald-600">{platform.engagement}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
{/* Campaign ROI */}
<Card className="p-5">
  <h3 className="text-lg font-semibold mb-4">Campaign ROI</h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    <div className="rounded-xl border p-4">
      <p className="text-gray-500 text-sm">Total Investment</p>
      <h2 className="text-2xl font-bold mt-2">$4,500</h2>
    </div>

    <div className="rounded-xl border p-4">
      <p className="text-gray-500 text-sm">Revenue</p>
      <h2 className="text-2xl font-bold mt-2 text-green-600">$9,850</h2>
    </div>

    <div className="rounded-xl border p-4">
      <p className="text-gray-500 text-sm">ROI</p>
      <h2 className="text-2xl font-bold mt-2 text-blue-600">
        +118%
      </h2>
    </div>

  </div>
</Card>
<Card className="p-5">
<h3 className="text-lg font-semibold mb-4">
Audience Device Analytics
</h3>

<div className="space-y-4">

<div>
<div className="flex justify-between">
<span>Mobile</span>
<span>72%</span>
</div>

<div className="w-full h-2 bg-gray-200 rounded-full">
<div
className="h-2 rounded-full bg-blue-600"
style={{width:"72%"}}
/>
</div>
</div>

<div>
<div className="flex justify-between">
<span>Desktop</span>
<span>21%</span>
</div>

<div className="w-full h-2 bg-gray-200 rounded-full">
<div
className="h-2 rounded-full bg-green-600"
style={{width:"21%"}}
/>
</div>
</div>

<div>
<div className="flex justify-between">
<span>Tablet</span>
<span>7%</span>
</div>

<div className="w-full h-2 bg-gray-200 rounded-full">
<div
className="h-2 rounded-full bg-purple-600"
style={{width:"7%"}}
/>
</div>
</div>

</div>
</Card>
      {/* Top Posts */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Performing Posts</h3>
            <p className="text-sm text-gray-500">Your best content this month</p>
          </div>
        </div>
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
                </div>
                <p className="text-sm text-gray-900 line-clamp-2 mb-3">{post.content}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Heart, label: post.likes, color: 'text-rose-500' },
                    { icon: MessageCircle, label: post.comments, color: 'text-blue-500' },
                    { icon: Share2, label: post.shares, color: 'text-emerald-500' },
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
