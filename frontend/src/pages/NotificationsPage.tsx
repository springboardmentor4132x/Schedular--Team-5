import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const filters: {
    key: FilterType;
    label: string;
    count?: number;
  }[] = [
    {
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
}