<<<<<<< HEAD
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
=======
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
>>>>>>> origin/shravanik-latest-scheduler
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
<<<<<<< HEAD
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
=======
  CheckCircle2,
} from 'lucide-react';

import {
  Card,
  Badge,
  Button,
  EmptyState,
} from '../components/ui';

import { notificationService } from '../services/api';
import { cn } from '../utils/helpers';

type NotificationType =
  | 'schedule'
  | 'published'
  | 'alert'
  | 'campaign'
  | 'info';

type BackendNotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

type BackendNotification = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: BackendNotificationType | string;
  is_read: boolean;
  related_post_id: number | null;
  related_campaign_id: number | null;
  created_at: string;
};

type Notification = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: BackendNotificationType | string;
  is_read: boolean;
  related_post_id: number | null;
  related_campaign_id: number | null;
  created_at: string;
};

type FilterType =
  | 'all'
  | 'unread'
  | 'schedule'
  | 'published'
  | 'alert'
  | 'campaign'
  | 'info';

const notificationConfig: Record<
  NotificationType,
  {
    icon: typeof Calendar;
    color: string;
    label: string;
  }
> = {
  schedule: {
    icon: Calendar,
    color: 'bg-blue-50 text-blue-600',
    label: 'Schedule',
  },

  published: {
    icon: CheckCircle2,
    color: 'bg-green-50 text-green-600',
    label: 'Published',
  },

  alert: {
    icon: AlertCircle,
    color: 'bg-red-50 text-red-600',
    label: 'Alert',
  },

  campaign: {
    icon: Megaphone,
    color: 'bg-violet-50 text-violet-600',
    label: 'Campaign',
  },

  info: {
    icon: Info,
    color: 'bg-gray-100 text-gray-600',
    label: 'Info',
  },
};

const getNotificationType = (
  notification: Notification
): NotificationType => {
  const title = String(
    notification.title || ''
  )
    .toLowerCase()
    .trim();

  const description = String(
    notification.description || ''
  )
    .toLowerCase()
    .trim();

  const backendType = String(
    notification.type || ''
  )
    .toLowerCase()
    .trim();

  /*
   * ---------------------------------------------------------
   * 1. PUBLISHED
   * ---------------------------------------------------------
   */

  if (
    title.includes('published') ||
    title.includes('publish successful') ||
    description.includes('published successfully') ||
    description.includes('was published') ||
    description.includes('has been published') ||
    description.includes('post published')
  ) {
    return 'published';
  }

  /*
   * ---------------------------------------------------------
   * 2. SCHEDULED
   * ---------------------------------------------------------
   */

  if (
    title.includes('scheduled') ||
    title.includes('schedule') ||
    description.includes('scheduled') ||
    description.includes('has been scheduled') ||
    description.includes('successfully scheduled')
  ) {
    return 'schedule';
  }

  /*
   * ---------------------------------------------------------
   * 3. CAMPAIGN
   * ---------------------------------------------------------
   */

  if (
    title.includes('campaign') ||
    description.includes('campaign')
  ) {
    return 'campaign';
  }

  /*
   * ---------------------------------------------------------
   * 4. ALERT
   * ---------------------------------------------------------
   */

  if (
    backendType === 'warning' ||
    backendType === 'error' ||
    title.includes('failed') ||
    title.includes('failure') ||
    title.includes('error') ||
    title.includes('warning') ||
    title.includes('rejected') ||
    title.includes('cancelled') ||
    title.includes('canceled') ||
    description.includes('failed') ||
    description.includes('failure') ||
    description.includes('error') ||
    description.includes('warning') ||
    description.includes('rejected') ||
    description.includes('cancelled') ||
    description.includes('canceled')
  ) {
    return 'alert';
  }

  /*
   * ---------------------------------------------------------
   * 5. DEFAULT
   * ---------------------------------------------------------
   */

  return 'info';
};

const formatNotificationTime = (
  createdAt: string
) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const normalizeNotification = (
  notification: BackendNotification
): Notification => {
  return {
    id: Number(notification.id),
    user_id: Number(notification.user_id),
    title: notification.title || 'Notification',
    description:
      notification.description || '',
    type: notification.type || 'info',
    is_read: Boolean(
      notification.is_read
    ),
    related_post_id:
      notification.related_post_id ?? null,
    related_campaign_id:
      notification.related_campaign_id ?? null,
    created_at:
      notification.created_at ||
      new Date().toISOString(),
  };
};

export function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [filter, setFilter] =
    useState<FilterType>('all');

  const [loading, setLoading] =
    useState(true);

  const [markingAllRead, setMarkingAllRead] =
    useState(false);

  const [clearingAll, setClearingAll] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  /*
   * =========================================================
   * LOAD NOTIFICATIONS
   * =========================================================
   */

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        '================================================='
      );

      console.log(
        '>>> LOADING NOTIFICATIONS'
      );

      const response =
        await notificationService.getAll();

      console.log(
        '>>> NOTIFICATIONS API RESPONSE:',
        response.data
      );

      const rawData = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      const normalizedData =
        rawData.map(
          (notification) =>
            normalizeNotification(
              notification
            )
        );

      console.log(
        '>>> NORMALIZED NOTIFICATIONS:',
        normalizedData
      );

      console.log(
        '>>> NORMALIZED NOTIFICATIONS LENGTH:',
        normalizedData.length
      );

      setNotifications(
        normalizedData
      );

      console.log(
        '================================================='
      );
    } catch (err) {
      console.error(
        '>>> FAILED TO LOAD NOTIFICATIONS:',
        err
      );

      setError(
        'Unable to load notifications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  /*
   * =========================================================
   * UNREAD COUNT
   * =========================================================
   */

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.is_read
      ).length,
    [notifications]
  );

  /*
   * =========================================================
   * TYPE COUNTS
   * =========================================================
   */

  const getCountByType = (
    type: NotificationType
  ) => {
    return notifications.filter(
      (notification) =>
        getNotificationType(
          notification
        ) === type
    ).length;
  };

  /*
   * =========================================================
   * FILTERED NOTIFICATIONS
   * =========================================================
   */

  const filtered = useMemo(() => {
    return notifications.filter(
      (notification) => {
        const notificationType =
          getNotificationType(
            notification
          );

        if (filter === 'all') {
          return true;
        }

        if (filter === 'unread') {
          return !notification.is_read;
        }

        return (
          notificationType === filter
        );
      }
    );
  }, [notifications, filter]);

  /*
   * =========================================================
   * DEBUG INFORMATION
   * =========================================================
   */

  useEffect(() => {
    console.log(
      '>>> NOTIFICATIONS STATE:',
      notifications
    );

    console.log(
      '>>> NOTIFICATIONS STATE LENGTH:',
      notifications.length
    );

    console.log(
      '>>> CURRENT FILTER:',
      filter
    );

    console.log(
      '>>> FILTERED NOTIFICATIONS:',
      filtered
    );

    console.log(
      '>>> FILTERED LENGTH:',
      filtered.length
    );

    console.log(
      '>>> UNREAD COUNT:',
      unreadCount
    );

    console.log(
      '>>> NOTIFICATION TYPE COUNTS:',
      {
        all: notifications.length,
        unread: unreadCount,
        schedule:
          getCountByType('schedule'),
        published:
          getCountByType('published'),
        alert:
          getCountByType('alert'),
        campaign:
          getCountByType('campaign'),
        info:
          getCountByType('info'),
      }
    );

    filtered.forEach(
      (notification) => {
        console.log(
          '>>> NOTIFICATION DEBUG:',
          {
            id: notification.id,
            title: notification.title,
            description:
              notification.description,
            backendType:
              notification.type,
            frontendType:
              getNotificationType(
                notification
              ),
            isRead:
              notification.is_read,
            relatedPostId:
              notification.related_post_id,
            relatedCampaignId:
              notification.related_campaign_id,
          }
        );
      }
    );
  }, [
    notifications,
    filtered,
    filter,
    unreadCount,
  ]);

  /*
   * =========================================================
   * MARK ONE AS READ
   * =========================================================
   */

  const markAsRead = async (
    id: number
  ) => {
    try {
      setActionError(null);

      console.log(
        `>>> MARKING NOTIFICATION ${id} AS READ`
      );

      await notificationService.markAsRead(
        id
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );

      console.log(
        `>>> NOTIFICATION ${id} MARKED AS READ`
      );
    } catch (err) {
      console.error(
        '>>> FAILED TO MARK NOTIFICATION AS READ:',
        err
      );

      setActionError(
        'Unable to mark notification as read.'
      );
    }
  };

  /*
   * =========================================================
   * MARK ALL AS READ
   * =========================================================
   */

  const markAllRead = async () => {
    if (
      markingAllRead ||
      unreadCount === 0
    ) {
      return;
    }

    try {
      setMarkingAllRead(true);
      setActionError(null);

      console.log(
        '================================================='
      );

      console.log(
        '>>> MARK ALL NOTIFICATIONS AS READ'
      );

      console.log(
        '>>> UNREAD COUNT:',
        unreadCount
      );

      console.log(
        '>>> CALLING PATCH /notifications/read-all'
      );

      const response =
        await notificationService.markAllAsRead();

      console.log(
        '>>> MARK ALL READ RESPONSE:',
        response?.data
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

      console.log(
        '>>> ALL NOTIFICATIONS MARKED AS READ'
      );

      console.log(
        '================================================='
      );
    } catch (err) {
      console.error(
        '>>> MARK ALL READ FAILED:',
        err
      );

      setActionError(
        'Unable to mark all notifications as read.'
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  /*
   * =========================================================
   * DELETE ONE NOTIFICATION
   * =========================================================
   */

  const deleteNotification = async (
    id: number
  ) => {
    try {
      setActionError(null);

      console.log(
        `>>> DELETING NOTIFICATION ${id}`
      );

      await notificationService.delete(
        id
      );

      setNotifications(
        (previous) =>
          previous.filter(
            (notification) =>
              notification.id !== id
          )
      );

      console.log(
        `>>> NOTIFICATION ${id} DELETED`
      );
    } catch (err) {
      console.error(
        '>>> FAILED TO DELETE NOTIFICATION:',
        err
      );

      setActionError(
        'Unable to delete notification.'
      );
    }
  };

  /*
   * =========================================================
   * CLEAR ALL
   * =========================================================
   */

  const clearAll = async () => {
    if (
      clearingAll ||
      notifications.length === 0
    ) {
      return;
    }

    try {
      setClearingAll(true);
      setActionError(null);

      console.log(
        '>>> CLEARING ALL NOTIFICATIONS'
      );

      await notificationService.clearAll();

      setNotifications([]);

      console.log(
        '>>> ALL NOTIFICATIONS CLEARED'
      );
    } catch (err) {
      console.error(
        '>>> FAILED TO CLEAR NOTIFICATIONS:',
        err
      );

      setActionError(
        'Unable to clear notifications.'
      );
    } finally {
      setClearingAll(false);
    }
  };

  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */
>>>>>>> origin/shravanik-latest-scheduler

  const filters: {
    key: FilterType;
    label: string;
    count?: number;
  }[] = [
    {
<<<<<<< HEAD
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
=======
      key: 'all',
      label: 'All',
      count: notifications.length,
    },

    {
      key: 'unread',
      label: 'Unread',
      count: unreadCount,
    },

    {
      key: 'schedule',
      label: 'Schedule',
      count: getCountByType(
        'schedule'
      ),
    },

    {
      key: 'published',
      label: 'Published',
      count: getCountByType(
        'published'
      ),
    },

    {
      key: 'alert',
      label: 'Alerts',
      count: getCountByType(
        'alert'
      ),
    },

    {
      key: 'campaign',
      label: 'Campaigns',
      count: getCountByType(
        'campaign'
      ),
    },

    {
      key: 'info',
      label: 'Info',
      count: getCountByType(
        'info'
      ),
    },
  ];

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Notifications
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="flex gap-2">

          <Button
            variant="secondary"
            size="sm"
            icon={
              <CheckCheck className="w-4 h-4" />
            }
            onClick={markAllRead}
            disabled={
              loading ||
              markingAllRead ||
              unreadCount === 0
            }
          >
            {markingAllRead
              ? 'Marking...'
              : 'Mark all read'}
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={
              <Trash2 className="w-4 h-4" />
            }
            onClick={clearAll}
            disabled={
              loading ||
              clearingAll ||
              notifications.length === 0
            }
          >
            {clearingAll
              ? 'Clearing...'
              : 'Clear all'}
          </Button>

        </div>
      </div>

      {/* =====================================================
          ACTION ERROR
      ===================================================== */}

      {actionError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center justify-between gap-3">

            <p className="text-sm text-red-600">
              {actionError}
            </p>

            <button
              onClick={() =>
                setActionError(null)
              }
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </Card>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="flex flex-wrap gap-2">

        {filters.map(
          (filterItem) => (
            <button
              key={filterItem.key}
              onClick={() =>
                setFilter(
                  filterItem.key
                )
              }
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',

                filter ===
                  filterItem.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {filterItem.label}

              {filterItem.count !==
                undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] rounded-md',

                    filter ===
                      filterItem.key
                      ? 'bg-white/20'
                      : 'bg-gray-100'
                  )}
                >
                  {filterItem.count}
                </span>
              )}
            </button>
          )
        )}

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <Card className="p-8">

          <div className="flex items-center justify-center">

            <p className="text-sm text-gray-500">
              Loading notifications...
            </p>

          </div>

        </Card>

      ) : error ? (

        /* =====================================================
           ERROR
        ===================================================== */

        <Card className="p-8">

          <div className="text-center">

            <Bell className="w-8 h-8 mx-auto text-red-400 mb-3" />

            <p className="text-sm font-medium text-gray-900">
              {error}
            </p>

            <button
              onClick={
                loadNotifications
              }
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try again
            </button>

          </div>

        </Card>

      ) : filtered.length === 0 ? (

        /* =====================================================
           EMPTY
        ===================================================== */

        <Card className="p-0">

          <EmptyState
            icon={
              filter === 'published' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : filter === 'schedule' ? (
                <Calendar className="w-8 h-8" />
              ) : filter === 'alert' ? (
                <AlertCircle className="w-8 h-8" />
              ) : filter === 'campaign' ? (
                <Megaphone className="w-8 h-8" />
              ) : (
                <Bell className="w-8 h-8" />
              )
            }

            title="No notifications"

            description={
              filter === 'published'
                ? 'No published post notifications yet.'
                : filter === 'schedule'
                ? 'No scheduled post notifications yet.'
                : filter === 'alert'
                ? 'No alerts or errors.'
                : filter === 'campaign'
                ? 'No campaign notifications yet.'
                : filter === 'unread'
                ? 'You have no unread notifications.'
                : "You'll see updates here when there's new activity."
            }
          />

        </Card>

      ) : (

        /* =====================================================
           NOTIFICATION LIST
        ===================================================== */

        <div className="space-y-2">

          <AnimatePresence>

            {filtered.map(
              (
                notification,
                index
              ) => {

                const notificationType =
                  getNotificationType(
                    notification
                  );

                const config =
                  notificationConfig[
                    notificationType
                  ];

                const Icon =
                  config.icon;

                return (
                  <motion.div
                    key={
                      notification.id
                    }

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
                      x: -100,
                    }}

                    transition={{
                      delay:
                        index * 0.05,
                    }}

                    className={cn(
                      'bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all',

                      !notification.is_read
                        ? 'border-indigo-200 bg-indigo-50/30'
                        : 'border-gray-200'
                    )}
                  >

                    {/* =================================================
                        ICON
                    ================================================= */}

                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2">

                            <p className="text-sm font-semibold text-gray-900">
                              {
                                notification.title
                              }
                            </p>

                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                            )}

                          </div>

                          <p className="text-sm text-gray-600 mt-1">
                            {
                              notification.description
                            }
                          </p>

                          <div className="flex items-center gap-2 mt-2">

                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(
                                notification.created_at
                              )}
                            </span>

                            <Badge
                              variant="default"
                              className="!py-0.5"
                            >
                              {
                                config.label
                              }
                            </Badge>

                          </div>

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="flex items-center gap-1 flex-shrink-0">

                          {!notification.is_read && (
                            <button
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }

                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"

                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }

                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"

                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>

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
  );
>>>>>>> origin/shravanik-latest-scheduler
}