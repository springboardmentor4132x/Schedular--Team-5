import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  motion,
} from 'framer-motion';

import {
  Bell,
  Search,
  RotateCcw,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Info,
  Check,
  X,
  Eye,
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

type BackendNotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

type HistoryFilter =
  | 'all'
  | 'read'
  | 'unread';

type Notification =
  NotificationResponse;


/* =========================================================
   NOTIFICATION DISPLAY CONFIG
========================================================= */

const getNotificationConfig = (
  notification: Notification
) => {
  const title = String(
    notification.title || ''
  ).toLowerCase();

  const description = String(
    notification.description || ''
  ).toLowerCase();

  const backendType = String(
    notification.type || ''
  ).toLowerCase();

  if (
    title.includes('published') ||
    description.includes('published')
  ) {
    return {
      icon: CheckCircle2,
      color:
        'bg-green-50 text-green-600',
      label: 'Published',
    };
  }

  if (
    title.includes('scheduled') ||
    title.includes('schedule') ||
    description.includes('scheduled')
  ) {
    return {
      icon: Calendar,
      color:
        'bg-blue-50 text-blue-600',
      label: 'Scheduled',
    };
  }

  if (
    title.includes('campaign') ||
    description.includes('campaign')
  ) {
    return {
      icon: Megaphone,
      color:
        'bg-violet-50 text-violet-600',
      label: 'Campaign',
    };
  }

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
    return {
      icon: AlertCircle,
      color:
        'bg-red-50 text-red-600',
      label: 'Alert',
    };
  }

  return {
    icon: Info,
    color:
      'bg-gray-100 text-gray-600',
    label: 'Info',
  };
};


/* =========================================================
   TIME FORMAT
   BACKEND UTC → IST
========================================================= */

const formatHistoryTime = (
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
   IST → UTC
========================================================= */

const convertISTToUTC = (
  value: string,
  isEnd = false
): string | undefined => {

  if (!value) {
    return undefined;
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
    );

  if (!match) {
    return undefined;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const hour =
    Number(match[4]);

  const minute =
    Number(match[5]);

  const utcDate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
        0,
        0
      ) -
        5.5 *
          60 *
          60 *
          1000
    );

  if (isEnd) {
    utcDate.setSeconds(
      59,
      999
    );
  }

  return utcDate.toISOString();
};


/* =========================================================
   MAIN PAGE
========================================================= */

export function NotificationHistoryPage() {

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    dateFrom,
    setDateFrom,
  ] = useState('');

  const [
    dateTo,
    setDateTo,
  ] = useState('');

  const [
    notificationType,
    setNotificationType,
  ] = useState<
    BackendNotificationType | ''
  >('');

  const [
    readFilter,
    setReadFilter,
  ] = useState<HistoryFilter>(
    'all'
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

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
     VIEW DETAILS STATE
  ======================================================= */

  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState<Notification | null>(
    null
  );


  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  const loadHistory =
    async () => {

      try {

        setLoading(true);
        setError(null);

        const response =
          await notificationService.getAll(
            {
              search:
                search.trim() ||
                undefined,

              notification_type:
                notificationType ||
                undefined,

              date_from:
                convertISTToUTC(
                  dateFrom
                ),

              date_to:
                convertISTToUTC(
                  dateTo,
                  true
                ),
            }
          );

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
          '>>> FAILED TO LOAD NOTIFICATION HISTORY:',
          err
        );

        setError(
          'Unable to load notification history.'
        );

      } finally {

        setLoading(false);

      }
    };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadHistory();
  }, []);


  /* =======================================================
     APPLY FILTERS
  ======================================================= */

  const handleApplyFilters =
    async () => {

      await loadHistory();
    };


  /* =======================================================
     RESET
  ======================================================= */

  const handleReset =
    async () => {

      setSearch('');
      setDateFrom('');
      setDateTo('');
      setNotificationType('');
      setReadFilter('all');

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
          '>>> RESET HISTORY FAILED:',
          err
        );

        setError(
          'Unable to reload notification history.'
        );

      } finally {

        setLoading(false);
      }
    };


  /* =======================================================
     READ / UNREAD FILTER
  ======================================================= */

  const filteredNotifications =
    useMemo(() => {

      return notifications.filter(
        notification => {

          if (
            readFilter === 'read'
          ) {
            return notification.is_read;
          }

          if (
            readFilter === 'unread'
          ) {
            return !notification.is_read;
          }

          return true;
        }
      );

    }, [
      notifications,
      readFilter,
    ]);


  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    notifications.length;

  const readCount =
    notifications.filter(
      notification =>
        notification.is_read
    ).length;

  const unreadCount =
    notifications.filter(
      notification =>
        !notification.is_read
    ).length;


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

        /*
         * Also update the notification
         * currently being viewed in the
         * details modal.
         */
        setSelectedNotification(
          previous =>
            previous &&
            previous.id === id
              ? {
                  ...previous,
                  is_read: true,
                }
              : previous
        );

      } catch (err) {

        console.error(
          '>>> HISTORY MARK READ FAILED:',
          err
        );

        setActionError(
          'Unable to mark notification as read.'
        );
      }
    };


  /* =======================================================
     DELETE ONE
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

        /*
         * Close the details modal if
         * the currently viewed notification
         * was deleted.
         */
        setSelectedNotification(
          previous =>
            previous &&
            previous.id === id
              ? null
              : previous
        );

      } catch (err) {

        console.error(
          '>>> HISTORY DELETE FAILED:',
          err
        );

        setActionError(
          'Unable to delete notification.'
        );
      }
    };


  /* =======================================================
     VIEW NOTIFICATION DETAILS
  ======================================================= */

  const handleViewDetails = (
    notification: Notification
  ) => {

    setSelectedNotification(
      notification
    );

  };


  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  const handleCloseDetails = () => {

    setSelectedNotification(
      null
    );

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Notification History
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View and search your complete notification history.
        </p>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        <Card className="p-4">

          <p className="text-xs font-semibold text-gray-500 uppercase">
            Total
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalCount}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Notifications found
          </p>

        </Card>


        <Card className="p-4">

          <p className="text-xs font-semibold text-gray-500 uppercase">
            Unread
          </p>

          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {unreadCount}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Awaiting your attention
          </p>

        </Card>


        <Card className="p-4">

          <p className="text-xs font-semibold text-gray-500 uppercase">
            Read
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {readCount}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Previously viewed
          </p>

        </Card>

      </div>


      {/* =================================================
          SEARCH / FILTERS
      ================================================= */}

      <Card className="p-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* SEARCH */}

          <div>

            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Search
            </label>

            <div className="relative">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
                onKeyDown={event => {

                  if (
                    event.key === 'Enter'
                  ) {
                    handleApplyFilters();
                  }

                }}
                placeholder="Search notification history..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

          </div>


          {/* TYPE */}

          <div>

            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Notification type
            </label>

            <select
              value={
                notificationType
              }
              onChange={event =>
                setNotificationType(
                  event.target.value as
                    | BackendNotificationType
                    | ''
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >

              <option value="">
                All types
              </option>

              <option value="info">
                Info
              </option>

              <option value="success">
                Success
              </option>

              <option value="warning">
                Warning
              </option>

              <option value="error">
                Error
              </option>

            </select>

          </div>


          {/* READ STATUS */}

          <div>

            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Read status
            </label>

            <select
              value={readFilter}
              onChange={event =>
                setReadFilter(
                  event.target.value as HistoryFilter
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >

              <option value="all">
                All notifications
              </option>

              <option value="unread">
                Unread only
              </option>

              <option value="read">
                Read only
              </option>

            </select>

          </div>


          {/* DATE FROM */}

          <div>

            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Date from
            </label>

            <input
              type="datetime-local"
              value={dateFrom}
              onChange={event =>
                setDateFrom(
                  event.target.value
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p className="text-[10px] text-gray-400 mt-1">
              India time (IST)
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">

          {/* DATE TO */}

          <div>

            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Date to
            </label>

            <input
              type="datetime-local"
              value={dateTo}
              onChange={event =>
                setDateTo(
                  event.target.value
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p className="text-[10px] text-gray-400 mt-1">
              India time (IST)
            </p>

          </div>

        </div>


        <div className="flex flex-wrap gap-2 mt-4">

          <Button
            size="sm"
            onClick={
              handleApplyFilters
            }
            disabled={loading}
          >
            <Search className="w-4 h-4 mr-1.5" />
            Search history
          </Button>


          <Button
            variant="secondary"
            size="sm"
            onClick={
              handleReset
            }
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>

        </div>

      </Card>


      {/* =================================================
          ERROR
      ================================================= */}

      {actionError && (

        <Card className="p-4 border-red-200 bg-red-50">

          <div className="flex items-center justify-between">

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


      {/* =================================================
          READ STATUS TABS
      ================================================= */}

      <div className="flex flex-wrap gap-2">

        {[
          {
            key: 'all',
            label: 'All',
            count: totalCount,
          },
          {
            key: 'unread',
            label: 'Unread',
            count: unreadCount,
          },
          {
            key: 'read',
            label: 'Read',
            count: readCount,
          },
        ].map(item => (

          <button
            key={item.key}
            onClick={() =>
              setReadFilter(
                item.key as HistoryFilter
              )
            }
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',

              readFilter === item.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >

            {item.label}

            <span
              className={cn(
                'px-1.5 py-0.5 text-[10px] rounded-md',

                readFilter === item.key
                  ? 'bg-white/20'
                  : 'bg-gray-100'
              )}
            >
              {item.count}
            </span>

          </button>

        ))}

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      {loading ? (

        <Card className="p-8">

          <div className="flex items-center justify-center">

            <p className="text-sm text-gray-500">
              Loading notification history...
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
                loadHistory
              }
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try again
            </button>

          </div>

        </Card>

      ) : filteredNotifications.length === 0 ? (

        <Card className="p-0">

          <EmptyState
            icon={
              <Bell className="w-8 h-8" />
            }
            title="No notification history"
            description={
              search ||
              notificationType ||
              dateFrom ||
              dateTo ||
              readFilter !== 'all'
                ? 'No notifications match the selected filters.'
                : 'Your notification history is empty.'
            }
          />

        </Card>

      ) : (

        <div className="space-y-2">

          {filteredNotifications.map(
            (
              notification,
              index
            ) => {

              const config =
                getNotificationConfig(
                  notification
                );

              const Icon =
                config.icon;

              return (

                <motion.div
                  key={
                    notification.id
                  }
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.02,
                  }}
                  className={cn(
                    'bg-white rounded-2xl border p-4 transition-all',

                    notification.is_read
                      ? 'border-gray-200'
                      : 'border-indigo-200 bg-indigo-50/20'
                  )}
                >

                  <div className="flex items-start gap-4">

                    {/* ICON */}

                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.color
                      )}
                    >

                      <Icon className="w-5 h-5" />

                    </div>


                    {/* CONTENT */}

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                        <div>

                          <div className="flex items-center gap-2">

                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>

                            {!notification.is_read && (

                              <span className="w-2 h-2 rounded-full bg-indigo-500" />

                            )}

                          </div>

                          <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                          </p>

                        </div>


                        {/* ACTION BUTTONS */}

                        <div className="flex items-center gap-1">

                          {/* VIEW DETAILS */}

                          <button
                            onClick={() =>
                              handleViewDetails(
                                notification
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                            title="View details"
                            aria-label="View notification details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>


                          {/* MARK AS READ */}

                          {!notification.is_read && (

                            <button
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                              title="Mark as read"
                              aria-label="Mark notification as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>

                          )}


                          {/* DELETE */}

                          <button
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                            title="Delete"
                            aria-label="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>

                      </div>


                      {/* METADATA */}

                      <div className="flex flex-wrap items-center gap-2 mt-3">

                        <span className="text-xs text-gray-400">
                          {formatHistoryTime(
                            notification.created_at
                          )}
                        </span>

                        <Badge
                          variant="default"
                          className="!py-0.5"
                        >
                          {config.label}
                        </Badge>

                        <Badge
                          variant="default"
                          className="!py-0.5"
                        >
                          {notification.is_read
                            ? 'Read'
                            : 'Unread'}
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

                        {notification.related_campaign_id !==
                          null && (

                          <Badge
                            variant="default"
                            className="!py-0.5"
                          >
                            Campaign #
                            {
                              notification.related_campaign_id
                            }
                          </Badge>

                        )}

                      </div>

                    </div>

                  </div>

                </motion.div>

              );
            }
          )}

        </div>

      )}


      {/* =================================================
          NOTIFICATION DETAILS MODAL
      ================================================= */}

      {selectedNotification && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-details-title"
        >

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close notification details"
            onClick={
              handleCloseDetails
            }
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
          />


          {/* MODAL */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

              <div className="flex items-center gap-3">

                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    getNotificationConfig(
                      selectedNotification
                    ).color
                  )}
                >

                  {(() => {

                    const DetailsIcon =
                      getNotificationConfig(
                        selectedNotification
                      ).icon;

                    return (
                      <DetailsIcon className="w-5 h-5" />
                    );

                  })()}

                </div>

                <div>

                  <h2
                    id="notification-details-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Notification Details
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Complete notification information
                  </p>

                </div>

              </div>


              <button
                onClick={
                  handleCloseDetails
                }
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

            </div>


            {/* MODAL CONTENT */}

            <div className="p-5 space-y-5">

              {/* TITLE */}

              <div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Title
                </p>

                <p className="text-base font-semibold text-gray-900 mt-1">
                  {selectedNotification.title}
                </p>

              </div>


              {/* DESCRIPTION */}

              <div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </p>

                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {selectedNotification.description}
                </p>

              </div>


              {/* DETAILS GRID */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* TYPE */}

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </p>

                  <div className="mt-2">

                    <Badge
                      variant="default"
                      className="!py-0.5"
                    >
                      {String(
                        selectedNotification.type ||
                        'Info'
                      )}
                    </Badge>

                  </div>

                </div>


                {/* CATEGORY */}

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Category
                  </p>

                  <div className="mt-2">

                    <Badge
                      variant="default"
                      className="!py-0.5"
                    >
                      {
                        getNotificationConfig(
                          selectedNotification
                        ).label
                      }
                    </Badge>

                  </div>

                </div>


                {/* STATUS */}

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </p>

                  <div className="mt-2">

                    <Badge
                      variant="default"
                      className="!py-0.5"
                    >
                      {selectedNotification.is_read
                        ? 'Read'
                        : 'Unread'}
                    </Badge>

                  </div>

                </div>


                {/* CREATED AT */}

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Generated
                  </p>

                  <p className="text-sm text-gray-700 mt-2">
                    {formatHistoryTime(
                      selectedNotification.created_at
                    )}
                  </p>

                </div>

              </div>


              {/* RELATED POST */}

              {selectedNotification.related_post_id !==
                null && (

                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">

                  <p className="text-xs font-semibold text-blue-600 uppercase">
                    Related Post
                  </p>

                  <p className="text-sm font-medium text-blue-900 mt-1">
                    Post #
                    {
                      selectedNotification.related_post_id
                    }
                  </p>

                </div>

              )}


              {/* RELATED CAMPAIGN */}

              {selectedNotification.related_campaign_id !==
                null && (

                <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">

                  <p className="text-xs font-semibold text-violet-600 uppercase">
                    Related Campaign
                  </p>

                  <p className="text-sm font-medium text-violet-900 mt-1">
                    Campaign #
                    {
                      selectedNotification.related_campaign_id
                    }
                  </p>

                </div>

              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">

              {!selectedNotification.is_read && (

                <Button
                  size="sm"
                  onClick={() =>
                    markAsRead(
                      selectedNotification.id
                    )
                  }
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Mark as read
                </Button>

              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={
                  handleCloseDetails
                }
              >
                Close
              </Button>

            </div>

          </motion.div>

        </div>

      )}

    </div>
  );
}