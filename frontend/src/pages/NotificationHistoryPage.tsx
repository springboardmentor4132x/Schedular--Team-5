import { useState } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  Calendar,
  BarChart3,
  AlertCircle,
  Info,
  Trash2,
  Search,
} from "lucide-react";

type Status = "scheduled" | "published" | "draft" | "failed";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: "success" | "schedule" | "analytics" | "warning" | "info";
  category: "Publishing" | "Campaigns" | "Account Activity" | "System";
  deliveryMethod: "In-App" | "Email";
  date: string;
  time: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Post Published Successfully",
    message: "Your Instagram post was published successfully.",
    type: "success",
    category: "Publishing",
    deliveryMethod: "In-App",
    date: "Aug 9, 2026",
    time: "10:30 AM",
    read: true,
  },
  {
    id: 2,
    title: "Post Scheduled",
    message: "Your Facebook post has been scheduled successfully.",
    type: "schedule",
    category: "Publishing",
    deliveryMethod: "In-App",
    date: "Aug 9, 2026",
    time: "09:45 AM",
    read: true,
  },
  {
    id: 3,
    title: "Analytics Report Available",
    message: "Your weekly analytics report is ready to view.",
    type: "analytics",
    category: "Campaigns",
    deliveryMethod: "Email",
    date: "Aug 8, 2026",
    time: "06:20 PM",
    read: true,
  },
  {
    id: 4,
    title: "Scheduled Post Failed",
    message: "Your scheduled post could not be published.",
    type: "warning",
    category: "Publishing",
    deliveryMethod: "In-App",
    date: "Aug 8, 2026",
    time: "03:15 PM",
    read: true,
  },
  {
    id: 5,
    title: "Campaign Performance Update",
    message: "Your campaign reached 5,000 impressions this week.",
    type: "info",
    category: "Campaigns",
    deliveryMethod: "Email",
    date: "Aug 7, 2026",
    time: "11:10 AM",
    read: true,
  },
];

export function NotificationHistoryPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");

  const filteredNotifications = notifications.filter((notification) => {
    const searchText =
      `${notification.title} ${notification.message} ${notification.category}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Read" && notification.read) ||
      (statusFilter === "Unread" && !notification.read);

    const matchesCategory =
      categoryFilter === "All" ||
      notification.category === categoryFilter;

    const matchesDelivery =
      deliveryFilter === "All" ||
      notification.deliveryMethod === deliveryFilter;

    let matchesDate = true;

    if (dateFilter !== "All") {
      matchesDate = notification.date === dateFilter;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesDate &&
      matchesDelivery
    );
  });

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearHistory = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;

      case "schedule":
        return <Calendar size={20} />;

      case "analytics":
        return <BarChart3 size={20} />;

      case "warning":
        return <AlertCircle size={20} />;

      default:
        return <Info size={20} />;
    }
  };

  const getIconStyle = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-600";

      case "schedule":
        return "bg-blue-50 text-blue-600";

      case "analytics":
        return "bg-indigo-50 text-indigo-600";

      case "warning":
        return "bg-red-50 text-red-600";

      default:
        return "bg-slate-100 text-slate-600";
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
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
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
              <Bell size={24} />
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
                Notification History
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                View and manage your previous notifications.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            disabled={notifications.length === 0}
            style={{
              border: "none",
              background:
                notifications.length === 0 ? "#cbd5e1" : "#2563eb",
              color: "#ffffff",
              borderRadius: "9px",
              padding: "11px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor:
                notifications.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              boxShadow:
                notifications.length === 0
                  ? "none"
                  : "0 4px 10px rgba(37,99,235,0.15)",
            }}
          >
            <Trash2 size={17} />
            Clear History
          </button>
        </div>

        {/* =========================
            SEARCH + FILTER CARD
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
              placeholder="Search notifications..."
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

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "9px",
            }}
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Status</option>
              <option value="Read">Read</option>
              <option value="Unread">Unread</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Categories</option>
              <option value="Publishing">Publishing</option>
              <option value="Campaigns">Campaigns</option>
              <option value="Account Activity">
                Account Activity
              </option>
              <option value="System">System</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Dates</option>
              <option value="Aug 9, 2026">Aug 9, 2026</option>
              <option value="Aug 8, 2026">Aug 8, 2026</option>
              <option value="Aug 7, 2026">Aug 7, 2026</option>
            </select>

            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Delivery Methods</option>
              <option value="In-App">In-App</option>
              <option value="Email">Email</option>
            </select>
          </div>
        </div>

      {/* =========================
            HISTORY CARD
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
              <Bell size={19} color="#2563eb" />

              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#1e293b",
                }}
              >
                Notification History
              </h2>
            </div>

            <p
              style={{
                margin: "5px 0 0 28px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {filteredNotifications.length} notification
              {filteredNotifications.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "18px 20px",
                    borderBottom:
                      index !== filteredNotifications.length - 1
                        ? "1px solid #edf2f7"
                        : "none",
                    background: notification.read
                      ? "#ffffff"
                      : "#eff6ff",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* ICON */}

                  <div
                    className={getIconStyle(notification.type)}
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
                    {getIcon(notification.type)}
                  </div>

                  {/* CONTENT */}

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: notification.read
                                ? 700
                                : 800,
                              color: "#1e293b",
                            }}
                          >
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#2563eb",
                              }}
                            />
                          )}
                        </div>

                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "13px",
                            lineHeight: 1.5,
                            color: "#64748b",
                          }}
                        >
                          {notification.message}
                        </p>
                      </div>

                      {!notification.read && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 9px",
                            borderRadius: "7px",
                            background: "#dbeafe",
                            color: "#2563eb",
                            fontSize: "10px",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#2563eb",
                            }}
                          />
                          Unread
                        </span>
                      )}
                    </div>

                    {/* METADATA */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "7px",
                        marginTop: "9px",
                        fontSize: "11px",
                        color: "#94a3b8",
                      }}
                    >
                      <span>{notification.date}</span>

                      <span>•</span>

                      <span>{notification.time}</span>

                      <span>•</span>

                      <span
                        style={{
                          color: "#475569",
                          fontWeight: 700,
                        }}
                      >
                        {notification.category}
                      </span>

                      <span>•</span>

                      <span
                        style={{
                          color: "#2563eb",
                          fontWeight: 700,
                        }}
                      >
                        {notification.deliveryMethod}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        marginTop: "11px",
                      }}
                    >
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "#2563eb",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Check size={14} />
                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          color: "#ef4444",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "70px 20px",
              }}
            >
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "18px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <Bell size={32} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#1e293b",
                }}
              >
                No notifications found
              </h3>

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  height: "38px",
  border: "1px solid #dbeafe",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#475569",
  padding: "0 11px",
  fontSize: "12px",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};