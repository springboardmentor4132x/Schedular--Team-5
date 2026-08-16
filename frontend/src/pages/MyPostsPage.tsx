import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Share2,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
} from 'lucide-react';

import { postService, accountService } from '../services/api';

type Status =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'cancelled';

type Tab = 'all' | Status;

/* =====================================================
   MY POSTS PAGE
   Stat cards + search/platform filter + status tabs +
   post list with View / Edit / Delete actions.
===================================================== */

export function MyPostsPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  const loadData = async () => {
    try {
      const [postsResult, accountsResult] =
        await Promise.allSettled([
          postService.getAll(),
          accountService.getAll(),
        ]);

      if (postsResult.status === 'fulfilled') {
        setPosts(
          Array.isArray(postsResult.value?.data)
            ? postsResult.value.data
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
      console.error('Unable to load My Posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadData();
    }, 30000);

    const handleFocus = () => loadData();

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const counts = useMemo(() => {
    const base: Record<Status, number> = {
      draft: 0,
      pending_approval: 0,
      scheduled: 0,
      published: 0,
      failed: 0,
      cancelled: 0,
    };

    posts.forEach((post) => {
      const status = normalizeStatus(post.status) as Status;

      if (status in base) {
        base[status] += 1;
      }
    });

    return base;
  }, [posts]);

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();

    posts.forEach((post) => {
      getPostPlatforms(post, accounts).forEach((platform) =>
        set.add(platform)
      );
    });

    return Array.from(set);
  }, [posts, accounts]);

  const filteredPosts = posts
    .filter((post) => {
      if (activeTab === 'all') {
        return true;
      }

      return normalizeStatus(post.status) === activeTab;
    })
    .filter((post) => {
      if (platformFilter === 'all') {
        return true;
      }

      return getPostPlatforms(post, accounts).includes(
        platformFilter
      );
    })
    .filter((post) => {
      const search = searchTerm.toLowerCase().trim();

      if (!search) {
        return true;
      }

      const content = String(post.content || '').toLowerCase();

      const campaign = String(
        post.campaign?.name ||
          post.campaign?.title ||
          post.campaign_name ||
          ''
      ).toLowerCase();

      const platformText = getPostPlatforms(post, accounts)
        .join(' ')
        .toLowerCase();

      return (
        content.includes(search) ||
        campaign.includes(search) ||
        platformText.includes(search)
      );
    })
    .sort((a, b) => getPostSortDate(b) - getPostSortDate(a));

  const handleEdit = (postId: number) => {
    // ASSUMPTION: CreatePostPage reads an `edit` query param to
    // load an existing post. Confirm/adjust once api.ts is shared.
    navigate(`/app/create-post?edit=${postId}`);
  };

  const handleDelete = async (postId: number) => {
    const confirmed = window.confirm(
      'Delete this post? This cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(postId);

    try {
      await postService.delete(postId);

      setPosts((prev) =>
        prev.filter((post) => post.id !== postId)
      );
    } catch (error) {
      console.error('Unable to delete post:', error);
      window.alert('Could not delete this post. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">
            Loading your posts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Posts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track, edit, and manage everything you've created.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/create-post')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <MiniStatCard
          label="Total"
          value={posts.length}
          icon={LayoutGrid}
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />

        <MiniStatCard
          label="Drafts"
          value={counts.draft}
          icon={FileText}
          active={activeTab === 'draft'}
          onClick={() => setActiveTab('draft')}
        />

        <MiniStatCard
          label="Pending"
          value={counts.pending_approval}
          icon={Clock}
          active={activeTab === 'pending_approval'}
          onClick={() => setActiveTab('pending_approval')}
        />

        <MiniStatCard
          label="Scheduled"
          value={counts.scheduled}
          icon={Calendar}
          active={activeTab === 'scheduled'}
          onClick={() => setActiveTab('scheduled')}
        />

        <MiniStatCard
          label="Published"
          value={counts.published}
          icon={CheckCircle}
          active={activeTab === 'published'}
          onClick={() => setActiveTab('published')}
        />

        <MiniStatCard
          label="Failed"
          value={counts.failed}
          icon={AlertCircle}
          active={activeTab === 'failed'}
          onClick={() => setActiveTab('failed')}
        />

        <MiniStatCard
          label="Cancelled"
          value={counts.cancelled}
          icon={XCircle}
          active={activeTab === 'cancelled'}
          onClick={() => setActiveTab('cancelled')}
        />
      </div>

      {/* Search + platform filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search captions, campaigns..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400"
          />
        </div>

        <select
          value={platformFilter}
          onChange={(event) => setPlatformFilter(event.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400"
        >
          <option value="all">All Platforms</option>

          {availablePlatforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <TabButton
          label="All"
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />

        <TabButton
          label="Drafts"
          active={activeTab === 'draft'}
          onClick={() => setActiveTab('draft')}
        />

        <TabButton
          label="Pending"
          active={activeTab === 'pending_approval'}
          onClick={() => setActiveTab('pending_approval')}
        />

        <TabButton
          label="Scheduled"
          active={activeTab === 'scheduled'}
          onClick={() => setActiveTab('scheduled')}
        />

        <TabButton
          label="Published"
          active={activeTab === 'published'}
          onClick={() => setActiveTab('published')}
        />

        <TabButton
          label="Failed"
          active={activeTab === 'failed'}
          onClick={() => setActiveTab('failed')}
        />

        <TabButton
          label="Cancelled"
          active={activeTab === 'cancelled'}
          onClick={() => setActiveTab('cancelled')}
        />
      </div>

      {/* Post list */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-10 h-10 mx-auto text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-600">
            {searchTerm || platformFilter !== 'all'
              ? 'No posts match your filters'
              : 'No posts here yet'}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {searchTerm || platformFilter !== 'all'
              ? 'Try adjusting your search or platform filter.'
              : 'Create your first post to see it here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post: any) => (
            <PostRow
              key={post.id}
              post={post}
              accounts={accounts}
              onEdit={() => handleEdit(post.id)}
              onDelete={() => handleDelete(post.id)}
              deleting={deletingId === post.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   POST ROW
===================================================== */

function PostRow({
  post,
  accounts,
  onEdit,
  onDelete,
  deleting,
}: {
  post: any;
  accounts: any[];
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const platforms = getPostPlatforms(post, accounts);
  const status = normalizeStatus(post.status);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={getStatusBadgeClass(status)}>
              {formatStatus(status)}
            </span>

            {platforms.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-xs font-medium text-violet-700">
                <Share2 className="w-3.5 h-3.5" />
                {platforms.join(', ')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-xs text-gray-500">
                <Share2 className="w-3.5 h-3.5" />
                No account linked
              </span>
            )}
          </div>

          <p className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
            {post.content || 'No content'}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {post.scheduled_time && (
              <span>
                Scheduled: {formatDateTime(post.scheduled_time)}
              </span>
            )}

            {post.published_time && (
              <span>
                Published: {formatDateTime(post.published_time)}
              </span>
            )}
          </div>

          {status === 'failed' &&
            (post.error_message ||
              post.failure_reason ||
              post.error) && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-xs text-red-600">
                  {post.error_message ||
                    post.failure_reason ||
                    post.error}
                </p>
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <ActionButton
            label="View"
            icon={Eye}
            onClick={() => {
              // Hook this up to a detail view/modal once you have one
              console.log('View post', post.id);
            }}
          />

          <ActionButton label="Edit" icon={Pencil} onClick={onEdit} />

          <ActionButton
            label={deleting ? 'Deleting...' : 'Delete'}
            icon={Trash2}
            onClick={onDelete}
            danger
            disabled={deleting}
          />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  icon: any;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        danger
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

/* =====================================================
   STAT CARD / TAB PIECES
===================================================== */

function MiniStatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-3 transition-all ${
        active
          ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-200'
          : 'border-gray-200 bg-white hover:border-violet-300'
      }`}
    >
      <Icon
        className={`w-4 h-4 mb-2 ${
          active ? 'text-violet-600' : 'text-gray-400'
        }`}
      />

      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </button>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

/* =====================================================
   SOCIAL PLATFORM HELPERS
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

      if (platform) {
        platforms.add(formatPlatform(platform));
      }
    });
  }

  const ids = post.social_account_ids || post.socialAccountIds || [];

  if (Array.isArray(ids)) {
    ids.forEach((id: number | string) => {
      const account = accounts.find(
        (item: any) => String(item.id) === String(id)
      );

      if (account?.platform) {
        platforms.add(formatPlatform(account.platform));
      }
    });
  }

  if (Array.isArray(embeddedAccounts)) {
    embeddedAccounts.forEach((item: any) => {
      const accountId =
        item?.social_account_id ||
        item?.socialAccountId ||
        item?.social_account?.id;

      if (accountId) {
        const account = accounts.find(
          (accountItem: any) =>
            String(accountItem.id) === String(accountId)
        );

        if (account?.platform) {
          platforms.add(formatPlatform(account.platform));
        }
      }
    });
  }

  return Array.from(platforms);
}

function formatPlatform(platform: string): string {
  const normalized = platform.toLowerCase().replace(/[_-]/g, '');

  if (normalized === 'facebook') return 'Facebook';
  if (normalized === 'instagram') return 'Instagram';
  if (normalized === 'linkedin') return 'LinkedIn';
  if (normalized === 'youtube') return 'YouTube';
  if (normalized === 'twitter' || normalized === 'x') return 'X';
  if (normalized === 'pinterest') return 'Pinterest';

  return platform;
}

/* =====================================================
   STATUS HELPERS
===================================================== */

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
      return `${base} bg-violet-100 text-violet-700`;
    case 'failed':
      return `${base} bg-red-100 text-red-700`;
    case 'cancelled':
      return `${base} bg-gray-100 text-gray-600`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
}

/* =====================================================
   SORTING / DATE HELPERS
===================================================== */

function getPostSortDate(post: any): number {
  const value =
    post.created_at ||
    post.updated_at ||
    post.scheduled_time ||
    post.published_time ||
    post.cancelled_at ||
    null;

  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Not available';
  }

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
