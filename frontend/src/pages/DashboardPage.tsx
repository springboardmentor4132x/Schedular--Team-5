import { useState } from "react";
import {
  LayoutDashboard,
  Share2,
  FileText,
  CalendarDays,
  Bell,
  Megaphone,
  BarChart3,
  Search,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const navigate = useNavigate();

  const username = "anika_123";

  const [search, setSearch] = useState("");

  const searchItems = [
    {
      name: "Create Post",
      keywords: "post posts create content",
      path: "/app/create-post",
    },
    {
      name: "Social Accounts",
      keywords: "account accounts social",
      path: "/app/social-accounts",
    },
    {
      name: "Calendar",
      keywords: "calendar scheduled schedule",
      path: "/app/calendar",
    },
    {
      name: "Campaigns",
      keywords: "campaign campaigns",
      path: "/app/campaigns",
    },
    {
      name: "Analytics",
      keywords: "analytics analysis statistics",
      path: "/app/analytics",
    },
    {
      name: "Notifications",
      keywords: "notification notifications bell alerts",
      path: "/app/notifications",
    },
  ];

  const filteredResults =
    search.trim().length > 0
      ? searchItems.filter((item) => {
          const query = search.toLowerCase().trim();

          return (
            item.name.toLowerCase().includes(query) ||
            item.keywords.toLowerCase().includes(query)
          );
        })
      : [];

  const goTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">⚡</div>

          <div>
            <div className="brand-name">SocialPilot</div>
            <div className="brand-subtitle">
              Campaign Manager
            </div>
          </div>
        </div>

        <div className="menu-title">
          MENU
        </div>

        <nav className="sidebar-menu">

          <div className="menu-item active">
            <LayoutDashboard size={21} />
            <span>Dashboard</span>
            <span className="active-dot"></span>
          </div>

          <div
            className="menu-item"
            onClick={() => goTo("/app/social-accounts")}
          >
            <Share2 size={21} />
            <span>Social Accounts</span>
          </div>

          <div
            className="menu-item"
            onClick={() => goTo("/app/create-post")}
          >
            <FileText size={21} />
            <span>Create Post</span>
          </div>

          <div
            className="menu-item"
            onClick={() => goTo("/app/calendar")}
          >
            <CalendarDays size={21} />
            <span>Calendar</span>
          </div>

          <div
            className="menu-item"
            onClick={() => goTo("/app/campaigns")}
          >
            <Megaphone size={21} />
            <span>Campaigns</span>
          </div>

          <div
            className="menu-item"
            onClick={() => goTo("/app/analytics")}
          >
            <BarChart3 size={21} />
            <span>Analytics</span>
          </div>

          <div
            className="menu-item"
            onClick={() => goTo("/app/notifications")}
          >
            <Bell size={21} />
            <span>Notifications</span>
          </div>

        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-box">

            <div className="upgrade-title">
              Upgrade your plan
            </div>

            <div className="upgrade-text">
              Get more features and grow faster.
            </div>

            <button className="upgrade-button">
              Upgrade
            </button>

          </div>
        </div>

      </aside>
      {/* MAIN AREA */}
      <main className="main-area">

        {/* TOP BAR */}
        <header className="top-bar">

          <div className="search-wrapper">

            <div className="search-box">
              <Search size={20} />

              <input
                type="text"
                placeholder="Search posts, campaigns, accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {search.trim() !== "" && (
              <div className="search-results">

                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <button
                      key={item.path}
                      className="search-result-item"
                      onClick={() => {
                        setSearch("");
                        goTo(item.path);
                      }}
                    >
                      <Search size={16} />
                      <span>{item.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="no-search-results">
                    No matching results
                  </div>
                )}

              </div>
            )}

          </div>

          <div className="top-right">

            <button
              className="create-button"
              onClick={() => goTo("/app/create-post")}
            >
              <Plus size={18} />
              Create Post
            </button>

            <button
              className="notification-button"
              onClick={() => goTo("/app/notifications")}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="profile">

              <div className="profile-avatar">
                A
              </div>

              <div className="profile-info">

                <div className="profile-name">
                  {username}
                </div>

                <div className="profile-role">
                  Team Member
                </div>

              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="content-area">

          {/* WELCOME */}
          <section className="welcome-section">

            <div>

              <h1>
                Welcome back, {username} 👋
              </h1>

              <p>
                Create and manage the content assigned to you.
              </p>

            </div>

          </section>

          {/* STATS */}
          <section className="stats-grid">

            {/* DRAFTS */}
            <div className="stat-card">

              <div className="stat-content">

                <div className="stat-label">
                  My Drafts
                </div>

                <div className="stat-number">
                  0
                </div>

                <div className="stat-description">
                  Posts waiting to be published
                </div>

              </div>

              <div className="stat-icon purple">
                <FileText size={22} />
              </div>

            </div>

            {/* SCHEDULED */}
            <div className="stat-card">

              <div className="stat-content">

                <div className="stat-label">
                  Scheduled Posts
                </div>

                <div className="stat-number">
                  0
                </div>

                <div className="stat-description">
                  Posts scheduled for later
                </div>

              </div>

              <div className="stat-icon blue">
                <CalendarDays size={22} />
              </div>

            </div>

            {/* SOCIAL ACCOUNTS */}
            <div className="stat-card">

              <div className="stat-content">

                <div className="stat-label">
                  Social Accounts
                </div>

                <div className="stat-number">
                  0
                </div>

                <div className="stat-description">
                  Connected social accounts
                </div>

              </div>

              <div className="stat-icon green">
                <Share2 size={22} />
              </div>

            </div>

          </section>

          {/* MY CONTENT */}
          <section className="content-card">

            <div className="content-card-header">

              <div>

                <div className="content-title-row">

                  <FileText size={21} />

                  <h2>
                    My Content
                  </h2>

                </div>

                <p>
                  Your assigned and scheduled content will appear here.
                </p>

              </div>

  

            </div>

            <div className="empty-content">

              <div className="empty-icon">
                <FileText size={30} />
              </div>

              <h3>
                No content yet
              </h3>

              <p>
                Create your first post to get started.
              </p>

              <button
                className="empty-button"
                onClick={() => goTo("/app/create-post")}
              >
                <Plus size={18} />
                Create your first post
              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
const dashboardStyles = `
  * {
    box-sizing: border-box;
  }

  .dashboard-page {
    min-height: 100vh;
    display: flex;
    background: #f7f9fc;
    color: #172033;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* SIDEBAR */

  .sidebar {
    width: 250px;
    min-height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e6eaf0;
    padding: 25px 18px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 5px 8px 28px;
  }

  .brand-logo {
    width: 43px;
    height: 43px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: bold;
  }

  .brand-name {
    font-size: 19px;
    font-weight: 750;
    color: #172033;
  }

  .brand-subtitle {
    margin-top: 3px;
    font-size: 11px;
    color: #8a93a3;
  }

  .menu-title {
    padding: 10px 13px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #9aa2b1;
  }

  .sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .menu-item {
    position: relative;
    height: 47px;
    padding: 0 13px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: #697386;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
  }

  .menu-item:hover {
    background: #f5f7fb;
    color: #2563eb;
  }

  .menu-item.active {
    background: #eaf3ff;
    color: #1670df;
    font-weight: 650;
  }

  .active-dot {
    margin-left: auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #1670df;
  }

  .sidebar-bottom {
    margin-top: auto;
  }

  .upgrade-box {
    margin: 20px 4px 5px;
    padding: 15px;
    border-radius: 13px;
    background: #f4f7ff;
    border: 1px solid #e2e9ff;
  }

  .upgrade-title {
    font-size: 13px;
    font-weight: 700;
    color: #29334a;
  }

  .upgrade-text {
    margin-top: 6px;
    font-size: 11px;
    line-height: 1.5;
    color: #7d8799;
  }

  .upgrade-button {
    margin-top: 12px;
    width: 100%;
    border: none;
    border-radius: 8px;
    padding: 9px;
    background: #2563eb;
    color: white;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  /* MAIN */

  .main-area {
    flex: 1;
    min-width: 0;
  }

  .top-bar {
    height: 76px;
    background: #ffffff;
    border-bottom: 1px solid #e6eaf0;
    padding: 0 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  /* SEARCH */

  .search-wrapper {
    position: relative;
    flex:1;
    max-width: 650px;
  }

  .search-box {
    width: 100%;
    height: 42px;
    border: 1px solid #e1e6ee;
    border-radius: 10px;
    background: #f9fafc;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    color: #8c95a5;
  }

  .search-box input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #30394c;
    font-size: 13px;
  }

  .search-box input::placeholder {
    color: #9aa3b2;
  }

  .search-results {
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #ffffff;
    border: 1px solid #e1e6ee;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(23, 32, 51, 0.12);
    overflow: hidden;
  }

  .search-result-item {
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    border: none;
    background: #ffffff;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    color: #344054;
    font-size: 13px;
    cursor: pointer;
  }

  .search-result-item:hover {
    background: #f5f7fb;
    color: #2563eb;
  }

  .no-search-results {
    padding: 14px;
    color: #8b94a3;
    font-size: 13px;
  }

  .top-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .create-button {
    border: none;
    border-radius: 9px;
    background: #2563eb;
    color: white;
    height: 40px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
  }

  .create-button:hover {
    background: #1d4ed8;
  }

  .notification-button {
    position: relative;
    width: 38px;
    height: 38px;
    border: 1px solid #e4e8ef;
    border-radius: 9px;
    background: white;
    color: #667085;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .notification-button:hover {
    background: #f7f9fc;
    color: #2563eb;
  }

  .notification-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
    border: 1px solid white;
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .profile-avatar {
    width: 37px;
    height: 37px;
    border-radius: 50%;
    background: #dbeafe;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }

  .profile-name {
    font-size: 12px;
    font-weight: 700;
    color: #30394c;
  }

  .profile-role {
    margin-top: 2px;
    font-size: 10px;
    color: #98a0af;
  }

  /* CONTENT */

  .content-area {
    padding: 32px;
    max-width: 1500px;
    margin: 0 auto;
  }

  .welcome-section {
    margin-bottom: 27px;
  }

  .welcome-section h1 {
    margin: 0;
    font-size: 29px;
    line-height: 1.2;
    color: #172033;
  }

  .welcome-section p {
    margin: 8px 0 0;
    color: #7b8494;
    font-size: 14px;
  }

  /* STATS */

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }

  .stat-card {
    min-height: 145px;
    background: white;
    border: 1px solid #e6eaf0;
    border-radius: 15px;
    padding: 22px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .stat-label {
    font-size: 13px;
    color: #737d8e;
  }

  .stat-number {
    margin-top: 13px;
    font-size: 30px;
    line-height: 1;
    font-weight: 750;
    color: #172033;
  }

  .stat-description {
    margin-top: 10px;
    color: #a0a7b4;
    font-size: 11px;
  }

  .stat-icon {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.purple {
    background: #f0edff;
    color: #6d4aff;
  }

  .stat-icon.blue {
    background: #eaf5ff;
    color: #2588df;
  }

  .stat-icon.green {
    background: #e9faf1;
    color: #16a765;
  }

  /* CONTENT CARD */

  .content-card {
    background: white;
    border: 1px solid #e6eaf0;
    border-radius: 15px;
    min-height: 390px;
    overflow: hidden;
  }

  .content-card-header {
    padding: 22px 25px;
    border-bottom: 1px solid #edf0f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content-title-row {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #2563eb;
  }

  .content-title-row h2 {
    margin: 0;
    font-size: 17px;
    color: #202a3d;
  }

  .content-card-header p {
    margin: 7px 0 0;
    font-size: 12px;
    color: #8b94a3;
  }

  .content-create-button {
    height: 38px;
    padding: 0 13px;
    border: 1px solid #dfe5ee;
    border-radius: 8px;
    background: white;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .content-create-button:hover {
    background: #f7f9fc;
  }

  .empty-content {
    min-height: 290px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .empty-icon {
    width: 65px;
    height: 65px;
    border-radius: 17px;
    background: #f4f6f9;
    color: #aeb6c3;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-content h3 {
    margin: 15px 0 0;
    font-size: 15px;
    color: #525c6d;
  }

  .empty-content p {
    margin: 6px 0 0;
    color: #9ba3b1;
    font-size: 12px;
  }

  .empty-button {
    margin-top: 18px;
    border: none;
    border-radius: 8px;
    background: #2563eb;
    color: white;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .empty-button:hover {
    background: #1d4ed8;
  }

  /* RESPONSIVE */

  @media (max-width: 1000px) {

    .sidebar {
      width: 215px;
    }

    .content-area {
      padding: 24px;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .stats-grid .stat-card:last-child {
      grid-column: span 2;
    }

    .profile-info {
      display: none;
    }

  }

  @media (max-width: 750px) {

    .sidebar {
      display: none;
    }

    .top-bar {
      padding: 0 15px;
    }

    .search-wrapper {
      width: 100%;
    }

    .create-button {
      display: none;
    }

    .content-area {
      padding: 20px 15px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid .stat-card:last-child {
      grid-column: auto;
    }

    .content-card-header {
      align-items: flex-start;
      gap: 15px;
    }

    .content-create-button {
      display: none;
    }

  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("socialpilot-dashboard-styles")
) {
  const style = document.createElement("style");

  style.id = "socialpilot-dashboard-styles";
  style.innerHTML = dashboardStyles;

  document.head.appendChild(style);
}