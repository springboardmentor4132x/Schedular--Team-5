import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

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

import {
  notificationService,
  type NotificationResponse,
} from '../services/api';

import { cn } from '../utils/helpers';


/* =========================================================
   TYPES
========================================================= */

type NotificationType =
  | 'schedule'
  | 'published'
  | 'alert'
  | 'campaign'
  | 'info';

type Notification =
  NotificationResponse;

type FilterType =
  | 'all'
  | 'unread'
  | 'schedule'
  | 'published'
  | 'alert'
  | 'campaign'
  | 'info';


/* =========================================================
   NOTIFICATION CONFIG
========================================================= */

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
    color:
      'bg-blue-50 text-blue-600',
    label: 'Schedule',
  },

  published: {
    icon: CheckCircle2,
    color:
      'bg-green-50 text-green-600',
    label: 'Published',
  },

  alert: {
    icon: AlertCircle,
    color:
      'bg-red-50 text-red-600',
    label: 'Alert',
  },

  campaign: {
    icon: Megaphone,
    color:
      'bg-violet-50 text-violet-600',
    label: 'Campaign',
  },

  info: {
    icon: Info,
    color:
      'bg-gray-100 text-gray-600',
    label: 'Info',
  },
};


/* =========================================================
   DETERMINE FRONTEND NOTIFICATION TYPE
========================================================= */

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


  /* -------------------------------------------------------
     PUBLISHED
  ------------------------------------------------------- */

  if (
    title.includes('published') ||
    title.includes('publish successful') ||
    description.includes(
      'published successfully'
    ) ||
    description.includes(
      'was published'
    ) ||
    description.includes(
      'has been published'
    ) ||
    description.includes(
      'post published'
    )
  ) {
    return 'published';
  }


  /* -------------------------------------------------------
     SCHEDULE
  ------------------------------------------------------- */

  if (
    title.includes('scheduled') ||
    title.includes('schedule') ||
    description.includes('scheduled') ||
    description.includes(
      'has been scheduled'
    ) ||
    description.includes(
      'successfully scheduled'
    )
  ) {
    return 'schedule';
  }


  /* -------------------------------------------------------
     CAMPAIGN
  ------------------------------------------------------- */

  if (
    title.includes('campaign') ||
    description.includes('campaign')
  ) {
    return 'campaign';
  }


  /* -------------------------------------------------------
     ALERT
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     DEFAULT
  ------------------------------------------------------- */

  return 'info';
};


/* =========================================================
   DISPLAY TIME
   BACKEND UTC → FRONTEND IST
========================================================= */

const formatNotificationTime = (
  createdAt: string
) => {

  const date = new Date(
    createdAt
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return createdAt;
  }

  return date.toLocaleString(
    'en-IN',
    {
      timeZone:
        'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );
};


/* =========================================================
   MAIN PAGE
========================================================= */

export function NotificationsPage() {

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>(
    []
  );


  const [
    filter,
    setFilter,
  ] = useState<FilterType>(
    'all'
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    markingAllRead,
    setMarkingAllRead,
  ] = useState(false);


  const [
    clearingAll,
    setClearingAll,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null
  );


  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

  const loadNotifications =
    async () => {

      try {

        setLoading(true);
        setError(null);

        const response =
          await notificationService.getAll();

        const data =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setNotifications(
          data
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


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadNotifications();

  }, []);


  /* =======================================================
     UNREAD COUNT
  ======================================================= */

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          notification =>
            !notification.is_read
        ).length,
      [notifications]
    );


  /* =======================================================
     TYPE COUNT
  ======================================================= */

  const getCountByType =
    (
      type: NotificationType
    ) => {

      return notifications.filter(
        notification =>
          getNotificationType(
            notification
          ) === type
      ).length;
    };


  /* =======================================================
     LOCAL DISPLAY FILTER
  ======================================================= */

  const filtered =
    useMemo(() => {

      return notifications.filter(
        notification => {

          if (
            filter === 'all'
          ) {
            return true;
          }


          if (
            filter === 'unread'
          ) {
            return !notification.is_read;
          }


          return (
            getNotificationType(
              notification
            ) === filter
          );

        }
      );

    }, [
      notifications,
      filter,
    ]);


  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const markAsRead =
    async (
      id: number
    ) => {

      try {

        setActionError(null);

        await notificationService.markAsRead(
          id
        );

        setNotifications(
          previous =>
            previous.map(
              notification =>
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
          '>>> MARK READ FAILED:',
          err
        );

        setActionError(
          'Unable to mark notification as read.'
        );

      }
    };


  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const markAllRead =
    async () => {

      if (
        markingAllRead ||
        unreadCount === 0
      ) {
        return;
      }


      try {

        setMarkingAllRead(
          true
        );

        setActionError(null);

        await notificationService.markAllAsRead();

        setNotifications(
          previous =>
            previous.map(
              notification => ({
                ...notification,
                is_read: true,
              })
            )
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

        setMarkingAllRead(
          false
        );

      }
    };


  /* =======================================================
     DELETE ONE NOTIFICATION
  ======================================================= */

  const deleteNotification =
    async (
      id: number
    ) => {

      try {

        setActionError(null);

        await notificationService.delete(
          id
        );

        setNotifications(
          previous =>
            previous.filter(
              notification =>
                notification.id !== id
            )
        );

      } catch (err) {

        console.error(
          '>>> DELETE FAILED:',
          err
        );

        setActionError(
          'Unable to delete notification.'
        );

      }
    };


  /* =======================================================
     CLEAR ALL NOTIFICATIONS
  ======================================================= */

  const clearAll =
    async () => {

      if (
        clearingAll ||
        notifications.length === 0
      ) {
        return;
      }


      try {

        setClearingAll(
          true
        );

        setActionError(null);

        await notificationService.clearAll();

        setNotifications([]);

      } catch (err) {

        console.error(
          '>>> CLEAR ALL FAILED:',
          err
        );

        setActionError(
          'Unable to clear notifications.'
        );

      } finally {

        setClearingAll(
          false
        );

      }
    };


  /* =======================================================
     FILTER TABS
  ======================================================= */

  const filters: {
    key: FilterType;
    label: string;
    count?: number;
  }[] = [

    {
      key: 'all',
      label: 'All',
      count:
        notifications.length,
    },

    {
      key: 'unread',
      label: 'Unread',
      count:
        unreadCount,
    },

    {
      key: 'schedule',
      label: 'Schedule',
      count:
        getCountByType(
          'schedule'
        ),
    },

    {
      key: 'published',
      label: 'Published',
      count:
        getCountByType(
          'published'
        ),
    },

    {
      key: 'alert',
      label: 'Alerts',
      count:
        getCountByType(
          'alert'
        ),
    },

    {
      key: 'campaign',
      label: 'Campaigns',
      count:
        getCountByType(
          'campaign'
        ),
    },

    {
      key: 'info',
      label: 'Info',
      count:
        getCountByType(
          'info'
        ),
    },

  ];


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="space-y-6 max-w-5xl mx-auto">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <Bell className="w-6 h-6 text-indigo-600" />

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>

          </div>

          <p className="text-sm text-gray-500 mt-1">

            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications`
              : "You're all caught up!"}

          </p>

        </div>


        {/* =================================================
            GLOBAL ACTIONS
        ================================================= */}

        <div className="flex gap-2">

          <Button
            variant="secondary"
            size="sm"
            icon={
              <CheckCheck className="w-4 h-4" />
            }
            onClick={
              markAllRead
            }
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
            onClick={
              clearAll
            }
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


      {/* =================================================
          ACTION ERROR
      ================================================= */}

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
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </Card>

      )}


      {/* =================================================
          CATEGORY FILTERS
      ================================================= */}

      <div className="flex flex-wrap gap-2">

        {filters.map(
          filterItem => (

            <button
              key={
                filterItem.key
              }
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

              <span>
                {
                  filterItem.label
                }
              </span>


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
                  {
                    filterItem.count
                  }
                </span>

              )}

            </button>

          )
        )}

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

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

        <Card className="p-0">

          <EmptyState
            icon={
              <Bell className="w-8 h-8" />
            }
            title={
              filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications'
            }
            description={
              filter === 'unread'
                ? 'You have no unread notifications.'
                : 'You have no notifications in this category.'
            }
          />

        </Card>

      ) : (

        <div className="space-y-2">

          <AnimatePresence>

            {filtered.map(
              (
                notification,
                index
              ) => {

                const type =
                  getNotificationType(
                    notification
                  );

                const config =
                  notificationConfig[
                    type
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
                        index * 0.03,
                    }}
                    className={cn(
                      'bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all',

                      !notification.is_read
                        ? 'border-indigo-200 bg-indigo-50/30'
                        : 'border-gray-200'
                    )}
                  >


                    {/* =====================================
                        ICON
                    ===================================== */}

                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.color
                      )}
                    >

                      <Icon className="w-5 h-5" />

                    </div>


                    {/* =====================================
                        CONTENT
                    ===================================== */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <div className="flex-1 min-w-0">


                          {/* TITLE */}

                          <div className="flex items-center gap-2">

                            <p className="text-sm font-semibold text-gray-900">

                              {
                                notification.title
                              }

                            </p>


                            {!notification.is_read && (

                              <span
                                className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"
                                title="Unread"
                              />

                            )}

                          </div>


                          {/* DESCRIPTION */}

                          <p className="text-sm text-gray-600 mt-1">

                            {
                              notification.description
                            }

                          </p>


                          {/* META */}

                          <div className="flex flex-wrap items-center gap-2 mt-2">

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


                            {notification.related_post_id !==
                              null && (

                              <Badge
                                variant="default"
                                className="!py-0.5"
                              >
                                Post #
                                {
                                  notification.related_post_id
                                }
                              </Badge>

                            )}

                          </div>

                        </div>


                        {/* =================================
                            ACTIONS
                        ================================= */}

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
                            title="Delete notification"
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