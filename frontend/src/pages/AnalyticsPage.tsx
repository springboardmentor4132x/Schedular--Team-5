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

        <h2>
          Platform Analytics
        </h2>

        <p>
          Compare performance across
          your social platforms.
        </p>

      </div>

    </div>

    <div className="analytics-stat-grid">

      <div className="analytics-stat-card">

        <span>
          Instagram
        </span>

        <strong>
          48.2K
        </strong>

        <small className="positive">
          +18.4% engagement
        </small>

      </div>

      <div className="analytics-stat-card">

        <span>
          Facebook
        </span>

        <strong>
          36.1K
        </strong>

        <small className="positive">
          +12.8% engagement
        </small>

      </div>

      <div className="analytics-stat-card">

        <span>
          LinkedIn
        </span>

        <strong>
          28.4K
        </strong>

        <small className="positive">
          +15.2% engagement
        </small>

      </div>

      <div className="analytics-stat-card">

        <span>
          Total Reach
        </span>

        <strong>
          112.7K
        </strong>

        <small className="positive">
          +16.1% from last period
        </small>

      </div>

    </div>

    <div className="analytics-chart-card">

      <div className="chart-header">

        <div>

          <h3>
            Platform Performance
          </h3>

          <p>
            Average reach generated by each
            social platform.
          </p>

        </div>

      </div>

      <div className="platform-bars">

        <div className="platform-row">

          <span>
            Instagram
          </span>

          <div className="platform-track">

            <i
              style={{
                width: "88%",
              }}
            />

          </div>

          <strong>
            88%
          </strong>

        </div>

        <div className="platform-row">

          <span>
            Facebook
          </span>

          <div className="platform-track">

            <i
              style={{
                width: "72%",
              }}
            />

          </div>

          <strong>
            72%
          </strong>

        </div>

        <div className="platform-row">

          <span>
            LinkedIn
          </span>

          <div className="platform-track">

            <i
              style={{
                width: "64%",
              }}
            />

          </div>

          <strong>
            64%
          </strong>

        </div>

      </div>

    </div>

  </section>

)}

{/* PERFORMANCE TRENDS */}

{activeTab === "performance" && (

  <section className="analytics-panel">

    <div className="analytics-panel-header">

      <div>

        <h2>
          Performance Trends
        </h2>

        <p>
          Monitor how your overall social
          performance changes over time.
        </p>

      </div>

      <select
        className="period-select"
        value={performancePeriod}
        onChange={(event) =>
          setPerformancePeriod(event.target.value)
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
          Total Engagement
        </span>

        <strong>
          18,621
        </strong>

        <small className="positive">
          +14.8% from last period
        </small>

      </div>

      <div className="analytics-stat-card">

        <span>
          Total Reach
        </span>

        <strong>
          112.7K
        </strong>

        <small className="positive">
          +16.1% from last period
        </small>

      </div>

      <div className="analytics-stat-card">

        <span>
          Engagement Rate
        </span>

        <strong>
          8.42%
        </strong>

        <small className="positive">
          +2.1% from last period
        </small>

      </div>

      <div className="analytics-stat-card">

        <span>
          Published Posts
        </span>

        <strong>
          54
        </strong>

        <small className="positive">
          +9.6% from last period
        </small>

      </div>

    </div>

    <div className="analytics-chart-card">

      <div className="chart-header">

        <div>

          <h3>
            Performance Overview
          </h3>

          <p>
            Overall performance during{" "}
            {performancePeriod.toLowerCase()}.
          </p>

        </div>

      </div>

      <div className="trend-chart">

        <div className="trend-line">

          <span style={{ height: "32%" }} />
          <span style={{ height: "45%" }} />
          <span style={{ height: "40%" }} />
          <span style={{ height: "58%" }} />
          <span style={{ height: "52%" }} />
          <span style={{ height: "71%" }} />
          <span style={{ height: "88%" }} />

        </div>

        <div className="trend-labels">

          <small>Week 1</small>
          <small>Week 2</small>
          <small>Week 3</small>
          <small>Week 4</small>
          <small>Week 5</small>
          <small>Week 6</small>
          <small>Week 7</small>

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

                          