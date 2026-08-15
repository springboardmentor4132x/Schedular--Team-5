import { useState } from "react";
import {
  Users,
  MessageSquare,
  CheckCircle,
  FileText,
  Calendar,
  UserPlus,
  Search,
} from "lucide-react";

type ActivityType =
  | "comment"
  | "approval"
  | "post"
  | "schedule"
  | "member";

type Activity = {
  id: number;
  user: string;
  action: string;
  target: string;
  campaign: string;
  time: string;
  type: ActivityType;
};

const initialActivities: Activity[] = [
  {
    id: 1,
    user: "Alex Johnson",
    action: "commented on",
    target: "Summer Campaign Post",
    campaign: "Summer Sale",
    time: "10 minutes ago",
    type: "comment",
  },
  {
    id: 2,
    user: "Sarah Wilson",
    action: "approved",
    target: "Instagram Campaign",
    campaign: "Product Launch Q3",
    time: "35 minutes ago",
    type: "approval",
  },
  {
    id: 3,
    user: "Mike Brown",
    action: "created",
    target: "New Facebook Post",
    campaign: "Content Marketing",
    time: "1 hour ago",
    type: "post",
  },
  {
    id: 4,
    user: "Emily Davis",
    action: "scheduled",
    target: "Product Launch Post",
    campaign: "Product Launch Q3",
    time: "2 hours ago",
    type: "schedule",
  },
  {
    id: 5,
    user: "John Smith",
    action: "joined the team",
    target: "",
    campaign: "No Campaign",
    time: "3 hours ago",
    type: "member",
  },
];

const filterStyle: React.CSSProperties = {
  height: "40px",
  border: "1px solid #dbeafe",
  borderRadius: "9px",
  background: "#f8fafc",
  padding: "0 12px",
  outline: "none",
  color: "#475569",
  fontSize: "12px",
  cursor: "pointer",
};

export function TeamActivityPage() {
  const [activities] = useState<Activity[]>(initialActivities);

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [activityFilter, setActivityFilter] = useState("All");

  const filteredActivities = activities.filter((activity) => {
    const searchText =
      `${activity.user} ${activity.action} ${activity.target} ${activity.campaign}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesCampaign =
      campaignFilter === "All" ||
      activity.campaign === campaignFilter;

    const matchesUser =
      userFilter === "All" ||
      activity.user === userFilter;

    const matchesActivity =
      activityFilter === "All" ||
      activity.type === activityFilter;

    return (
      matchesSearch &&
      matchesCampaign &&
      matchesUser &&
      matchesActivity
    );
  });

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "comment":
        return <MessageSquare size={20} />;

      case "approval":
        return <CheckCircle size={20} />;

      case "post":
        return <FileText size={20} />;

      case "schedule":
        return <Calendar size={20} />;

      case "member":
        return <UserPlus size={20} />;

      default:
        return <Users size={20} />;
    }
  };

  const getIconStyle = (type: ActivityType) => {
    switch (type) {
      case "comment":
        return "bg-blue-50 text-blue-600";

      case "approval":
        return "bg-green-50 text-green-600";

      case "post":
        return "bg-indigo-50 text-indigo-600";

      case "schedule":
        return "bg-orange-50 text-orange-600";

      case "member":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getActivityLabel = (type: ActivityType) => {
    switch (type) {
      case "comment":
        return "Comment";

      case "approval":
        return "Approval";

      case "post":
        return "Post";

      case "schedule":
        return "Scheduling";

      case "member":
        return "Team Member";

      default:
        return "Activity";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#1e293b",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "#2563eb",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.18)",
            }}
          >
            <Users size={24} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Team Activity
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              View recent activity from your team members.
            </p>
          </div>
        </div>

        {/* =========================
            SEARCH + FILTERS
        ========================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "16px",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          {/* Search */}

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "520px",
              marginBottom: "14px",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />

            <input
              type="text"
              placeholder="Search team activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "42px",
                border: "1px solid #dbeafe",
                borderRadius: "9px",
                background: "#f8fafc",
                padding: "0 14px 0 40px",
                outline: "none",
                color: "#1e293b",
                fontSize: "13px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filters */}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "9px",
            }}
          >
            {/* Campaign */}

            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Campaigns</option>

              <option value="Summer Sale">
                Summer Sale
              </option>

              <option value="Product Launch Q3">
                Product Launch Q3
              </option>

              <option value="Content Marketing">
                Content Marketing
              </option>

              <option value="No Campaign">
                No Campaign
              </option>
            </select>

            {/* Users */}

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Users</option>

              <option value="Alex Johnson">
                Alex Johnson
              </option>

              <option value="Sarah Wilson">
                Sarah Wilson
              </option>

              <option value="Mike Brown">
                Mike Brown
              </option>

              <option value="Emily Davis">
                Emily Davis
              </option>

              <option value="John Smith">
                John Smith
              </option>
            </select>

            {/* Activity Type */}

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Activities</option>

              <option value="comment">
                Comments
              </option>

              <option value="approval">
                Approvals
              </option>

              <option value="post">
                Posts
              </option>

              <option value="schedule">
                Scheduling
              </option>

              <option value="member">
                Team Members
              </option>
            </select>
          </div>
        </div>

        {/* =========================
            ACTIVITY CARD
        ========================= */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          {/* Card Header */}

          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <Users size={19} color="#2563eb" />

              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#1e293b",
                }}
              >
                Recent Team Activity
              </h2>
            </div>

            <p
              style={{
                margin: "5px 0 0 28px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {filteredActivities.length} activit
              {filteredActivities.length === 1
                ? "y"
                : "ies"}{" "}
              found
            </p>
          </div>

          {/* =========================
              ACTIVITY LIST
          ========================= */}

          {filteredActivities.length > 0 ? (
            <div>
              {filteredActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "18px 20px",
                    borderBottom:
                      index !==
                      filteredActivities.length - 1
                        ? "1px solid #edf2f7"
                        : "none",
                    background: "#ffffff",
                    transition:
                      "background 0.2s ease",
                  }}
                >
                  {/* ICON */}

                  <div
                    className={getIconStyle(activity.type)}
                    style={{
                      width: "44px",
                      height: "44px",
                      flexShrink: 0,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getIcon(activity.type)}
                  </div>

                  {/* CONTENT */}

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {/* Main Activity */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#1e293b",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 800,
                            }}
                          >
                            {activity.user}
                          </span>{" "}
                          {activity.action}{" "}
                          {activity.target && (
                            <span
                              style={{
                                fontWeight: 800,
                              }}
                            >
                              {activity.target}
                            </span>
                          )}
                        </h3>

                        {/* Activity Type */}

                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "6px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {getActivityLabel(
                            activity.type
                          )}
                        </span>
                      </div>
                    </div>

                    {/* METADATA */}

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        flexWrap: "wrap",
                        gap: "7px",
                        marginTop: "9px",
                        fontSize: "11px",
                        color: "#94a3b8",
                      }}
                    >
                      <span>
                        {activity.time}
                      </span>

                      <span>•</span>

                      <span>
                        Campaign:{" "}
                        {activity.campaign}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* =========================
               EMPTY STATE
            ========================= */

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Users
                  size={30}
                  color="#94a3b8"
                />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#334155",
                }}
              >
                No activity found
              </h3>

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                Try changing your search or
                filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}