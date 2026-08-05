import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, Calendar, AlertCircle,
  Megaphone, Info, X,
} from 'lucide-react';
import { Card, Badge, Button, EmptyState } from '../components/ui';
import { notifications as initialNotifications } from '../data/mockData';
import { cn } from '../utils/helpers';

const notificationConfig = {
  schedule: { icon: Calendar, color: 'bg-blue-50 text-blue-600', label: 'Schedule' },
  alert: { icon: AlertCircle, color: 'bg-red-50 text-red-600', label: 'Alert' },
  campaign: { icon: Megaphone, color: 'bg-violet-50 text-violet-600', label: 'Campaign' },
  info: { icon: Info, color: 'bg-gray-100 text-gray-600', label: 'Info' },
};

type FilterType = 'all' | 'unread' | 'schedule' | 'alert' | 'campaign' | 'info';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'schedule', label: 'Schedule' },
    { key: 'alert', label: 'Alerts' },
    { key: 'campaign', label: 'Campaigns' },
    { key: 'info', label: 'Info' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You\'re all caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={clearAll} disabled={notifications.length === 0}>
            Clear all
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={cn('px-1.5 py-0.5 text-[10px] rounded-md', filter === f.key ? 'bg-white/20' : 'bg-gray-100')}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="No notifications"
            description={filter === 'unread' ? 'You have no unread notifications.' : 'You\'ll see updates here when there\'s new activity.'}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif, idx) => {
              const config = notificationConfig[notif.type as keyof typeof notificationConfig];
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all',
                    !notif.read ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.color)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">{notif.time}</span>
                          <Badge variant="default" className="!py-0.5">{config.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
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
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
