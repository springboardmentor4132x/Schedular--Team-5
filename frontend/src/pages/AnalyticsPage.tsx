import { useMemo, useState } from "react";
import "./AnalyticsPage.css";

type Tab =
  | "content"
  | "audience"
  | "campaign"
  | "platform"
  | "performance";

type Post = {
  platform: string;
  type: string;
  date: string;
  title: string;
  campaign: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
};

type Campaign = {
  name: string;
  description: string;
  status: "ACTIVE" | "COMPLETED";
  progress: number;
  posts: number;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "audience", label: "Audience" },
  { id: "campaign", label: "Campaign" },
  { id: "platform", label: "Platform" },
  { id: "performance", label: "Performance Trends" },
];

const posts: Post[] = [
  {
    platform: "Instagram",
    type: "Image",
    date: "Aug 5, 2026",
    title:
      "We hit 100K followers! Thank you for your incredible support.",
    campaign: "Product Launch Q3",
    likes: 4821,
    comments: 312,
    shares: 186,
    reach: 48200,
  },
  {
    platform: "Facebook",
    type: "Post",
    date: "Aug 4, 2026",
    title: "Our newest product is finally here.",
    campaign: "Product Launch Q3",
    likes: 3642,
    comments: 241,
    shares: 128,
    reach: 36100,
  },
  {
    platform: "LinkedIn",
    type: "Article",
    date: "Aug 2, 2026",
    title: "Behind the scenes of our latest campaign.",
    campaign: "Brand Campaign",
    likes: 2918,
    comments: 184,
    shares: 97,
    reach: 28400,
  },
  {
    platform: "Instagram",
    type: "Video",
    date: "Aug 1, 2026",
    title: "See how our team built the new product.",
    campaign: "Brand Campaign",
    likes: 3250,
    comments: 225,
    shares: 164,
    reach: 42100,
  },
  {
    platform: "Facebook",
    type: "Image",
    date: "Jul 30, 2026",
    title: "Thank you for being part of our community.",
    campaign: "Social Proof",
    likes: 2150,
    comments: 156,
    shares: 92,
    reach: 29800,
  },
  {
    platform: "LinkedIn",
    type: "Post",
    date: "Jul 28, 2026",
    title: "Our team shares three lessons from this quarter.",
    campaign: "Social Proof",
    likes: 1840,
    comments: 143,
    shares: 81,
    reach: 22100,
  },
];

const audienceData = {
  "Last 30 days": {
    followers: "12,840",
    newFollowers: "1,284",
    engagement: "8.42%",
    activeAudience: "7,921",
    change: "+6.7%",
    chart: [35, 48, 42, 61, 57, 75, 89],
    labels: [
      "Week 1",
      "Week 2",
      "Week 3",
      "Week 4",
      "Week 5",
      "Week 6",
      "Week 7",
    ],
  },

  "Last 90 days": {
    followers: "15,420",
    newFollowers: "2,640",
    engagement: "9.18%",
    activeAudience: "9,284",
    change: "+12.4%",
    chart: [42, 51, 48, 65, 58, 74, 92],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
  },

  "Last year": {
    followers: "24,680",
    newFollowers: "8,420",
    engagement: "10.26%",
    activeAudience: "16,540",
    change: "+21.8%",
    chart: [28, 39, 47, 55, 49, 72, 94],
    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"],
  },
};

type AudiencePeriod = keyof typeof audienceData;

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("content");

  const [search, setSearch] = useState("");

  const [platformFilter, setPlatformFilter] =
    useState("All Platforms");

  const [campaignFilter, setCampaignFilter] =
    useState("All Campaigns");

  const [typeFilter, setTypeFilter] =
    useState("All Content Types");

  const [audiencePeriod, setAudiencePeriod] =
    useState<AudiencePeriod>("Last 30 days");

  const [performancePeriod, setPerformancePeriod] =
    useState("Last 30 days");
   const [trendPeriod, setTrendPeriod] =
  useState("Daily");

const trendData: Record<string, number[]> = {
  Daily: [32, 44, 39, 55, 48, 63, 58, 72, 68, 81, 76, 92],
  Weekly: [42, 51, 47, 64, 58, 72, 68, 84, 79, 91, 86, 96],
  Monthly: [35, 48, 52, 61, 57, 70, 76, 82, 78, 88, 91, 97],
  Quarterly: [45, 55, 49, 68, 62, 74, 71, 85, 80, 90, 87, 95],
  Yearly: [30, 42, 50, 58, 54, 69, 73, 81, 77, 89, 93, 98],
}; 
const performanceData: Record<
  string,
  {
    engagement: string;
    engagementGrowth: string;
    reach: string;
    reachGrowth: string;
    impressions: string;
    impressionsGrowth: string;
    followers: string;
    followersGrowth: string;
  }
> = {
  "Last 30 days": {
    engagement: "42,871",
    engagementGrowth: "+14.8%",
    reach: "482.7K",
    reachGrowth: "+18.4%",
    impressions: "721.9K",
    impressionsGrowth: "+21.6%",
    followers: "+18.6K",
    followersGrowth: "+12.8%",
  },

  "Last 90 days": {
    engagement: "118,642",
    engagementGrowth: "+22.6%",
    reach: "1.24M",
    reachGrowth: "+27.8%",
    impressions: "1.86M",
    impressionsGrowth: "+31.4%",
    followers: "+42.8K",
    followersGrowth: "+19.7%",
  },

  "Last year": {
    engagement: "486,215",
    engagementGrowth: "+38.9%",
    reach: "5.82M",
    reachGrowth: "+42.5%",
    impressions: "8.74M",
    impressionsGrowth: "+46.8%",
    followers: "+164.2K",
    followersGrowth: "+28.6%",
  },
};

const currentPerformance = performanceData[performancePeriod];
  /* CAMPAIGN STATE */

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      name: "Product Launch Q3",
      description: "Main product launch campaign",
      status: "ACTIVE",
      progress: 78,
      posts: 24,
    },
    {
      name: "Brand Awareness",
      description: "Increase brand visibility",
      status: "ACTIVE",
      progress: 62,
      posts: 18,
    },
    {
      name: "Social Proof",
      description: "Customer stories and testimonials",
      status: "COMPLETED",
      progress: 100,
      posts: 12,
    },
  ]);

  const [showNewCampaign, setShowNewCampaign] =
    useState(false);

  const [campaignName, setCampaignName] =
    useState("");

  const [campaignDescription, setCampaignDescription] =
    useState("");

  const createCampaign = () => {
    const name = campaignName.trim();
    const description = campaignDescription.trim();

    if (!name || !description) {
      return;
    }

    const newCampaign: Campaign = {
      name,
      description,
      status: "ACTIVE",
      progress: 0,
      posts: 0,
    };

    setCampaigns((previous) => [
      ...previous,
      newCampaign,
    ]);

    setCampaignName("");
    setCampaignDescription("");
    setShowNewCampaign(false);
  };

  const closeCampaignModal = () => {
    setShowNewCampaign(false);
    setCampaignName("");
    setCampaignDescription("");
  };

  /* FILTER POSTS */

  const filteredPosts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return posts.filter((post) => {
      const matchesSearch =
        !searchValue ||
        post.title.toLowerCase().includes(searchValue) ||
        post.platform.toLowerCase().includes(searchValue) ||
        post.campaign.toLowerCase().includes(searchValue);

      const matchesPlatform =
        platformFilter === "All Platforms" ||
        post.platform === platformFilter;

      const matchesCampaign =
        campaignFilter === "All Campaigns" ||
        post.campaign === campaignFilter;

      const matchesType =
        typeFilter === "All Content Types" ||
        post.type === typeFilter;

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesCampaign &&
        matchesType
      );
    });
  }, [
    search,
    platformFilter,
    campaignFilter,
    typeFilter,
  ]);

  const currentAudience = audienceData[audiencePeriod];

  return (
    <div className="analytics-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="analytics-sidebar">

        <div className="analytics-brand">
          <div className="analytics-logo">
            ⚡
          </div>

          <div>
            <div className="analytics-brand-name">
              SocialPilot
            </div>

            <div className="analytics-brand-subtitle">
              Campaign Manager
            </div>
          </div>
        </div>

        <div className="analytics-menu-title">
          ANALYTICS
        </div>

        <div className="analytics-sidebar-items">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? "analytics-side-item active"
                  : "analytics-side-item"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="side-icon">
                {tab.id === "content" && "▣"}
                {tab.id === "audience" && "◉"}
                {tab.id === "campaign" && "◆"}
                {tab.id === "platform" && "◫"}
                {tab.id === "performance" && "▥"}
              </span>

              <span>{tab.label}</span>
            </button>
          ))}

        </div>

        <div className="analytics-sidebar-bottom">

          <div className="analytics-upgrade">
            <strong>
              Upgrade your plan
            </strong>

            <p>
              Get more features and grow faster.
            </p>

            <button type="button">
              Upgrade
            </button>
          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="analytics-main">

        {/* TOP BAR */}

        <header className="analytics-topbar">

          <div className="analytics-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search posts, campaigns, accounts..."
            />
          </div>

          <div className="analytics-top-actions">

            <button
              type="button"
              className="analytics-create-button"
            >
              ＋ Create Post
            </button>

            <button
              type="button"
              className="analytics-notification"
            >
              ♧
              <span />
            </button>

            <div className="analytics-profile">

              <div className="analytics-avatar">
                A
              </div>

              <div>
                <strong>
                  anika_123
                </strong>

                <small>
                  Team Member
                </small>
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="analytics-content">

          <div className="analytics-heading">

            <div>
              <h1>
                Analytics
              </h1>

              <p>
                Track your content, audience,
                campaigns, platforms and
                performance trends.
              </p>
            </div>

          </div>

          {/* TOP TABS */}

          <div className="analytics-tabs">

            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  activeTab === tab.id
                    ? "analytics-tab active"
                    : "analytics-tab"
                }
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                {tab.label}
              </button>
            ))}

          </div>

          {/* ==================================================
              CONTENT ANALYTICS
          ================================================== */}

          {activeTab === "content" && (

            <section>

              <div className="analytics-panel-header">

                <div>
                  <h2>
                    Content Analytics
                  </h2>

                  <p>
                    Analyze the performance
                    of every published post.
                  </p>
                </div>

              </div>

              <div className="analytics-filter-row">

                <select
                  value={platformFilter}
                  onChange={(event) =>
                    setPlatformFilter(
                      event.target.value
                    )
                  }
                >
                  <option>
                    All Platforms
                  </option>

                  <option>
                    Instagram
                  </option>

                  <option>
                    Facebook
                  </option>

                  <option>
                    LinkedIn
                  </option>
                </select>

                <select
                  value={campaignFilter}
                  onChange={(event) =>
                    setCampaignFilter(
                      event.target.value
                    )
                  }
                >
                  <option>
                    All Campaigns
                  </option>

                  {campaigns.map((campaign) => (
                    <option
                      key={campaign.name}
                      value={campaign.name}
                    >
                      {campaign.name}
                    </option>
                  ))}

                  <option>
                    Brand Campaign
                  </option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value
                    )
                  }
                >
                  <option>
                    All Content Types
                  </option>

                  <option>
                    Image
                  </option>

                  <option>
                    Video
                  </option>

                  <option>
                    Post
                  </option>

                  <option>
                    Article
                  </option>
                </select>

              </div>

              <div className="post-list">

                {filteredPosts.map(
                  (post, index) => (

                    <div
                      className="analytics-post-card"
                      key={`${post.platform}-${index}`}
                    >

                      <div className="post-card-top">

                        <div className="post-platform">

                          <div className="platform-icon">
                            {post.platform ===
                            "Instagram"
                              ? "◎"
                              : post.platform ===
                                "Facebook"
                              ? "f"
                              : "in"}
                          </div>

                          <div>
                            <strong>
                              {post.platform}
                            </strong>

                            <span>
                              {post.type}
                            </span>
                          </div>

                        </div>

                        <span className="post-date">
                          {post.date}
                        </span>

                      </div>

                      <div className="post-card-body">

                        <h3>
                          {post.title}
                        </h3>

                        <p className="post-campaign">
                          Campaign:{" "}
                          {post.campaign}
                        </p>

                      </div>

                      <div className="post-card-stats">

                        <div>
                          <strong>
                            ♡{" "}
                            {post.likes.toLocaleString()}
                          </strong>
                          <span>
                            Likes
                          </span>
                        </div>

                        <div>
                          <strong>
                            ◯{" "}
                            {post.comments.toLocaleString()}
                          </strong>
                          <span>
                            Comments
                          </span>
                        </div>

                        <div>
                          <strong>
                            ⌯{" "}
                            {post.shares.toLocaleString()}
                          </strong>
                          <span>
                            Shares
                          </span>
                        </div>

                        <div>
                          <strong>
                            {post.reach.toLocaleString()}
                          </strong>
                          <span>
                            Reach
                          </span>
                        </div>

                      </div>

                    </div>

                  )
                )}

                {filteredPosts.length === 0 && (

                  <div className="analytics-empty">

                    <div>
                      ▣
                    </div>

                    <h3>
                      No posts found
                    </h3>

                    <p>
                      Try changing your filters.
                    </p>

                  </div>

                )}

              </div>

            </section>

          )}

          {/* ==================================================
              AUDIENCE
          ================================================== */}

          {activeTab === "audience" && (

            <section className="analytics-panel">

              <div className="analytics-panel-header">

                <div>
                  <h2>
                    Audience Analytics
                  </h2>

                  <p>
                    Understand your audience
                    and how it grows.
                  </p>
                </div>

                <select
                  className="period-select"
                  value={audiencePeriod}
                  onChange={(event) =>
                    setAudiencePeriod(
                      event.target.value as AudiencePeriod
                    )
                  }
                >
                  <option>
                    Last 30 days
                  </option>

                  <option>
                    Last 90 days
                  </option>

                  <option>
                    Last year
                  </option>
                </select>

              </div>

              <div className="analytics-stat-grid">

                <div className="analytics-stat-card">
                  <span>
                    Total Followers
                  </span>

                  <strong>
                    {currentAudience.followers}
                  </strong>

                  <small className="positive">
                    {currentAudience.change}
                    {" "}from last period
                  </small>
                </div>

                <div className="analytics-stat-card">
                  <span>
                    New Followers
                  </span>

                  <strong>
                    {currentAudience.newFollowers}
                  </strong>

                  <small className="positive">
                    +12.4% from last period
                  </small>
                </div>

                <div className="analytics-stat-card">
                  <span>
                    Engagement Rate
                  </span>

                  <strong>
                    {currentAudience.engagement}
                  </strong>

                  <small className="positive">
                    +2.1% from last period
                  </small>
                </div>

                <div className="analytics-stat-card">
                  <span>
                    Active Audience
                  </span>

                  <strong>
                    {currentAudience.activeAudience}
                  </strong>

                  <small className="positive">
                    +8.9% from last period
                  </small>
                </div>

              </div>

              <div className="analytics-chart-card">

                <div className="chart-header">

                  <div>
                    <h3>
                      Audience Growth
                    </h3>

                    <p>
                      Follower growth during the
                      selected period.
                    </p>
                  </div>

                </div>

                <div className="growth-chart">

                  <div className="chart-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="growth-bars">

                    {currentAudience.chart.map(
                      (height, index) => (

                        <div key={index} className="growth-bar-item">

          <i
            style={{
              height: `${height}%`,
            }}
          />

          <small>
            {currentAudience.labels[index]}
          </small>

        </div>

      )
    )}

  </div>

</div>

</div>

</section>

)}

{/* CAMPAIGN ANALYTICS */}

{activeTab === "campaign" && (

  <section className="analytics-panel">

    <div className="analytics-panel-header">

      <div>

        <h2>
          Campaign Analytics
        </h2>

        <p>
          Track campaign progress and
          content performance.
        </p>

      </div>

      <button
        className="analytics-create-button"
        onClick={() => {
          setCampaignName("");
          setCampaignDescription("");
          setShowNewCampaign(true);
        }}
      >
        ＋ New Campaign
      </button>

    </div>

    <div className="campaign-list">

      {campaigns.map((campaign, index) => (

        <div
          className="campaign-card"
          key={`${campaign.name}-${index}`}
        >

          <div className="campaign-card-header">

            <div>

              <span
                className={
                  campaign.status === "ACTIVE"
                    ? "campaign-status active"
                    : "campaign-status completed"
                }
              >
                {campaign.status}
              </span>

              <h3>
                {campaign.name}
              </h3>

              <p>
                {campaign.description}
              </p>

            </div>

            <strong>
              {campaign.posts} posts
            </strong>

          </div>

          <div className="campaign-progress">

            <div className="campaign-progress-top">

              <span>
                {campaign.progress}% complete
              </span>

              <strong>
                {campaign.posts} posts
              </strong>

            </div>

            <div className="campaign-progress-track">

              <div
                className="campaign-progress-fill"
                style={{
                  width: `${campaign.progress}%`,
                }}
              />

            </div>

          </div>

          <div className="campaign-footer">

            <span>
              Campaign performance
            </span>

            <strong>
              {campaign.progress}%
            </strong>

          </div>

        </div>

      ))}

    </div>

  </section>

)}

{/* PLATFORM ANALYTICS */}

{activeTab === "platform" && (

  <section className="analytics-panel">

    <div className="analytics-panel-header">

      <div>
        <h2>Platform Comparison</h2>

        <p>
          Compare performance across all connected social platforms.
        </p>
      </div>

    </div>

    <div className="analytics-stat-grid">

      <div className="analytics-stat-card">
        <span>Total Followers</span>
        <strong>186.4K</strong>
        <small className="positive">+12.8%</small>
      </div>

      <div className="analytics-stat-card">
        <span>Total Reach</span>
        <strong>482.7K</strong>
        <small className="positive">+18.4%</small>
      </div>

      <div className="analytics-stat-card">
        <span>Total Impressions</span>
        <strong>721.9K</strong>
        <small className="positive">+21.6%</small>
      </div>

      <div className="analytics-stat-card">
        <span>Total Engagement</span>
        <strong>{currentPerformance.engagement}</strong>
        <small className="positive">+16.2%</small>
      </div>

    </div>

    <div className="platform-comparison-grid">

      {[
        {
          name: "Instagram",
          followers: "72.4K",
          reach: "184.2K",
          impressions: "286.5K",
          engagement: "18.4K",
          likes: "12.8K",
          comments: "2.4K",
          shares: "1.8K",
          clicks: "1.4K",
          growth: "+18.4%",
          icon: "◎",
          className: "instagram-bg",
        },
        {
          name: "Facebook",
          followers: "48.6K",
          reach: "126.8K",
          impressions: "194.2K",
          engagement: "11.6K",
          likes: "7.8K",
          comments: "1.6K",
          shares: "1.1K",
          clicks: "1.1K",
          growth: "+12.8%",
          icon: "f",
          className: "facebook-bg",
        },
        {
          name: "LinkedIn",
          followers: "31.2K",
          reach: "82.4K",
          impressions: "124.8K",
          engagement: "7.2K",
          likes: "4.8K",
          comments: "1.2K",
          shares: "720",
          clicks: "480",
          growth: "+15.2%",
          icon: "in",
          className: "linkedin-bg",
        },
        {
          name: "X (Twitter)",
          followers: "18.7K",
          reach: "42.6K",
          impressions: "68.4K",
          engagement: "3.4K",
          likes: "2.1K",
          comments: "520",
          shares: "410",
          clicks: "370",
          growth: "+9.6%",
          icon: "𝕏",
          className: "twitter-bg",
        },
        {
          name: "YouTube",
          followers: "9.8K",
          reach: "31.4K",
          impressions: "38.2K",
          engagement: "1.8K",
          likes: "1.2K",
          comments: "280",
          shares: "160",
          clicks: "160",
          growth: "+14.1%",
          icon: "▶",
          className: "youtube-bg",
        },
        {
          name: "Pinterest",
          followers: "5.7K",
          reach: "15.3K",
          impressions: "9.8K",
          engagement: "620",
          likes: "420",
          comments: "84",
          shares: "66",
          clicks: "50",
          growth: "+7.8%",
          icon: "P",
          className: "pinterest-bg",
        },
      ].map((platform) => (

        <div
          className="platform-comparison-card"
          key={platform.name}
        >

          <div className="platform-comparison-header">

            <div
              className={`large-platform-icon ${platform.className}`}
            >
              {platform.icon}
            </div>

            <div>
              <h3>{platform.name}</h3>

              <span className="positive">
                {platform.growth} growth
              </span>
            </div>

          </div>

          <div className="platform-metric-grid">

            <div>
              <span>Followers</span>
              <strong>{platform.followers}</strong>
            </div>

            <div>
              <span>Reach</span>
              <strong>{platform.reach}</strong>
            </div>

            <div>
              <span>Impressions</span>
              <strong>{platform.impressions}</strong>
            </div>

            <div>
              <span>Engagement</span>
              <strong>{platform.engagement}</strong>
            </div>

            <div>
              <span>Likes</span>
              <strong>{platform.likes}</strong>
            </div>

            <div>
              <span>Comments</span>
              <strong>{platform.comments}</strong>
            </div>

            <div>
              <span>Shares</span>
              <strong>{platform.shares}</strong>
            </div>

            <div>
              <span>Clicks</span>
              <strong>{platform.clicks}</strong>
            </div>

          </div>

        </div>

      ))}

    </div>

  </section>

)}

{/* PERFORMANCE TRENDS */}

{activeTab === "performance" && (

  <section className="analytics-panel">

    <div className="analytics-panel-header">

      <div>

        <h2>Performance Trends</h2>

        <p>
          Analyze daily, weekly, monthly,
          quarterly and yearly performance.
        </p>

      </div>

      <select
        className="period-select"
        value={performancePeriod}
        onChange={(event) =>
          setPerformancePeriod(event.target.value)
        }
      >

        <option value="Last 30 days">Last 30 days</option>
        <option value="Last 90 days">Last 90 days</option>
        <option value="Last year">Last year</option>

      </select>

    </div>

    <div className="analytics-stat-grid">

      <div className="analytics-stat-card">
        <span>Total Engagement</span>
        <strong>{currentPerformance.engagement}</strong>
        <small className="positive">+14.8%</small>
      </div>

      <div className="analytics-stat-card">
        <span>Total Reach</span>
        <strong>{currentPerformance.reach}</strong>
        <small className="positive">+18.4%</small>
      </div>

      <div className="analytics-stat-card">
        <span>Total Impressions</span>
        <strong>{currentPerformance.impressions}</strong>
    
        <small className="positive">+21.6%</small>
      </div>

      <div className="analytics-stat-card">
        <span>Follower Growth</span>
        <strong>{currentPerformance.followers}</strong>
        <small className="positive">+12.8%</small>
      </div>

    </div>

    <div className="trend-filter-row">

  
      {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map(
  (period) => (
    <button
      key={period}
      type="button"
      className={
        trendPeriod === period
          ? "trend-period active"
          : "trend-period"
      }
      onClick={() => setTrendPeriod(period)}
    >
      {period}
    </button>
  )
)}
</div>


    

    <div className="analytics-chart-card">

      <div className="chart-header">

        <h3>Engagement Trend</h3>

        <p>
          Engagement performance for{" "}
          {performancePeriod.toLowerCase()}.
        </p>

      </div>

      <div className="performance-chart">

  {trendData[trendPeriod].map((height, index) => (

    <div
      className="performance-bar"
      key={`${trendPeriod}-${index}`}
    >
      <i
        style={{
          height: `${height}%`,
        }}
      />

      <small>
        {index + 1}
      </small>

    </div>

  ))}

</div>

    </div>

    <div className="analytics-chart-card performance-metrics-card">

      <div className="chart-header">

        <h3>Performance Metrics</h3>

        <p>
          Reach, impressions, clicks and follower growth.
        </p>

      </div>

      <div className="performance-metric-list">

        <div className="performance-metric-row">
          <span>Reach</span>
          <strong>482.7K</strong>
          <b className="positive">+18.4%</b>
        </div>

        <div className="performance-metric-row">
          <span>Impressions</span>
          <strong>721.9K</strong>
          <b className="positive">+21.6%</b>
        </div>

        <div className="performance-metric-row">
          <span>Clicks</span>
          <strong>18.4K</strong>
          <b className="positive">+11.2%</b>
        </div>

        <div className="performance-metric-row">
          <span>Follower Growth</span>
          <strong>+18.6K</strong>
          <b className="positive">+12.8%</b>
        </div>

      </div>

    </div>

  </section>

)}

{/* NEW CAMPAIGN MODAL */}

{showNewCampaign && (

  <div
    className="campaign-modal-overlay"
    onClick={() => setShowNewCampaign(false)}
  >

    <div
      className="campaign-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="campaign-modal-header">

        <div>

          <h2>
            New Campaign
          </h2>

          <p>
            Create a new campaign to track
            your social performance.
          </p>

        </div>

        <button
          type="button"
          className="campaign-modal-close"
          onClick={() => setShowNewCampaign(false)}
        >
          ×
        </button>

      </div>

      <div className="campaign-form">

        <label>
          Campaign name
        </label>

        <input
          type="text"
          value={campaignName}
          onChange={(event) =>
            setCampaignName(event.target.value)
          }
          placeholder="Enter campaign name"
          autoFocus
        />

        <label>
          Campaign description
        </label>

        <textarea
          value={campaignDescription}
          onChange={(event) =>
            setCampaignDescription(event.target.value)
          }
          placeholder="Enter campaign description"
          rows={5}
        />

      </div>

      <div className="campaign-modal-actions">

        <button
          type="button"
          className="campaign-cancel-button"
          onClick={() => setShowNewCampaign(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="campaign-submit-button"
          disabled={
            !campaignName.trim() ||
            !campaignDescription.trim()
          }
          onClick={createCampaign}
        >
          Create Campaign
        </button>

      </div>

    </div>

  </div>

)}

        </div>

      </main>

    </div>
  );
}