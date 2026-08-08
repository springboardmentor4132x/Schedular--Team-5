import { useState } from 'react';
import { Search, Filter, Heart, MessageCircle, Share2, Eye } from 'lucide-react';

export function ContentAnalyticsPage() {
  const [search, setSearch] = useState('');

  const posts = [
    {
      id: 1,
      platform: 'Instagram',
      campaign: 'Product Launch Q3',
      caption: 'We hit 100K followers! Thank you for your incredible support.',
      date: 'Aug 5, 2026',
      type: 'Image',
      likes: 4821,
      comments: 312,
      shares: 891,
      reach: 48200,
      impressions: 76100,
      clicks: 2140,
      engagement: 9.2,
    },
    {
      id: 2,
      platform: 'Facebook',
      campaign: 'Brand Awareness',
      caption: 'Excited to announce our new product launch!',
      date: 'Aug 4, 2026',
      type: 'Image',
      likes: 2341,
      comments: 186,
      shares: 542,
      reach: 32100,
      impressions: 58300,
      clicks: 1450,
      engagement: 8.1,
    },
    {
      id: 3,
      platform: 'Twitter',
      campaign: 'Product Launch Q3',
      caption: 'New feature alert: Auto-scheduling is now smarter than ever!',
      date: 'Aug 3, 2026',
      type: 'Text',
      likes: 1892,
      comments: 194,
      shares: 412,
      reach: 24800,
      impressions: 42100,
      clicks: 1120,
      engagement: 7.6,
    },
    {
      id: 4,
      platform: 'LinkedIn',
      campaign: 'Social Proof',
      caption: 'Customer spotlight: How ClientCo increased engagement by 300%.',
      date: 'Aug 2, 2026',
      type: 'Article',
      likes: 1204,
      comments: 213,
      shares: 298,
      reach: 18400,
      impressions: 31900,
      clicks: 980,
      engagement: 11.4,
    },
  ];

  const filteredPosts = posts.filter((post) =>
    post.caption.toLowerCase().includes(search.toLowerCase()) ||
    post.platform.toLowerCase().includes(search.toLowerCase()) ||
    post.campaign.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Content Analytics
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Analyze the performance of every published post
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Platform */}
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option>All Platforms</option>
            <option>Instagram</option>
            <option>Facebook</option>
            <option>Twitter</option>
            <option>LinkedIn</option>
          </select>

          {/* Campaign */}
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option>All Campaigns</option>
            <option>Product Launch Q3</option>
            <option>Brand Awareness</option>
            <option>Social Proof</option>
          </select>

          {/* Content Type */}
          <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option>All Content Types</option>
            <option>Image</option>
            <option>Video</option>
            <option>Text</option>
            <option>Article</option>
          </select>

        </div>
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {filteredPosts.map((post) => (

          <div
            key={post.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
          >

            {/* Top */}
            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-2">

                <span className="text-sm font-semibold text-gray-900">
                  {post.platform}
                </span>

                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                  {post.type}
                </span>

              </div>

              <span className="text-xs text-gray-500">
                {post.date}
              </span>

            </div>

            {/* Caption */}
            <p className="text-sm text-gray-800 mb-3">
              {post.caption}
            </p>

            {/* Campaign */}
            <p className="text-xs text-gray-500 mb-4">
              Campaign: <span className="font-medium text-gray-700">
                {post.campaign}
              </span>
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Heart className="w-4 h-4 mx-auto text-rose-500 mb-1" />
                <p className="text-sm font-semibold">{post.likes}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <MessageCircle className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-sm font-semibold">{post.comments}</p>
                <p className="text-xs text-gray-500">Comments</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Share2 className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                <p className="text-sm font-semibold">{post.shares}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Eye className="w-4 h-4 mx-auto text-violet-500 mb-1" />
                <p className="text-sm font-semibold">{post.reach}</p>
                <p className="text-xs text-gray-500">Reach</p>
              </div>

            </div>

            {/* Bottom Metrics */}
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 text-xs">

              <span>
                Impressions:
                <strong className="ml-1">{post.impressions}</strong>
              </span>

              <span>
                Clicks:
                <strong className="ml-1">{post.clicks}</strong>
              </span>

              <span className="text-emerald-600 font-semibold">
                {post.engagement}% Engagement
              </span>

            </div>

          </div>

        ))}

      </div>

      {/* No results */}
      {filteredPosts.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Filter className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            No posts found
          </p>
        </div>
      )}

    </div>
  );
}