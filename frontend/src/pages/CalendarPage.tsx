import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Clock,
  Calendar as CalendarIcon, LayoutGrid, Columns, Square,
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { scheduledPosts, campaigns } from '../data/mockData';
import { getPlatformConfig, formatTime, cn } from '../utils/helpers';

type ViewMode = 'month' | 'week' | 'day';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarPost {
  id: string;
  content: string;
  platforms: string[];
  date: Date;
  status: string;
  campaign?: string;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  published: 'bg-emerald-500',
  draft: 'bg-gray-400',
  failed: 'bg-red-500',
};

const campaignColors = campaigns.reduce((acc, c) => {
  acc[c.name] = c.color;
  return acc;
}, {} as Record<string, string>);

export function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 12));
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const posts: CalendarPost[] = scheduledPosts.map((p) => ({
    id: p.id,
    content: p.content,
    platforms: p.platforms,
    date: new Date(p.scheduledAt),
    status: p.status,
    campaign: p.campaign || undefined,
  }));

  const getPostsForDate = (date: Date) => {
    return posts.filter((p) => p.date.toDateString() === date.toDateString());
  };

  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date(2026, 6, 12));
      return;
    }
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const headerTitle = (() => {
    if (viewMode === 'month') return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${months[start.getMonth()].slice(0, 3)} ${start.getDate()} - ${months[end.getMonth()].slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  })();

  // Month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date(2026, 6, 12);

    const cells: { date: Date; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(year, month, i), current: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: new Date(year, month + 1, i), current: false });
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
        {weekdays.map((day) => (
          <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-600">
            {day}
          </div>
        ))}
        {cells.map((cell, idx) => {
          const dayPosts = getPostsForDate(cell.date);
          const isToday = cell.date.toDateString() === today.toDateString();
          return (
            <div
              key={idx}
              className={cn(
                'bg-white min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 relative group',
                !cell.current && 'bg-gray-50/50',
                isToday && 'ring-2 ring-indigo-500 ring-inset'
              )}
            >
              <div className={cn(
                'text-xs font-medium mb-1 inline-flex w-6 h-6 items-center justify-center rounded-full',
                isToday ? 'bg-indigo-600 text-white' : cell.current ? 'text-gray-700' : 'text-gray-400'
              )}>
                {cell.date.getDate()}
              </div>
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <motion.button
                    key={post.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { setSelectedPost(post); setShowPostModal(true); }}
                    className={cn(
                      'w-full text-left px-1.5 py-1 rounded-md text-[10px] sm:text-xs font-medium text-white truncate flex items-center gap-1',
                      statusColors[post.status]
                    )}
                    style={post.campaign && campaignColors[post.campaign] ? { backgroundColor: campaignColors[post.campaign] } : {}}
                  >
                    <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{formatTime(post.date.toISOString())}</span>
                  </motion.button>
                ))}
                {dayPosts.length > 3 && (
                  <p className="text-[10px] text-gray-500 px-1">+{dayPosts.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Week view
  const renderWeekView = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date(2026, 6, 12);

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50" />
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date(start);
              date.setDate(date.getDate() + i);
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div key={i} className="bg-gray-50 py-2 text-center">
                  <p className="text-xs font-semibold text-gray-600">{weekdays[i]}</p>
                  <p className={cn('text-sm font-bold mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full', isToday ? 'bg-indigo-600 text-white' : 'text-gray-900')}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
            {hours.filter((h) => h >= 6 && h <= 22).map((hour) => (
              <>
                <div key={`h-${hour}`} className="bg-white px-2 py-3 text-xs text-gray-400 text-right">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const date = new Date(start);
                  date.setDate(date.getDate() + dayIdx);
                  date.setHours(hour, 0, 0, 0);
                  const hourPosts = posts.filter((p) => p.date.toDateString() === date.toDateString() && p.date.getHours() === hour);
                  return (
                    <div key={`d-${dayIdx}-h-${hour}`} className="bg-white min-h-[50px] p-1 relative">
                      {hourPosts.map((post) => (
                        <motion.button
                          key={post.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => { setSelectedPost(post); setShowPostModal(true); }}
                          className={cn('w-full text-left px-1.5 py-1 rounded-md text-[10px] font-medium text-white truncate flex items-center gap-1', statusColors[post.status])}
                        >
                          <span className="truncate">{post.content.slice(0, 30)}...</span>
                        </motion.button>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayPosts = posts.filter((p) => p.date.toDateString() === currentDate.toDateString());

    return (
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-[80px_1fr] gap-px bg-gray-200 rounded-xl overflow-hidden">
          {hours.filter((h) => h >= 6 && h <= 22).map((hour) => (
            <>
              <div key={`h-${hour}`} className="bg-white px-3 py-4 text-xs text-gray-400 text-right">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              <div className="bg-white min-h-[60px] p-2">
                {dayPosts.filter((p) => p.date.getHours() === hour).map((post) => (
                  <motion.button
                    key={post.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => { setSelectedPost(post); setShowPostModal(true); }}
                    className={cn('w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-2', statusColors[post.status])}
                  >
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{formatTime(post.date.toISOString())} - {post.content.slice(0, 40)}...</span>
                  </motion.button>
                ))}
              </div>
            </>
          ))}
        </div>
        {dayPosts.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No posts scheduled for this day</p>
          </div>
        )}
      </div>
    );
  };

  const viewModes: { mode: ViewMode; icon: any; label: string }[] = [
    { mode: 'month', icon: Square, label: 'Month' },
    { mode: 'week', icon: Columns, label: 'Week' },
    { mode: 'day', icon: LayoutGrid, label: 'Day' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Content Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your scheduled content</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Schedule Post</Button>
      </div>

      {/* Legend */}
      <Card className="p-3 flex flex-wrap items-center gap-4">
        <span className="text-xs font-medium text-gray-500">Campaigns:</span>
        {campaigns.filter((c) => c.status !== 'draft').map((c) => (
          <div key={c.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
            <span className="text-xs text-gray-600">{c.name}</span>
          </div>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-2" />
        <span className="text-xs font-medium text-gray-500">Status:</span>
        {[
          { label: 'Scheduled', color: 'bg-blue-500' },
          { label: 'Published', color: 'bg-emerald-500' },
          { label: 'Draft', color: 'bg-gray-400' },
          { label: 'Failed', color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded', s.color)} />
            <span className="text-xs text-gray-600">{s.label}</span>
          </div>
        ))}
      </Card>

      {/* Calendar controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('today')}>Today</Button>
            <div className="flex">
              <button onClick={() => navigate('prev')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => navigate('next')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-2">{headerTitle}</h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {viewModes.map((vm) => (
              <button
                key={vm.mode}
                onClick={() => setViewMode(vm.mode)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === vm.mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <vm.icon className="w-3.5 h-3.5" />
                {vm.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </Card>

      {/* Post detail modal */}
      <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title="Post Details" size="md">
        {selectedPost && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={selectedPost.status === 'published' ? 'success' : selectedPost.status === 'failed' ? 'danger' : selectedPost.status === 'draft' ? 'default' : 'info'} dot>
                {selectedPost.status}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatTime(selectedPost.date.toISOString())} · {selectedPost.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">{selectedPost.content}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Platforms</p>
              <div className="flex gap-2">
                {selectedPost.platforms.map((p) => {
                  const config = getPlatformConfig(p);
                  const Icon = config.icon;
                  return (
                    <div key={p} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                      <span className="text-xs font-medium text-gray-700">{config.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedPost.campaign && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Campaign</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${campaignColors[selectedPost.campaign]}15` }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: campaignColors[selectedPost.campaign] }} />
                  <span className="text-sm font-medium text-gray-900">{selectedPost.campaign}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth>Edit</Button>
              <Button variant="danger" fullWidth>Cancel Post</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
