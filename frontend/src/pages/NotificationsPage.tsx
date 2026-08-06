import { useEffect, useState } from 'react';
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
  | 'alert'
  | 'campaign'
  | 'info';

type BackendNotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

type Notification = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: NotificationType;
  is_read: boolean;
  related_post_id: number | null;
  related_campaign_id: number | null;
  created_at: string;
};

const notificationConfig = {
  schedule: {
    icon: Calendar,
    color: 'bg-blue-50 text-blue-600',
    label: 'Schedule',
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

type FilterType =
  | 'all'
  | 'unread'
  | 'schedule'
  | 'alert'
  | 'campaign'
  | 'info';

const getNotificationType = (
  type: BackendNotificationType
): NotificationType => {
  switch (type) {
    case 'warning':
    case 'error':
      return 'alert';

    case 'success':
      return 'info';

    case 'info':
    default:
      return 'info';
  }
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

export function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [filter, setFilter] =
    useState<FilterType>('all');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await notificationService.getAll();

      setNotifications(response.data);
    } catch (err) {
      console.error(
        'Failed to load notifications:',
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

  const filtered =
    notifications.filter(
      (notification) => {
        if (filter === 'all') {
          return true;
        }

        if (filter === 'unread') {
          return !notification.is_read;
        }

        return (
          getNotificationType(
            notification.type as BackendNotificationType
          ) === filter
        );
      }
    );

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const markAsRead = async (
    id: number
  ) => {
    try {
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
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      );
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );
    } catch (err) {
      console.error(
        'Failed to mark all notifications as read:',
        err
      );
    }
  };

  const deleteNotification = async (
    id: number
  ) => {
    try {
      await notificationService.delete(id);

      setNotifications(
        (previous) =>
          previous.filter(
            (notification) =>
              notification.id !== id
          )
      );
    } catch (err) {
      console.error(
        'Failed to delete notification:',
        err
      );
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();

      setNotifications([]);
    } catch (err) {
      console.error(
        'Failed to clear notifications:',
        err
      );
    }
  };

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
    },
    {
      key: 'alert',
      label: 'Alerts',
    },
    {
      key: 'campaign',
      label: 'Campaigns',
    },
    {
      key: 'info',
      label: 'Info',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
              unreadCount === 0
            }
          >
            Mark all read
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
              notifications.length === 0
            }
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filterItem) => (
          <button
            key={filterItem.key}
            onClick={() =>
              setFilter(filterItem.key)
            }
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === filterItem.key
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
                  filter === filterItem.key
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                )}
              >
                {filterItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center">
            <Bell className="w-8 h-8 mx-auto text-red-400 mb-3" />

            <p className="text-sm font-medium text-gray-900">
              {error}
            </p>

            <button
              onClick={loadNotifications}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try again
            </button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={
              <Bell className="w-8 h-8" />
            }
            title="No notifications"
            description={
              filter === 'unread'
                ? 'You have no unread notifications.'
                : "You'll see updates here when there's new activity."
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(
              (notification, index) => {
                const notificationType =
                  getNotificationType(
                    notification.type as BackendNotificationType
                  );

                const config =
                  notificationConfig[
                    notificationType
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
                      x: -100,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className={cn(
                      'bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all',
                      !notification.is_read
                        ? 'border-indigo-200 bg-indigo-50/30'
                        : 'border-gray-200'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
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
                              {config.label}
                            </Badge>
                          </div>
                        </div>

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