export const currentUser = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@socialpilot.io',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
  role: 'Marketing Team',
  company: 'TechVentures Inc.',
  plan: 'Pro',
};

export const socialAccounts = [
  { id: '1', platform: 'facebook', handle: '@techventures', followers: 24500, status: 'connected', color: '#1877F2', posts: 142 },
  { id: '2', platform: 'instagram', handle: '@techventures_', followers: 38200, status: 'connected', color: '#E1306C', posts: 287 },
  { id: '3', platform: 'twitter', handle: '@TechVenturesHQ', followers: 12800, status: 'connected', color: '#1DA1F2', posts: 521 },
  { id: '4', platform: 'linkedin', handle: 'TechVentures Inc', followers: 8900, status: 'connected', color: '#0A66C2', posts: 96 },
  { id: '5', platform: 'youtube', handle: 'TechVentures TV', followers: 5100, status: 'disconnected', color: '#FF0000', posts: 34 },
  { id: '6', platform: 'pinterest', handle: '@techventures', followers: 3200, status: 'disconnected', color: '#E60023', posts: 0 },
];

export const scheduledPosts = [
  { id: '1', content: 'Excited to announce our new product launch! Stay tuned for the big reveal. #ProductLaunch #Innovation', platforms: ['facebook', 'instagram', 'twitter'], scheduledAt: '2026-07-12T10:00:00', status: 'scheduled', campaign: 'Product Launch Q3', image: null },
  { id: '2', content: 'Behind the scenes of our latest campaign shoot. The team is working hard to bring you something special!', platforms: ['instagram'], scheduledAt: '2026-07-12T14:00:00', status: 'scheduled', campaign: 'Brand Awareness', image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: '3', content: 'Join us for a live Q&A session this Friday at 3PM EST. Drop your questions below!', platforms: ['facebook', 'linkedin'], scheduledAt: '2026-07-13T09:00:00', status: 'scheduled', campaign: null, image: null },
  { id: '4', content: 'Check out our latest blog post on social media trends for 2026. Link in bio!', platforms: ['twitter', 'linkedin'], scheduledAt: '2026-07-13T15:30:00', status: 'draft', campaign: 'Content Marketing', image: null },
  { id: '5', content: 'Customer spotlight: How @ClientCo increased their engagement by 300% using our platform.', platforms: ['facebook', 'instagram', 'twitter', 'linkedin'], scheduledAt: '2026-07-14T11:00:00', status: 'scheduled', campaign: 'Social Proof', image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: '6', content: 'Happy Monday! Start your week with our productivity tips for social media managers.', platforms: ['facebook', 'instagram'], scheduledAt: '2026-07-07T08:00:00', status: 'published', campaign: null, image: null },
  { id: '7', content: 'New feature alert: Auto-scheduling is now smarter than ever with AI-powered optimal time detection!', platforms: ['twitter'], scheduledAt: '2026-07-08T12:00:00', status: 'published', campaign: 'Product Updates', image: null },
  { id: '8', content: 'We hit 100K followers! Thank you for your incredible support. Here\'s to the next milestone!', platforms: ['facebook', 'instagram', 'twitter'], scheduledAt: '2026-07-09T16:00:00', status: 'failed', campaign: null, image: null },
  { id: '9', content: 'Summer sale is LIVE! Get 30% off all premium plans. Use code SUMMER30 at checkout.', platforms: ['facebook', 'instagram', 'twitter', 'linkedin'], scheduledAt: '2026-07-15T09:00:00', status: 'scheduled', campaign: 'Summer Sale', image: 'https://images.pexels.com/photos/5632394/pexels-photo-5632394.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: '10', content: 'Webinar recap: Key takeaways from "The Future of Social Media Marketing 2026"', platforms: ['linkedin'], scheduledAt: '2026-07-16T10:00:00', status: 'draft', campaign: 'Content Marketing', image: null },
];

export const campaigns = [
  { id: '1', name: 'Product Launch Q3', description: 'Launch campaign for our new enterprise product line', platforms: ['facebook', 'instagram', 'twitter', 'linkedin'], startDate: '2026-07-01', endDate: '2026-07-31', budget: 15000, spent: 8420, status: 'active', posts: 24, reach: 145000, engagement: 8.4, objective: 'Brand Awareness', color: '#3B82F6' },
  { id: '2', name: 'Summer Sale 2026', description: 'Promotional campaign for summer discount offering', platforms: ['facebook', 'instagram', 'twitter'], startDate: '2026-07-10', endDate: '2026-07-25', budget: 8000, spent: 2100, status: 'active', posts: 12, reach: 78000, engagement: 6.2, objective: 'Conversions', color: '#F59E0B' },
  { id: '3', name: 'Brand Awareness Q2', description: 'Increase brand visibility across all social platforms', platforms: ['facebook', 'instagram', 'linkedin'], startDate: '2026-04-01', endDate: '2026-06-30', budget: 20000, spent: 20000, status: 'completed', posts: 67, reach: 385000, engagement: 7.8, objective: 'Brand Awareness', color: '#10B981' },
  { id: '4', name: 'Content Marketing', description: 'Educational content series to drive organic growth', platforms: ['linkedin', 'twitter'], startDate: '2026-07-01', endDate: '2026-09-30', budget: 5000, spent: 1200, status: 'active', posts: 18, reach: 45000, engagement: 11.2, objective: 'Engagement', color: '#8B5CF6' },
  { id: '5', name: 'Social Proof Campaign', description: 'Customer testimonials and case study promotions', platforms: ['facebook', 'instagram', 'twitter', 'linkedin'], startDate: '2026-06-01', endDate: '2026-07-15', budget: 6000, spent: 5800, status: 'active', posts: 31, reach: 92000, engagement: 9.1, objective: 'Trust Building', color: '#EF4444' },
  { id: '6', name: 'Holiday Prep', description: 'Pre-holiday awareness and early-bird promotions', platforms: ['facebook', 'instagram'], startDate: '2026-11-01', endDate: '2026-12-31', budget: 25000, spent: 0, status: 'draft', posts: 0, reach: 0, engagement: 0, objective: 'Sales', color: '#EC4899' },
];

export const notifications = [
  { id: '1', type: 'schedule', title: 'Post scheduled successfully', message: 'Your Instagram post is scheduled for July 12 at 2:00 PM', time: '2 minutes ago', read: false },
  { id: '2', type: 'alert', title: 'Post failed to publish', message: 'Facebook post failed due to API timeout. Retry?', time: '1 hour ago', read: false },
  { id: '3', type: 'campaign', title: 'Campaign milestone reached', message: 'Product Launch Q3 has reached 100K impressions!', time: '3 hours ago', read: false },
  { id: '4', type: 'info', title: 'Weekly report ready', message: 'Your performance report for July 1-7 is ready to view', time: '1 day ago', read: true },
  { id: '5', type: 'schedule', title: 'Upcoming post reminder', message: '3 posts are scheduled to go live in the next 24 hours', time: '2 days ago', read: true },
  { id: '6', type: 'alert', title: 'Account token expiring', message: 'LinkedIn API token expires in 3 days. Please reconnect.', time: '2 days ago', read: true },
  { id: '7', type: 'campaign', title: 'Campaign ending soon', message: 'Summer Sale 2026 ends in 2 weeks. Review performance.', time: '3 days ago', read: true },
  { id: '8', type: 'info', title: 'New team member joined', message: 'Sarah Chen has accepted your team invitation', time: '5 days ago', read: true },
];

export const analyticsData = {
  engagementTrend: [
    { date: 'Jan', facebook: 4200, instagram: 6800, twitter: 2100, linkedin: 1800 },
    { date: 'Feb', facebook: 4800, instagram: 7200, twitter: 2400, linkedin: 2100 },
    { date: 'Mar', facebook: 5100, instagram: 8100, twitter: 2800, linkedin: 2400 },
    { date: 'Apr', facebook: 4700, instagram: 7600, twitter: 2600, linkedin: 2200 },
    { date: 'May', facebook: 5600, instagram: 9200, twitter: 3100, linkedin: 2700 },
    { date: 'Jun', facebook: 6200, instagram: 10400, twitter: 3400, linkedin: 3100 },
    { date: 'Jul', facebook: 6800, instagram: 11200, twitter: 3700, linkedin: 3400 },
  ],
  followerGrowth: [
    { date: 'Jan', facebook: 18200, instagram: 28400, twitter: 9200, linkedin: 6800 },
    { date: 'Feb', facebook: 19100, instagram: 30200, twitter: 9800, linkedin: 7200 },
    { date: 'Mar', facebook: 20400, instagram: 31800, twitter: 10200, linkedin: 7600 },
    { date: 'Apr', facebook: 21200, instagram: 33400, twitter: 10800, linkedin: 7900 },
    { date: 'May', facebook: 22100, instagram: 35200, twitter: 11400, linkedin: 8200 },
    { date: 'Jun', facebook: 23400, instagram: 37100, twitter: 12100, linkedin: 8600 },
    { date: 'Jul', facebook: 24500, instagram: 38200, twitter: 12800, linkedin: 8900 },
  ],
  platformPerformance: [
    { platform: 'Facebook', reach: 145000, impressions: 312000, clicks: 8400, engagement: 6.8 },
    { platform: 'Instagram', reach: 198000, impressions: 445000, clicks: 12600, engagement: 9.2 },
    { platform: 'Twitter', reach: 78000, impressions: 156000, clicks: 4200, engagement: 4.1 },
    { platform: 'LinkedIn', reach: 52000, impressions: 98000, clicks: 6800, engagement: 11.4 },
  ],
  topPosts: [
    { id: '1', content: 'We hit 100K followers! Thank you for your incredible support.', platform: 'instagram', likes: 4821, comments: 312, shares: 891, reach: 48200 },
    { id: '2', content: 'Excited to announce our new product launch!', platform: 'facebook', likes: 2341, comments: 186, shares: 542, reach: 32100 },
    { id: '3', content: 'New feature alert: Auto-scheduling is now smarter than ever!', platform: 'twitter', likes: 1892, comments: 94, shares: 412, reach: 24800 },
    { id: '4', content: 'Customer spotlight: How ClientCo increased engagement by 300%', platform: 'linkedin', likes: 1204, comments: 213, shares: 298, reach: 18400 },
  ],
  audienceDemographics: [
    { age: '18-24', percentage: 22 },
    { age: '25-34', percentage: 38 },
    { age: '35-44', percentage: 24 },
    { age: '45-54', percentage: 11 },
    { age: '55+', percentage: 5 },
  ],
  postsByStatus: [
    { name: 'Published', value: 187, color: '#10B981' },
    { name: 'Scheduled', value: 43, color: '#3B82F6' },
    { name: 'Draft', value: 28, color: '#6B7280' },
    { name: 'Failed', value: 12, color: '#EF4444' },
  ],
};

export const recentActivities = [
  { id: '1', type: 'published', description: 'Post published on Instagram', time: '5 min ago', platform: 'instagram' },
  { id: '2', type: 'scheduled', description: 'New post scheduled for Facebook', time: '23 min ago', platform: 'facebook' },
  { id: '3', type: 'campaign', description: 'Campaign "Summer Sale" updated', time: '1 hour ago', platform: null },
  { id: '4', type: 'published', description: 'Post published on Twitter', time: '2 hours ago', platform: 'twitter' },
  { id: '5', type: 'failed', description: 'LinkedIn post failed - retrying', time: '3 hours ago', platform: 'linkedin' },
  { id: '6', type: 'campaign', description: 'New campaign "Content Marketing" created', time: '5 hours ago', platform: null },
];

export const teamMembers = [
  { id: '1', name: 'Alex Johnson', email: 'alex@socialpilot.io', role: 'Marketing Team', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@socialpilot.io', role: 'Content Creator', avatar: 'https://images.pexels.com/photos/3746314/pexels-photo-3746314.jpeg?auto=compress&cs=tinysrgb&w=100', status: 'active' },
  { id: '3', name: 'Marcus Reed', email: 'marcus@socialpilot.io', role: 'Administrator', avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100', status: 'active' },
  { id: '4', name: 'Priya Patel', email: 'priya@socialpilot.io', role: 'Business User', avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=100', status: 'inactive' },
];
