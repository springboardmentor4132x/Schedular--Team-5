import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Bell, ChevronDown, Settings, LogOut, User,
  Check, X, Calendar, Megaphone, AlertCircle, Info,
} from 'lucide-react';
import { Avatar } from './ui';
import { currentUser, notifications as allNotifications } from '../data/mockData';
import { cn } from '../utils/helpers';

interface NavbarProps {
  onMenuClick: () => void;
}

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
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts, campaigns, accounts..."
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
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
                >
                  {unreadCount}
                </motion.span>
              )}
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
                    className="block py-3 text-center text-sm font-medium text-indigo-600 hover:bg-gray-50 transition-colors"
                  >
                    View all notifications
                  </Link>
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
