import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
<<<<<<< HEAD
  Menu, Search, Bell, ChevronDown, Settings, LogOut, User,
  Check, X, Calendar, Megaphone, AlertCircle, Info,
} from 'lucide-react';
import { Avatar } from './ui';
import { currentUser, notifications as allNotifications } from '../data/mockData';
=======
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

import { Avatar } from './ui';

import {
  authService,
  notificationService,
} from '../services/api';

>>>>>>> origin/shravanik-latest-scheduler
import { cn } from '../utils/helpers';

interface NavbarProps {
  onMenuClick: () => void;
}

<<<<<<< HEAD
const notificationIcons = {
  schedule: { icon: Calendar, color: 'bg-blue-50 text-blue-600' },
  alert: { icon: AlertCircle, color: 'bg-red-50 text-red-600' },
  campaign: { icon: Megaphone, color: 'bg-violet-50 text-violet-600' },
  info: { icon: Info, color: 'bg-gray-100 text-gray-600' },
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(allNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-3 flex-1">
=======
interface UserData {
  username: string;
  role: string;
}

type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: NotificationType;
  is_read: boolean;
  related_post_id: number | null;
  related_campaign_id: number | null;
  created_at: string;
}

const notificationIcons = {
  info: {
    icon: Info,
    color: 'bg-gray-100 text-gray-600',
  },
  success: {
    icon: Check,
    color: 'bg-green-50 text-green-600',
  },
  warning: {
    icon: AlertCircle,
    color: 'bg-yellow-50 text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    color: 'bg-red-50 text-red-600',
  },
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

export function Navbar({
  onMenuClick,
}: NavbarProps) {
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [user, setUser] =
    useState<UserData | null>(null);

  const [userLoading, setUserLoading] =
    useState(true);

  const notifRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  /* =====================================================
     LOAD CURRENT USER
  ===================================================== */

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token =
        localStorage.getItem('auth_token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response =
          await authService.getMe();

        setUser({
          username: response.data.username,
          role: response.data.role,
        });
      } catch (error) {
        console.error(
          'Unable to load current user:',
          error
        );

        localStorage.removeItem(
          'auth_token'
        );

        navigate('/login');
      } finally {
        setUserLoading(false);
      }
    };

    loadCurrentUser();
  }, [navigate]);


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  useEffect(() => {
    const loadNotifications =
      async () => {
        const token =
          localStorage.getItem(
            'auth_token'
          );

        if (!token) {
          return;
        }

        try {
          const response =
            await notificationService.getAll();

          setNotifications(
            response.data
          );
        } catch (error) {
          console.error(
            'Unable to load notifications:',
            error
          );
        }
      };

    loadNotifications();
  }, []);


  /* =====================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent
    ) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(
          e.target as Node
        )
      ) {
        setNotifOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          e.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);


  /* =====================================================
     MARK ALL NOTIFICATIONS AS READ
  ===================================================== */

  const markAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

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
    } catch (error) {
      console.error(
        'Unable to mark all notifications as read:',
        error
      );
    }
  };


  /* =====================================================
     MARK ONE NOTIFICATION AS READ
  ===================================================== */

  const markAsRead = async (
    notificationId: number
  ) => {
    try {
      await notificationService.markAsRead(
        notificationId
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );
    } catch (error) {
      console.error(
        'Unable to mark notification as read:',
        error
      );
    }
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      'auth_token'
    );

    setUser(null);

    navigate('/login');
  };


  /* =====================================================
     FORMAT ROLE
  ===================================================== */

  const formatRole = (
    role: string
  ) => {
    return role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const displayName =
    user?.username || 'User';

  const displayRole =
    user?.role
      ? formatRole(user.role)
      : 'Loading...';


  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200">

      <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="flex items-center gap-3 flex-1">

>>>>>>> origin/shravanik-latest-scheduler
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

<<<<<<< HEAD
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
=======

          {/* SEARCH */}

          <div className="relative flex-1 max-w-md hidden sm:block">

            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

>>>>>>> origin/shravanik-latest-scheduler
            <input
              type="text"
              placeholder="Search posts, campaigns, accounts..."
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
<<<<<<< HEAD
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
=======

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="flex items-center gap-2 sm:gap-3">


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div
            className="relative"
            ref={notifRef}
          >

            <button
              onClick={() =>
                setNotifOpen(
                  !notifOpen
                )
              }
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >

              <Bell className="w-5 h-5 text-gray-600" />

              {unreadCount > 0 && (
                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
>>>>>>> origin/shravanik-latest-scheduler
                >
                  {unreadCount}
                </motion.span>
              )}
<<<<<<< HEAD
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notif, idx) => {
                      const config = notificationIcons[notif.type as keyof typeof notificationIcons];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            'flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors',
                            !notif.read && 'bg-indigo-50/40'
                          )}
                        >
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', config.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                        </motion.div>
                      );
                    })}
                  </div>
                  <Link
                    to="/app/notifications"
                    onClick={() => setNotifOpen(false)}
=======

            </button>


            <AnimatePresence>

              {notifOpen && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >

                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">

                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        Notifications
                      </p>

                      <p className="text-xs text-gray-500">
                        {unreadCount} unread
                      </p>

                    </div>

                    <button
                      onClick={
                        markAllRead
                      }
                      disabled={
                        unreadCount === 0
                      }
                      className={cn(
                        'text-xs font-medium flex items-center gap-1',
                        unreadCount > 0
                          ? 'text-indigo-600 hover:text-indigo-700'
                          : 'text-gray-400 cursor-not-allowed'
                      )}
                    >

                      <Check className="w-3.5 h-3.5" />

                      Mark all read

                    </button>

                  </div>


                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length ===
                    0 ? (

                      <div className="px-4 py-8 text-center">

                        <Bell className="w-7 h-7 mx-auto text-gray-300 mb-2" />

                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>

                      </div>

                    ) : (

                      notifications
                        .slice(0, 5)
                        .map(
                          (
                            notification,
                            index
                          ) => {

                            const config =
                              notificationIcons[
                                notification.type
                              ];

                            const Icon =
                              config.icon;

                            return (
                              <motion.div
                                key={
                                  notification.id
                                }
                                initial={{
                                  opacity: 0,
                                  x: -10,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                transition={{
                                  delay:
                                    index *
                                    0.05,
                                }}
                                onClick={() => {

                                  if (
                                    !notification.is_read
                                  ) {
                                    markAsRead(
                                      notification.id
                                    );
                                  }

                                }}
                                className={cn(
                                  'flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors',
                                  !notification.is_read &&
                                    'bg-indigo-50/40'
                                )}
                              >

                                <div
                                  className={cn(
                                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                                    config.color
                                  )}
                                >

                                  <Icon className="w-4 h-4" />

                                </div>


                                <div className="flex-1 min-w-0">

                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {
                                      notification.description
                                    }
                                  </p>

                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {formatNotificationTime(
                                      notification.created_at
                                    )}
                                  </p>

                                </div>


                                {!notification.is_read && (
                                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                                )}

                              </motion.div>
                            );
                          }
                        )

                    )}

                  </div>


                  <Link
                    to="/app/notifications"
                    onClick={() =>
                      setNotifOpen(
                        false
                      )
                    }
>>>>>>> origin/shravanik-latest-scheduler
                    className="block py-3 text-center text-sm font-medium text-indigo-600 hover:bg-gray-50 transition-colors"
                  >
                    View all notifications
                  </Link>
<<<<<<< HEAD
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">{currentUser.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold bg-violet-50 text-violet-600 rounded-full">
                      {currentUser.plan} PLAN
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/app/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" /> Profile
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/app/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" /> Settings
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export { X };
=======

                </motion.div>

              )}

            </AnimatePresence>

          </div>


          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          <div
            className="relative"
            ref={profileRef}
          >

            <button
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-100 transition-colors"
            >

              <Avatar
                name={displayName}
                size="sm"
              />

              <div className="hidden md:block text-left">

                <p className="text-sm font-medium text-gray-900 leading-none">
                  {userLoading
                    ? 'Loading...'
                    : displayName}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  {displayRole}
                </p>

              </div>

              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />

            </button>


            <AnimatePresence>

              {profileOpen && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >

                  {/* USER INFO */}

                  <div className="px-4 py-3 border-b border-gray-100">

                    <p className="text-sm font-semibold text-gray-900">
                      {displayName}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      Role: {displayRole}
                    </p>

                  </div>


                  {/* MENU */}

                  <div className="py-1">

                    {/* PROFILE */}

                    <button
                      onClick={() => {
                        setProfileOpen(
                          false
                        );

                        navigate(
                          '/app/profile'
                        );
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >

                      <User className="w-4 h-4 text-gray-400" />

                      Profile

                    </button>


                    {/* SETTINGS */}

                    <button
                      onClick={() => {
                        setProfileOpen(
                          false
                        );

                        navigate(
                          '/app/settings'
                        );
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >

                      <Settings className="w-4 h-4 text-gray-400" />

                      Settings

                    </button>

                  </div>


                  {/* LOGOUT */}

                  <div className="py-1 border-t border-gray-100">

                    <button
                      onClick={
                        handleLogout
                      }
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >

                      <LogOut className="w-4 h-4" />

                      Sign out

                    </button>

                  </div>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </div>

      </div>

    </header>
  );
}
>>>>>>> origin/shravanik-latest-scheduler
