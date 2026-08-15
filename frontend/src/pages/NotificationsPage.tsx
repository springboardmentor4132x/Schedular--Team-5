import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  AlertCircle,
  Megaphone,
  Info,
  X,
  Settings,
  Mail,
  History,
  Users,
} from "lucide-react";

import { notifications as initialNotifications } from "../data/mockData";

type FilterType =
  | "all"
  | "unread"
  | "schedule"
  | "alert"
  | "campaign"
  | "info";

const notificationConfig = {
  schedule: {
    icon: Calendar,
    label: "Schedule",
    color: "#2563eb",
    background: "#eff6ff",
  },
  alert: {
    icon: AlertCircle,
    label: "Alert",
    color: "#dc2626",
    background: "#fef2f2",
  },
  campaign: {
    icon: Megaphone,
    label: "Campaign",
    color: "#7c3aed",
    background: "#f5f3ff",
  },
  info: {
    icon: Info,
    label: "Info",
    color: "#2563eb",
    background: "#eff6ff",
  },
};

const moduleItems = [
  {
    to: "/app/notifications",
    label: "Notifications",
    description: "Manage your notifications",
    icon: Bell,
  },
  {
    to: "/app/notifications/settings",
    label: "Notification Settings",
    description: "Control notification behavior",
    icon: Settings,
  },
  {
    to: "/app/notifications/email-preferences",
    label: "Email Preferences",
    description: "Manage email notifications",
    icon: Mail,
  },
  {
    to: "/app/notifications/history",
    label: "Notification History",
    description: "View previous notifications",
    icon: History,
  },
  {
    to: "/app/notifications/team-activity",
    label: "Team Activity",
    description: "See your team activity",
    icon: Users,
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "unread") {
      return !notification.read;
    }

    return notification.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filters: {
    key: FilterType;
    label: string;
    count?: number;
  }[] = [
    {
      key: "all",
      label: "All",
      count: notifications.length,
    },
    {
      key: "unread",
      label: "Unread",
      count: unreadCount,
    },
    {
      key: "schedule",
      label: "Schedule",
    },
    {
      key: "alert",
      label: "Alerts",
    },
    {
      key: "campaign",
      label: "Campaigns",
    },
    {
      key: "info",
      label: "Info",
    },
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* MODULE LABEL */}
        <div className="module-label">
    
        </div>

        {/* PAGE HEADER */}
        <div className="page-header">
          <div>
            <div className="title-row">
              <div className="title-icon">
                <Bell size={24} />
              </div>

              <div>
                <h1>Notifications</h1>

                <p>
                  Stay updated with notifications, notification settings,
                  email preferences, notification history and team activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE NAVIGATION */}
        <div className="module-navigation">
          {moduleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `module-card ${
                    isActive ? "module-card-active" : ""
                  }`
                }
              >
                <div className="module-card-icon">
                  <Icon size={21} />
                </div>

                <div className="module-card-content">
                  <div className="module-card-title">
                    {item.label}
                  </div>

                  <div className="module-card-description">
                    {item.description}
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="summary-card">
          <div className="summary-header">
            <div>
              <h2>Notification Summary</h2>
              <p>Overview of your current notifications</p>
            </div>

            <div className="summary-bell">
              <Bell size={20} />
            </div>
          </div>

          <div className="summary-grid">

            <div className="summary-item">
              <span>Total</span>
              <strong>{notifications.length}</strong>
            </div>

            <div className="summary-item unread">
              <span>Unread</span>
              <strong>{unreadCount}</strong>
            </div>

            <div className="summary-item read">
              <span>Read</span>
              <strong>
                {notifications.length - unreadCount}
              </strong>
            </div>

            <div className="summary-item">
              <span>Alerts</span>
              <strong>
                {
                  notifications.filter(
                    (notification) => notification.type === "alert"
                  ).length
                }
              </strong>
            </div>

          </div>
        </div>

        {/* NOTIFICATION SECTION */}
        <div className="notifications-card">

          <div className="notifications-header">
            <div>
              <h2>Notifications</h2>

              <p>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notifications`
                  : "You're all caught up!"}
              </p>
            </div>

            <div className="action-buttons">

              <button
                type="button"
                className="secondary-button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck size={16} />
                Mark all read
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 size={16} />
                Clear all
              </button>

            </div>
          </div>

          {/* FILTERS */}
          <div className="filter-row">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`filter-button ${
                  filter === item.key
                    ? "filter-button-active"
                    : ""
                }`}
              >
                {item.label}

                {item.count !== undefined && (
                  <span
                    className={`filter-count ${
                      filter === item.key
                        ? "filter-count-active"
                        : ""
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* LIST */}
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                <Bell size={30} />
              </div>

              <h3>No notifications</h3>

              <p>
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "You'll see updates here when there's new activity."}
              </p>

            </div>
          ) : (
            <div className="notification-list">

              <AnimatePresence>
                {filteredNotifications.map(
                  (notification, index) => {

                    const config =
                      notificationConfig[
                        notification.type as keyof typeof notificationConfig
                      ];

                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: -80,
                        }}
                        transition={{
                          delay: index * 0.04,
                        }}
                        className={`notification-item ${
                          !notification.read
                            ? "notification-unread"
                            : ""
                        }`}
                      >

                        {/* ICON */}
                        <div
                          className="notification-icon"
                          style={{
                            color: config.color,
                            background: config.background,
                          }}
                        >
                          <Icon size={20} />
                        </div>

                        {/* CONTENT */}
                        <div className="notification-content">

                          <div className="notification-title-row">

                            <div className="notification-title-wrapper">

                              <h3>
                                {notification.title}
                              </h3>

                              {!notification.read && (
                                <span className="unread-dot" />
                              )}

                            </div>

                            <div className="notification-actions">

                              {!notification.read && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markAsRead(notification.id)
                                  }
                                  className="icon-button"
                                  title="Mark as read"
                                  aria-label="Mark as read"
                                >
                                  <Check size={17} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteNotification(
                                    notification.id
                                  )
                                }
                                className="icon-button delete-button"
                                title="Delete"
                                aria-label="Delete notification"
                              >
                                <X size={17} />
                              </button>

                            </div>

                          </div>

                          <p className="notification-message">
                            {notification.message}
                          </p>

                          <div className="notification-meta">

                            <span>
                              {notification.time}
                            </span>

                            <span className="type-badge">
                              {config.label}
                            </span>

                          </div>

                        </div>

                      </motion.div>
                    );
                  }
                )}
              </AnimatePresence>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const notificationsStyles = `
  * {
    box-sizing: border-box;
  }

  .notifications-page {
    min-height: 100vh;
    background: #f7f9fc;
    color: #172033;
    font-family: Arial, Helvetica, sans-serif;
    padding: 32px;
  }

  .notifications-container {
    width: 100%;
    max-width: 1450px;
    margin: 0 auto;
  }

  /* MODULE */

  .module-label {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    background: #eaf3ff;
    color: #1670df;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  /* HEADER */

  .page-header {
    margin-bottom: 24px;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .title-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      #2563eb,
      #1670df
    );
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
    flex-shrink: 0;
  }

  .page-header h1 {
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
    font-weight: 750;
    color: #172033;
  }

  .page-header p {
    margin: 7px 0 0;
    font-size: 14px;
    line-height: 1.6;
    color: #7b8494;
  }

  /* MODULE NAV */

  .module-navigation {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background: white;
    border: 1px solid #e1e7ef;
    border-radius: 15px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.03);
  }

  .module-card {
    min-height: 105px;
    padding: 17px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    text-decoration: none;
    color: #667085;
    background: white;
    border-right: 1px solid #e6eaf0;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      transform 0.2s ease;
  }

  .module-card:last-child {
    border-right: none;
  }

  .module-card:hover {
    background: #f7fbff;
    color: #1670df;
  }

  .module-card-active {
    background: #eaf3ff;
    color: #1670df;
    box-shadow: inset 0 -3px 0 #1670df;
  }

  .module-card-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f6ff;
    color: #2563eb;
    margin-bottom: 8px;
  }

  .module-card-active .module-card-icon {
    background: #dbeafe;
    color: #1670df;
  }

  .module-card-title {
    font-size: 12px;
    font-weight: 700;
  }

  .module-card-description {
    margin-top: 4px;
    font-size: 10px;
    color: #8a93a3;
  }

  /* SUMMARY */

  .summary-card {
    background: white;
    border: 1px solid #e1e7ef;
    border-radius: 15px;
    padding: 22px;
    margin-bottom: 24px;
    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.03);
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .summary-header h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 750;
    color: #202a3d;
  }

  .summary-header p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #8b94a3;
  }

  .summary-bell {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1670df;
    background: #eaf3ff;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }

  .summary-item {
    padding: 16px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #edf0f4;
  }

  .summary-item span {
    display: block;
    font-size: 12px;
    color: #7b8494;
  }

  .summary-item strong {
    display: block;
    margin-top: 8px;
    font-size: 26px;
    line-height: 1;
    color: #172033;
  }

  .summary-item.unread strong {
    color: #dc2626;
  }

  .summary-item.read strong {
    color: #16a765;
  }

  /* NOTIFICATIONS CARD */

  .notifications-card {
    background: white;
    border: 1px solid #e1e7ef;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.03);
  }

  .notifications-header {
    padding: 22px 24px;
    border-bottom: 1px solid #edf0f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .notifications-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 750;
    color: #202a3d;
  }

  .notifications-header p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #8b94a3;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .secondary-button,
  .danger-button {
    height: 37px;
    border-radius: 9px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
    transition: 0.2s;
  }

  .secondary-button {
    border: 1px solid #dce3ed;
    background: white;
    color: #344054;
  }

  .secondary-button:hover:not(:disabled) {
    background: #f7f9fc;
    border-color: #cbd5e1;
  }

  .danger-button {
    border: 1px solid #fecaca;
    background: #fff7f7;
    color: #dc2626;
  }

  .danger-button:hover:not(:disabled) {
    background: #fef2f2;
  }

  .secondary-button:disabled,
  .danger-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* FILTERS */

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 17px 24px;
    background: #fbfcfe;
    border-bottom: 1px solid #edf0f4;
  }

  .filter-button {
    height: 34px;
    padding: 0 11px;
    border-radius: 8px;
    border: 1px solid #dfe5ee;
    background: white;
    color: #667085;
    font-size: 11px;
    font-weight: 650;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    transition: 0.2s;
  }

  .filter-button:hover {
    border-color: #93c5fd;
    color: #2563eb;
    background: #f7fbff;
  }

  .filter-button-active {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }

  .filter-count {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #64748b;
    font-size: 9px;
  }

  .filter-count-active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  /* LIST */

  .notification-list {
    padding: 14px 20px 20px;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 17px;
    margin-bottom: 9px;
    border: 1px solid #e4e8ef;
    border-radius: 13px;
    background: white;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;
  }

  .notification-item:hover {
    border-color: #bfdbfe;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.06);
  }

  .notification-unread {
    background: #f5f9ff;
    border-color: #bfdbfe;
  }

  .notification-icon {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .notification-title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .notification-title-wrapper h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #202a3d;
  }

  .unread-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #2563eb;
    flex-shrink: 0;
  }

  .notification-message {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.55;
    color: #667085;
  }

  .notification-meta {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 9px;
    font-size: 10px;
    color: #98a0af;
  }

  .type-badge {
    padding: 3px 7px;
    border-radius: 5px;
    background: #eef4ff;
    color: #2563eb;
    font-weight: 650;
  }

  .notification-actions {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
  }

  .icon-button {
    width: 31px;
    height: 31px;
    border: 1px solid #e1e6ee;
    border-radius: 7px;
    background: white;
    color: #7b8494;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;
  }

  .icon-button:hover {
    background: #f3f7ff;
    color: #2563eb;
    border-color: #bfdbfe;
  }

  .delete-button:hover {
    background: #fff1f2;
    color: #dc2626;
    border-color: #fecaca;
  }

  /* EMPTY */

  .empty-state {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
  }

  .empty-icon {
    width: 65px;
    height: 65px;
    border-radius: 17px;
    background: #eaf3ff;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-state h3 {
    margin: 15px 0 0;
    font-size: 15px;
    color: #525c6d;
  }

  .empty-state p {
    margin: 6px 0 0;
    max-width: 400px;
    color: #9ba3b1;
    font-size: 12px;
  }

  /* RESPONSIVE */

  @media (max-width: 1050px) {

    .module-navigation {
      grid-template-columns: repeat(3, 1fr);
    }

    .module-card:nth-child(3) {
      border-right: none;
    }

    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 750px) {

    .notifications-page {
      padding: 20px 15px;
    }

    .page-header h1 {
      font-size: 25px;
    }

    .page-header p {
      font-size: 12px;
    }

    .module-navigation {
      grid-template-columns: 1fr;
    }

    .module-card {
      min-height: 72px;
      flex-direction: row;
      justify-content: flex-start;
      text-align: left;
      gap: 12px;
      border-right: none;
      border-bottom: 1px solid #e6eaf0;
    }

    .module-card:last-child {
      border-bottom: none;
    }

    .module-card-icon {
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .summary-grid {
      grid-template-columns: 1fr 1fr;
    }

    .notifications-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-buttons {
      width: 100%;
    }

    .secondary-button,
    .danger-button {
      flex: 1;
      justify-content: center;
    }

    .notification-item {
      padding: 13px;
    }

    .notification-title-row {
      flex-direction: column;
    }

    .notification-actions {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .title-row {
      gap: 10px;
    }

    .title-icon {
      width: 43px;
      height: 43px;
    }
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("socialpilot-notifications-styles")
) {
  const style = document.createElement("style");

  style.id = "socialpilot-notifications-styles";
  style.innerHTML = notificationsStyles;

  document.head.appendChild(style);
}