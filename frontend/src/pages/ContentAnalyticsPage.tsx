import { useMemo, useState } from "react";

type Tab =
  | "content"
  | "audience"
  | "campaign"
  | "platform"
  | "performance";

type Platform = "Instagram" | "Facebook" | "LinkedIn" | "X / Twitter";

type Post = {
  id: number;
  platform: Platform;
  type: "Image" | "Video" | "Text" | "Article";
  date: string;
  title: string;
  campaign: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  clicks: number;
  engagement: number;
};

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "content", label: "Content", icon: "▣" },
  { id: "audience", label: "Audience", icon: "◉" },
  { id: "campaign", label: "Campaign", icon: "◆" },
  { id: "platform", label: "Platform", icon: "◫" },
  { id: "performance", label: "Performance Trends", icon: "▥" },
];

const posts: Post[] = [
  {
    id: 1,
    platform: "Instagram",
    type: "Image",
    date: "Aug 5, 2026",
    title:
      "We hit 100K followers! Thank you for your incredible support.",
    campaign: "Product Launch Q3",
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
    platform: "Facebook",
    type: "Image",
    date: "Aug 4, 2026",
    title: "Excited to announce our new product launch!",
    campaign: "Brand Awareness",
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
    platform: "X / Twitter",
    type: "Text",
    date: "Aug 3, 2026",
    title:
      "New feature alert: Auto-scheduling is now smarter than ever!",
    campaign: "Product Launch Q3",
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
    platform: "LinkedIn",
    type: "Article",
    date: "Aug 2, 2026",
    title:
      "Customer spotlight: How ClientCo increased engagement by 300%.",
    campaign: "Social Proof",
    likes: 1204,
    comments: 213,
    shares: 298,
    reach: 18400,
    impressions: 31900,
    clicks: 980,
    engagement: 11.4,
  },
  {
    id: 5,
    platform: "Instagram",
    type: "Video",
    date: "Aug 1, 2026",
    title: "Behind the scenes of our latest product campaign.",
    campaign: "Brand Awareness",
    likes: 3980,
    comments: 284,
    shares: 670,
    reach: 42100,
    impressions: 69200,
    clicks: 1860,
    engagement: 10.1,
  },
  {
    id: 6,
    platform: "Facebook",
    type: "Video",
    date: "Jul 30, 2026",
    title: "Meet the team behind our social media campaign.",
    campaign: "Social Proof",
    likes: 1870,
    comments: 143,
    shares: 331,
    reach: 28400,
    impressions: 47100,
    clicks: 930,
    engagement: 7.4,
  },
];

const audienceData = {
  "Last 30 days": [
    10420, 10620, 10810, 10980, 11160, 11320, 11540,
  ],
  "Last 90 days": [
    8420, 8900, 9240, 9670, 10040, 10520, 10880,
  ],
  "Last year": [
    6120, 6880, 7540, 8260, 8920, 9760, 10880,
  ],
};

const performanceData = {
  "Last 30 days": [42, 48, 45, 57, 61, 68, 72, 76],
  "Last 90 days": [31, 38, 42, 47, 52, 58, 64, 71],
  "Last 180 days": [24, 31, 36, 43, 49, 55, 63, 74],
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function platformIcon(platform: Platform) {
  if (platform === "Instagram") return "◎";
  if (platform === "Facebook") return "f";
  if (platform === "LinkedIn") return "in";
  return "X";
}

function platformClass(platform: Platform) {
  if (platform === "Instagram") return "instagram";
  if (platform === "Facebook") return "facebook";
  if (platform === "LinkedIn") return "linkedin";
  return "twitter";
}

function StatCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) {
  return (
    <div className="analytics-stat-card">
      <span className="stat-title">{title}</span>
      <strong>{value}</strong>
      <small>{change}</small>
    </div>
  );
}

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("content");

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] =
    useState("All Platforms");
  const [campaignFilter, setCampaignFilter] =
    useState("All Campaigns");
  const [typeFilter, setTypeFilter] =
    useState("All Content Types");

  const [audiencePeriod, setAudiencePeriod] =
    useState<keyof typeof audienceData>("Last 30 days");

  const [performancePeriod, setPerformancePeriod] =
    useState<keyof typeof performanceData>("Last 30 days");

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.platform.toLowerCase().includes(query) ||
        post.campaign.toLowerCase().includes(query);

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

  const audienceValues = audienceData[audiencePeriod];

  const performanceValues =
    performanceData[performancePeriod];

  return (
    <div className="analytics-page">
      <style>{`
        .analytics-page {
          min-height: 100vh;
          display: flex;
          background: #f5f8ff;
          color: #172033;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .analytics-sidebar {
          width: 250px;
          min-height: 100vh;
          background: linear-gradient(180deg, #0d47b5 0%, #123b91 100%);
          color: white;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .analytics-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 28px;
        }

        .analytics-logo {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,.16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
        }

        .analytics-brand-name {
          font-size: 17px;
          font-weight: 800;
        }

        .analytics-brand-subtitle {
          font-size: 11px;
          opacity: .7;
          margin-top: 2px;
        }

        .analytics-menu-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          opacity: .55;
          padding: 0 12px 10px;
        }

        .analytics-sidebar-items {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .analytics-side-item {
          width: 100%;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.72);
          padding: 12px 13px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          font-size: 13px;
          transition: .2s;
        }

        .analytics-side-item:hover {
          background: rgba(255,255,255,.09);
          color: white;
        }

        .analytics-side-item.active {
          background: white;
          color: #1352c4;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(0,0,0,.12);
        }

        .side-icon {
          width: 20px;
          text-align: center;
          font-size: 16px;
        }

        .analytics-sidebar-bottom {
          margin-top: auto;
        }

        .analytics-upgrade {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          padding: 15px;
        }

        .analytics-upgrade strong {
          font-size: 13px;
        }

        .analytics-upgrade p {
          font-size: 11px;
          line-height: 1.5;
          opacity: .7;
          margin: 6px 0 12px;
        }

        .analytics-upgrade button {
          width: 100%;
          border: 0;
          background: white;
          color: #1251c3;
          border-radius: 8px;
          padding: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .analytics-main {
          flex: 1;
          min-width: 0;
        }

        .analytics-topbar {
          height: 72px;
          background: white;
          border-bottom: 1px solid #e8edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 28px;
        }

        .analytics-search {
          width: min(520px, 55%);
          height: 40px;
          border: 1px solid #e2e8f2;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          background: #fafcff;
        }

        .analytics-search span {
          color: #8b96a8;
          font-size: 19px;
        }

        .analytics-search input {
          border: 0;
          outline: none;
          width: 100%;
          background: transparent;
          color: #263247;
          font-size: 13px;
        }

        .analytics-top-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .analytics-create-button,
        .blue-action {
          border: 0;
          background: #1764df;
          color: white;
          border-radius: 9px;
          padding: 10px 15px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }

        .analytics-notification {
          position: relative;
          border: 0;
          background: #f2f6fc;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          cursor: pointer;
        }

        .analytics-notification span {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          right: 7px;
          top: 7px;
        }

        .analytics-profile {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .analytics-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1764df;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .analytics-profile strong {
          display: block;
          font-size: 12px;
        }

        .analytics-profile small {
          display: block;
          color: #8a94a5;
          font-size: 10px;
          margin-top: 2px;
        }

        .analytics-content {
          padding: 28px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .analytics-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .analytics-heading h1 {
          font-size: 27px;
          margin: 0;
          color: #172033;
        }

        .analytics-heading p {
          margin: 6px 0 0;
          color: #7a8597;
          font-size: 13px;
        }

        .analytics-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          background: white;
          border: 1px solid #e5eaf2;
          padding: 5px;
          border-radius: 11px;
          margin-bottom: 22px;
        }

        .analytics-tab {
          border: 0;
          background: transparent;
          color: #687386;
          padding: 10px 17px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .analytics-tab:hover {
          background: #f1f5fb;
        }

        .analytics-tab.active {
          color: white;
          background: #1764df;
        }

        .analytics-panel,
        .analytics-post-card,
        .analytics-chart-card,
        .analytics-table-card {
          background: white;
          border: 1px solid #e4e9f1;
          border-radius: 14px;
          box-shadow: 0 3px 12px rgba(22, 50, 90, .04);
        }

        .analytics-panel {
          padding: 22px;
        }

        .analytics-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .analytics-panel-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .analytics-panel-header p {
          margin: 5px 0 0;
          color: #7d8797;
          font-size: 12px;
        }

        .analytics-filter-row {
          background: white;
          border: 1px solid #e4e9f1;
          border-radius: 12px;
          padding: 13px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .analytics-filter-row select,
        .period-select {
          border: 1px solid #dfe5ee;
          background: #fbfcfe;
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          color: #465267;
          font-size: 12px;
        }

        .post-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .analytics-post-card {
          padding: 18px;
        }

        .post-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .post-platform {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .platform-icon,
        .large-platform-icon,
        .mini-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
        }

        .platform-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #1764df;
          font-size: 13px;
        }

        .post-platform strong {
          display: block;
          font-size: 12px;
        }

        .post-platform span {
          display: block;
          color: #929bac;
          font-size: 10px;
          margin-top: 2px;
        }

        .post-date {
          color: #919aaa;
          font-size: 10px;
        }

        .post-card-body {
          padding: 18px 0;
        }

        .post-card-body h3 {
          margin: 0 0 8px;
          font-size: 14px;
          line-height: 1.5;
          color: #273246;
        }

        .post-campaign {
          color: #758096;
          font-size: 11px;
          margin: 0;
        }

        .post-card-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid #edf0f5;
        }

        .post-card-stats > div:not(.engagement-badge) {
          text-align: center;
        }

        .post-card-stats strong {
          display: block;
          font-size: 12px;
        }

        .post-card-stats span {
          display: block;
          font-size: 9px;
          color: #9099a9;
          margin-top: 3px;
        }

        .engagement-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ecfdf5;
          color: #059669;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 800;
        }

        .analytics-empty {
          grid-column: 1 / -1;
          background: white;
          border: 1px solid #e4e9f1;
          border-radius: 14px;
          padding: 45px;
          text-align: center;
        }

        .analytics-empty div {
          font-size: 28px;
          color: #9aa4b4;
        }

        .analytics-empty h3 {
          margin: 10px 0 5px;
        }

        .analytics-empty p {
          margin: 0;
          color: #8a94a5;
          font-size: 12px;
        }

        .analytics-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .analytics-stat-card {
          background: white;
          border: 1px solid #e4e9f1;
          border-radius: 13px;
          padding: 18px;
        }

        .stat-title {
          color: #7d8797;
          font-size: 11px;
          display: block;
          margin-bottom: 9px;
        }

        .analytics-stat-card strong {
          font-size: 23px;
          display: block;
        }

        .analytics-stat-card small {
          color: #10a36b;
          font-size: 10px;
          margin-top: 6px;
          display: block;
        }

        .analytics-chart-card {
          padding: 20px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 15px;
        }

        .chart-header p {
          margin: 4px 0 0;
          color: #8a94a5;
          font-size: 11px;
        }

        .growth-chart {
          height: 290px;
          margin-top: 22px;
          position: relative;
          padding: 15px 5px 32px;
        }

        .chart-lines {
          position: absolute;
          inset: 0 0 30px 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chart-lines span {
          border-top: 1px dashed #e3e8ef;
          width: 100%;
        }

        .growth-bars {
          height: 100%;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          align-items: end;
          gap: 20px;
          position: relative;
        }

        .growth-bars > div {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: end;
          align-items: center;
          gap: 8px;
        }

        .growth-bars i {
          display: block;
          width: 52%;
          min-height: 20px;
          background: linear-gradient(180deg, #3d8cff, #1764df);
          border-radius: 7px 7px 3px 3px;
        }

        .growth-bars small {
          color: #8b95a6;
          font-size: 10px;
        }

        .campaign-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .campaign-card {
          border: 1px solid #e4e9f1;
          border-radius: 13px;
          padding: 19px;
        }

        .campaign-top {
          display: flex;
          justify-content: space-between;
        }

        .campaign-label {
          color: #0c9a67;
          background: #eafaf3;
          border-radius: 20px;
          padding: 4px 8px;
          font-size: 9px;
          font-weight: 800;
        }

        .campaign-menu {
          color: #8c96a6;
        }

        .campaign-card h3 {
          margin: 17px 0 5px;
          font-size: 15px;
        }

        .campaign-card p {
          margin: 0 0 18px;
          color: #8993a3;
          font-size: 11px;
        }

        .campaign-progress {
          height: 8px;
          background: #edf1f6;
          border-radius: 10px;
          overflow: hidden;
        }

        .campaign-progress div {
          height: 100%;
          background: #1764df;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.campaign-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  color: #6b7280;
  font-size: 12px;
}

.campaign-footer strong {
  color: #111827;
  font-size: 12px;
}

/* PLATFORM */

.platform-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.platform-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  transition: 0.2s ease;
}

.platform-card:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.large-platform-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
}

.instagram-bg {
  background: #fce7f3;
  color: #db2777;
}

.facebook-bg {
  background: #dbeafe;
  color: #2563eb;
}

.linkedin-bg {
  background: #e0f2fe;
  color: #0284c7;
}

.twitter-bg {
  background: #f3f4f6;
  color: #111827;
}

.platform-card h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.platform-card p {
  margin: 5px 0 16px;
  color: #6b7280;
  font-size: 12px;
}

.platform-number {
  color: #111827;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 2px;
}

.platform-card > span {
  color: #6b7280;
  font-size: 12px;
}

.platform-meter {
  width: 100%;
  height: 7px;
  margin-top: 14px;
  background: #eef2f7;
  border-radius: 10px;
  overflow: hidden;
}

.platform-meter div {
  height: 100%;
  background: #1764df;
  border-radius: 10px;
}

/* TABLE */

.analytics-table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  margin-top: 20px;
  overflow: hidden;
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid #eef0f3;
}

.table-header h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.table-header p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 12px;
}

.analytics-table {
  width: 100%;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f5;
  color: #374151;
  font-size: 13px;
}

.table-row:last-child {
  border-bottom: none;
}

.table-heading {
  background: #f9fafb;
  color: #6b7280;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.table-platform {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 600;
}

.mini-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* PERFORMANCE */

.performance-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.performance-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
}

.performance-card span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 8px;
}

.performance-card strong {
  display: block;
  color: #111827;
  font-size: 25px;
}

.performance-card small {
  display: block;
  margin-top: 6px;
  color: #16a34a;
  font-size: 12px;
}

.performance-chart {
  margin-top: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
}

.performance-chart h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
}

.performance-chart p {
  margin: 5px 0 20px;
  color: #6b7280;
  font-size: 12px;
}

.performance-bars {
  height: 220px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.performance-bars div {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.performance-bars i {
  width: 100%;
  max-width: 42px;
  display: block;
  background: #1764df;
  border-radius: 7px 7px 0 0;
}

.performance-bars small {
  color: #6b7280;
  font-size: 10px;
}

/* COMMON */

.positive {
  color: #16a34a !important;
  font-weight: 600;
}

.blue-action {
  border: none;
  background: #1764df;
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.blue-action:hover {
  background: #1254bd;
}

.period-select {
  min-width: 140px;
}

select {
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}

button {
  font-family: inherit;
}

button:focus,
select:focus,
input:focus {
  outline: none;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .platform-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .performance-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .analytics-sidebar {
    width: 220px;
  }

  .analytics-main {
    margin-left: 220px;
  }
}

@media (max-width: 800px) {
  .analytics-sidebar {
    display: none;
  }

  .analytics-main {
    margin-left: 0;
    width: 100%;
  }

  .analytics-topbar {
    padding: 12px 16px;
  }

  .analytics-content {
    padding: 20px 16px;
  }

  .analytics-top-actions {
    gap: 8px;
  }

  .analytics-profile {
    display: none;
  }

  .analytics-create-button {
    padding: 8px 10px;
    font-size: 12px;
  }

  .analytics-tabs {
    overflow-x: auto;
  }

  .analytics-tab {
    white-space: nowrap;
  }

  .platform-grid,
  .performance-grid {
    grid-template-columns: 1fr;
  }

  .analytics-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-row {
    grid-template-columns: 1.5fr 1fr 1fr;
  }

  .table-row span:nth-child(4),
  .table-row span:nth-child(5) {
    display: none;
  }
}

@media (max-width: 520px) {
  .analytics-stat-grid {
    grid-template-columns: 1fr;
  }

  .analytics-heading h1 {
    font-size: 24px;
  }

  .analytics-filter-row {
    flex-direction: column;
  }

  .analytics-filter-row select {
    width: 100%;
  }

  .post-card-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .campaign-grid {
    grid-template-columns: 1fr;
  }
}
