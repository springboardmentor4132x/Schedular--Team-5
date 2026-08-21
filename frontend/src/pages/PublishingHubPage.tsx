import { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid,
  ListChecks,
  History,
  ShieldAlert,
  Radio,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
  RefreshCw,
  Link2,
  Search,
} from 'lucide-react';

import { postService, accountService } from '../services/api';

type Section = 'overview' | 'queue' | 'timeline' | 'issues' | 'platforms';

const SECTIONS: { key: Section; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'queue', label: 'Queue', icon: ListChecks },
  { key: 'timeline', label: 'Timeline', icon: History },
  { key: 'issues', label: 'Issues', icon: ShieldAlert },
  { key: 'platforms', label: 'Platforms', icon: Radio },
];

/* =====================================================
   PUBLISHING HUB
   Overview / Queue / Timeline / Issues / Platforms
===================================================== */

export function PublishingHubPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [postsResult, queueResult, accountsResult] =
        await Promise.allSettled([
          postService.getAll(),
          postService.getQueue(),
          accountService.getAll(),
        ]);

      if (postsResult.status === 'fulfilled') {
        setPosts(
          Array.isArray(postsResult.value?.data)
            ? postsResult.value.data
            : []
        );
      }

      if (queueResult.status === 'fulfilled') {
        const data = queueResult.value?.data;
        setQueue(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : []
        );
      }

      if (accountsResult.status === 'fulfilled') {
        setAccounts(
          Array.isArray(accountsResult.value?.data)
            ? accountsResult.value.data
            : []
        );
      }
    } catch (error) {
      console.error('Unable to load Publishing Hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => loadData(), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const isToday = (value: string | null) => {
    if (!value) return false;
    const date = new Date(value);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const stats = useMemo(() => {
    const publishedToday = posts.filter(
      (post) =>
        normalizeStatus(post.status) === 'published' &&
        isToday(post.published_time || post.updated_at)
    ).length;

    const inQueue = posts.filter((post) =>
      ['scheduled', 'pending_approval'].includes(
        normalizeStatus(post.status)
      )
    ).length;

    const failed = posts.filter(
      (post) => normalizeStatus(post.status) === 'failed'
    ).length;

    const published = posts.filter(
      (post) => normalizeStatus(post.status) === 'published'
    ).length;

    return { publishedToday, inQueue, failed, published };
  }, [posts]);

  const platformSummary = useMemo(() => {
    const map = new Map<string, any[]>();

    accounts.forEach((account) => {
      const platform = formatPlatform(account.platform);
      if (!map.has(platform)) map.set(platform, []);
      map.get(platform)!.push(account);
    });

    return Array.from(map.entries()).map(([platform, platformAccounts]) => {
      const connected = platformAccounts.filter(
        (account) => account.is_connected
      ).length;

      const relatedPosts = posts.filter((post) =>
        getPostPlatforms(post, accounts).includes(platform)
      );

      return {
        platform,
        connected,
        publishedToday: relatedPosts.filter(
          (post) =>
            normalizeStatus(post.status) === 'published' &&
            isToday(post.published_time || post.updated_at)
        ).length,
        inQueue: relatedPosts.filter((post) =>
          ['scheduled', 'pending_approval'].includes(
            normalizeStatus(post.status)
          )
        ).length,
        failed: relatedPosts.filter(
          (post) => normalizeStatus(post.status) === 'failed'
        ).length,
      };
    });
  }, [accounts, posts]);

  const connectedCount = accounts.filter((a) => a.is_connected).length;
  const disconnectedCount = accounts.length - connectedCount;

  const failedPosts = posts.filter(
    (post) => normalizeStatus(post.status) === 'failed'
  );

  const timelineRows = posts
    .filter((post) => {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return true;
      return String(post.content || '').toLowerCase().includes(search);
    })
    .sort((a, b) => getSortDate(b) - getSortDate(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">
            Loading Publishing Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publishing Hub</h1>
        <p className="mt-1 text-sm text-gray-500">
          Everything moving through your pipeline, in one place.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Icon rail navigation */}
        <div className="flex sm:flex-col gap-1 shrink-0">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                className={`flex sm:flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors sm:w-20 ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0 space-y-5">
          {section === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <RingStat
                label="Published today"
                value={stats.publishedToday}
                icon={CheckCircle2}
                accent="from-emerald-400 to-emerald-600"
              />
              <RingStat
                label="Waiting in queue"
                value={stats.inQueue}
                icon={Clock}
                accent="from-blue-400 to-blue-600"
              />
              <RingStat
                label="Published all-time"
                value={stats.published}
                icon={Send}
                accent="from-indigo-400 to-indigo-600"
              />
              <RingStat
                label="Needs attention"
                value={stats.failed}
                icon={XCircle}
                accent="from-rose-400 to-rose-600"
              />
            </div>
          )}

          {section === 'queue' && (
            <div className="space-y-2">
              {queue.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Queue is empty"
                  subtitle="Posts you schedule will line up here before going out."
                />
              ) : (
                queue.map((post: any) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">
                        {post.content || 'No content'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(post.scheduled_time)}
                      </p>
                    </div>

                    <PlatformDots post={post} accounts={accounts} />

                    <span className={getStatusBadgeClass(post.status)}>
                      {formatStatus(post.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {section === 'timeline' && (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search activity..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              {timelineRows.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Nothing here yet"
                  subtitle="Your publishing activity will build up over time."
                />
              ) : (
                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

                  <div className="space-y-4">
                    {timelineRows.map((post: any) => {
                      const status = normalizeStatus(post.status);

                      return (
                        <div key={post.id} className="relative">
                          <div
                            className={`absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${dotColor(
                              status
                            )}`}
                          />

                          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className={getStatusBadgeClass(status)}>
                                {formatStatus(status)}
                              </span>

                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatDateTime(
                                  post.published_time ||
                                    post.scheduled_time ||
                                    post.updated_at ||
                                    post.created_at
                                )}
                              </span>
                            </div>

                            <p className="text-sm text-gray-900 truncate">
                              {post.content || 'No content'}
                            </p>

                            <div className="mt-2">
                              <PlatformDots post={post} accounts={accounts} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'issues' && (
            <div className="space-y-3">
              {failedPosts.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nothing flagged"
                  subtitle="Everything is going out cleanly right now."
                />
              ) : (
                failedPosts.map((post: any) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border-l-4 border-l-rose-400 border-y border-r border-gray-200 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PlatformDots post={post} accounts={accounts} />
                        </div>

                        <p className="text-sm text-gray-900 truncate">
                          {post.content || 'No content'}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(post.updated_at || post.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {section === 'platforms' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <MiniPill
                  icon={CheckCircle2}
                  value={connectedCount}
                  label="Connected"
                  tone="text-emerald-600"
                />
                <MiniPill
                  icon={Link2}
                  value={disconnectedCount}
                  label="Not connected"
                  tone="text-gray-400"
                />
              </div>

              {platformSummary.length === 0 ? (
                <EmptyState
                  icon={Share2}
                  title="No accounts yet"
                  subtitle="Connect an account from Social Accounts to see it here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformSummary.map((item) => (
                    <div
                      key={item.platform}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-indigo-600" />
                          <p className="text-sm font-semibold text-gray-900">
                            {item.platform}
                          </p>
                        </div>

                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.connected > 0
                              ? 'bg-emerald-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      </div>

                      <div className="px-4 py-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {item.publishedToday}
                          </p>
                          <p className="text-[10px] text-gray-400">Today</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {item.inQueue}
                          </p>
                          <p className="text-[10px] text-gray-400">Queued</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {item.failed}
                          </p>
                          <p className="text-[10px] text-gray-400">Failed</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => reconnectPlatform(item.platform)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border-t border-gray-100 hover:bg-gray-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {item.connected > 0 ? 'Reconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ACTIONS
===================================================== */

function reconnectPlatform(platform: string) {
  const normalized = platform.toLowerCase();

  if (normalized === 'facebook') {
    accountService.facebookLogin().then((res) => {
      if (res.data?.url) window.location.href = res.data.url;
    });
  } else if (normalized === 'instagram') {
    accountService.instagramLogin().then((res) => {
      if (res.data?.url) window.location.href = res.data.url;
    });
  } else if (normalized === 'linkedin') {
    accountService.linkedinLogin().then((res) => {
      if (res.data?.url) window.location.href = res.data.url;
    });
  } else if (normalized === 'youtube') {
    accountService.youtubeLogin().then((res) => {
      if (res.data?.url) window.location.href = res.data.url;
    });
  } else if (normalized === 'x' || normalized === 'twitter') {
    accountService.twitterLogin().then((res) => {
      if (res.data?.url) window.location.href = res.data.url;
    });
  } else if (normalized === 'pinterest') {
    accountService.pinterestLogin().then((res) => {
      if (res.data?.url) window.location.href = res.data.url;
    });
  }
}

/* =====================================================
   UI PIECES
===================================================== */

function RingStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: any;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center mb-3`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>

      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function MiniPill({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: any;
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 pl-2 pr-3 py-1.5">
      <Icon className={`w-4 h-4 ${tone}`} />
      <span className="text-sm font-semibold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
      <Icon className="w-10 h-10 mx-auto text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function PlatformDots({ post, accounts }: { post: any; accounts: any[] }) {
  const platforms = getPostPlatforms(post, accounts);

  if (platforms.length === 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform) => (
        <span
          key={platform}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium"
        >
          {platform}
        </span>
      ))}
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getPostPlatforms(post: any, accounts: any[]): string[] {
  const platforms = new Set<string>();

  const embeddedAccounts =
    post.social_accounts ||
    post.post_social_accounts ||
    post.socialAccounts ||
    [];

  if (Array.isArray(embeddedAccounts)) {
    embeddedAccounts.forEach((account: any) => {
      const platform =
        account?.platform || account?.social_account?.platform;
      if (platform) platforms.add(formatPlatform(platform));
    });
  }

  const ids = post.social_account_ids || post.socialAccountIds || [];

  if (Array.isArray(ids)) {
    ids.forEach((id: number | string) => {
      const account = accounts.find(
        (item: any) => String(item.id) === String(id)
      );
      if (account?.platform) platforms.add(formatPlatform(account.platform));
    });
  }

  return Array.from(platforms);
}

function formatPlatform(platform: string): string {
  const normalized = (platform || '').toLowerCase().replace(/[_-]/g, '');

  if (normalized === 'facebook') return 'Facebook';
  if (normalized === 'instagram') return 'Instagram';
  if (normalized === 'linkedin') return 'LinkedIn';
  if (normalized === 'youtube') return 'YouTube';
  if (normalized === 'twitter' || normalized === 'x') return 'X';
  if (normalized === 'pinterest') return 'Pinterest';

  return platform || 'Unknown';
}

function normalizeStatus(status: any): string {
  return String(status || '').toLowerCase().trim();
}

function formatStatus(status: string): string {
  switch (normalizeStatus(status)) {
    case 'draft':
      return 'Draft';
    case 'pending_approval':
      return 'Pending Approval';
    case 'scheduled':
      return 'Scheduled';
    case 'published':
      return 'Published';
    case 'publishing':
      return 'Publishing';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status || 'Unknown';
  }
}

function getStatusBadgeClass(status: string): string {
  const base =
    'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium';

  switch (normalizeStatus(status)) {
    case 'draft':
      return `${base} bg-gray-100 text-gray-700`;
    case 'pending_approval':
      return `${base} bg-amber-100 text-amber-700`;
    case 'scheduled':
      return `${base} bg-blue-100 text-blue-700`;
    case 'published':
      return `${base} bg-emerald-100 text-emerald-700`;
    case 'publishing':
      return `${base} bg-indigo-100 text-indigo-700`;
    case 'failed':
      return `${base} bg-rose-100 text-rose-700`;
    case 'cancelled':
      return `${base} bg-gray-100 text-gray-600`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
}

function dotColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-emerald-500';
    case 'scheduled':
      return 'bg-blue-500';
    case 'pending_approval':
      return 'bg-amber-500';
    case 'failed':
      return 'bg-rose-500';
    case 'cancelled':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
}

function getSortDate(post: any): number {
  const value =
    post.published_time ||
    post.updated_at ||
    post.scheduled_time ||
    post.created_at ||
    null;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Not available';

  try {
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return value;
  }
}
