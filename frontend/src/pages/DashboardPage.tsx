import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  Calendar,
  BarChart3,
  Share2,
  Megaphone,
  Search,
  UserCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  postService,
  campaignService,
  accountService,
  businessAssignmentService,
  userService,
} from '../services/api';

type UserRole =
  | 'administrator'
  | 'marketing_team'
  | 'content_creator'
  | 'business_user';

type UserData = {
  username: string;
  role: UserRole;
};

type UserRecord = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

type Client = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
};

type StatusFilter =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'cancelled'
  | null;

type SortOrder = 'newest' | 'oldest';


/* =====================================================
   MAIN DASHBOARD
===================================================== */

export function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPosts = async () => {
    try {
      const response = await postService.getAll();

      if (Array.isArray(response?.data)) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Unable to refresh dashboard posts:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        if (!token) {
          return;
        }

        const storedRole = localStorage.getItem('user_role');
        const storedUsername = localStorage.getItem('username');

        const currentRole =
          (storedRole as UserRole) || 'business_user';

        if (!mounted) {
          return;
        }

        setUser({
          username: storedUsername || 'User',
          role: currentRole,
        });

        const requests: Promise<any>[] = [
          postService.getAll(),
          campaignService.getAll(),
          accountService.getAll(),
        ];

        if (currentRole === 'administrator') {
          requests.push(userService.getAll());
        }

        const results = await Promise.allSettled(requests);

        const [
          postsResult,
          campaignsResult,
          accountsResult,
          usersResult,
        ] = results;

        if (
          mounted &&
          postsResult.status === 'fulfilled'
        ) {
          setPosts(
            Array.isArray(postsResult.value?.data)
              ? postsResult.value.data
              : []
          );
        }

        if (
          mounted &&
          campaignsResult.status === 'fulfilled'
        ) {
          setCampaigns(
            Array.isArray(campaignsResult.value?.data)
              ? campaignsResult.value.data
              : []
          );
        }

        if (
          mounted &&
          accountsResult.status === 'fulfilled'
        ) {
          setAccounts(
            Array.isArray(accountsResult.value?.data)
              ? accountsResult.value.data
              : []
          );
        }

        if (
          mounted &&
          currentRole === 'administrator' &&
          usersResult &&
          usersResult.status === 'fulfilled'
        ) {
          setUsers(
            Array.isArray(usersResult.value?.data)
              ? usersResult.value.data
              : []
          );
        }

        if (
          mounted &&
          currentRole === 'marketing_team'
        ) {
          try {
            const clientsResponse =
              await businessAssignmentService.getMyClients();

            setClients(
              Array.isArray(clientsResponse?.data)
                ? clientsResponse.data
                : []
            );
          } catch (error) {
            console.error(
              'Unable to load marketing team clients:',
              error
            );

            setClients([]);
          }
        }
      } catch (error) {
        console.error(
          'Dashboard loading error:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      return;
    }

    const interval = window.setInterval(() => {
      refreshPosts();
    }, 30000);

    const handleFocus = () => {
      refreshPosts();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const role = user?.role || 'business_user';
  const username = user?.username || 'User';

  if (role === 'administrator') {
    return (
      <AdministratorDashboard
        username={username}
        posts={posts}
        campaigns={campaigns}
        accounts={accounts}
        users={users}
      />
    );
  }

  if (role === 'marketing_team') {
    return (
      <MarketingTeamDashboard
        username={username}
        campaigns={campaigns}
        posts={posts}
        clients={clients}
      />
    );
  }

  if (role === 'content_creator') {
    return (
      <ContentCreatorDashboard
        username={username}
        posts={posts}
        accounts={accounts}
      />
    );
  }

  return (
    <BusinessUserDashboard
      username={username}
      posts={posts}
      campaigns={campaigns}
      accounts={accounts}
    />
  );
}


/* =====================================================
   ADMINISTRATOR DASHBOARD
===================================================== */

function AdministratorDashboard({
  username,
  posts,
  campaigns,
  accounts,
  users,
}: {
  username: string;
  posts: any[];
  campaigns: any[];
  accounts: any[];
  users: UserRecord[];
}) {
  const totalUsers = users.length;

  const marketingTeams = users.filter(
    (user) => user.role === 'marketing_team'
  ).length;

  const businessUsers = users.filter(
    (user) => user.role === 'business_user'
  ).length;

  const contentCreators = users.filter(
    (user) => user.role === 'content_creator'
  ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Manage your SocialPilot platform and monitor overall activity."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
        />

        <StatCard
          title="Total Campaigns"
          value={campaigns.length}
          icon={Megaphone}
        />

        <StatCard
          title="Total Posts"
          value={posts.length}
          icon={FileText}
        />

        <StatCard
          title="Connected Accounts"
          value={accounts.length}
          icon={Share2}
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <DashboardCard
          title="Platform Overview"
          icon={BarChart3}
        >
          <div className="space-y-4">

            <OverviewRow
              label="Registered Users"
              value={totalUsers}
            />

            <OverviewRow
              label="Marketing Teams"
              value={marketingTeams}
            />

            <OverviewRow
              label="Business Users"
              value={businessUsers}
            />

            <OverviewRow
              label="Content Creators"
              value={contentCreators}
            />

          </div>
        </DashboardCard>

        <DashboardCard
          title="Recent Activity"
          icon={Calendar}
        >
          <div className="space-y-3">

            <ActivityRow
              label="Registered users"
              value={totalUsers}
            />

            <ActivityRow
              label="Campaigns created"
              value={campaigns.length}
            />

            <ActivityRow
              label="Posts created"
              value={posts.length}
            />

            <ActivityRow
              label="Connected social accounts"
              value={accounts.length}
            />

          </div>
        </DashboardCard>

      </div>

    </div>
  );
}


/* =====================================================
   MARKETING TEAM DASHBOARD
===================================================== */

function MarketingTeamDashboard({
  username,
  campaigns,
  posts,
  clients,
}: {
  username: string;
  campaigns: any[];
  posts: any[];
  clients: Client[];
}) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((client) => {
    const search = searchTerm.toLowerCase();

    return (
      client.username
        .toLowerCase()
        .includes(search) ||
      client.email
        .toLowerCase()
        .includes(search) ||
      (client.full_name || '')
        .toLowerCase()
        .includes(search)
    );
  });

  const scheduledPosts = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'scheduled'
  ).length;

  const publishedPosts = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'published'
  ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Manage your assigned clients and their social media campaigns."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="My Clients"
          value={clients.length}
          icon={Users}
        />

        <StatCard
          title="Active Campaigns"
          value={campaigns.length}
          icon={Megaphone}
        />

        <StatCard
          title="Scheduled Posts"
          value={scheduledPosts}
          icon={Calendar}
        />

        <StatCard
          title="Published Posts"
          value={publishedPosts}
          icon={FileText}
        />

      </div>

      <DashboardCard
        title="My Clients"
        icon={Users}
      >

        <div className="mb-5 relative">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
          />

        </div>

        {clients.length === 0 ? (

          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

            <Users className="w-8 h-8 mx-auto text-gray-400" />

            <h3 className="mt-3 text-sm font-semibold text-gray-900">
              No clients assigned yet
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Business Users who select your Marketing Team will appear here.
            </p>

          </div>

        ) : filteredClients.length === 0 ? (

          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

            <Search className="w-8 h-8 mx-auto text-gray-400" />

            <h3 className="mt-3 text-sm font-semibold text-gray-900">
              No clients found
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Try searching with a different name or email.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {filteredClients.map((client) => (

              <button
                key={client.id}
                type="button"
                onClick={() =>
                  navigate(`/app/clients/${client.id}`)
                }
                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
              >

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">

                    <UserCircle className="w-6 h-6 text-indigo-600" />

                  </div>

                  <div className="min-w-0">

                    <h3 className="font-semibold text-gray-900 truncate">
                      {client.full_name ||
                        client.username}
                    </h3>

                    <p className="text-sm text-gray-500 truncate">
                      @{client.username}
                    </p>

                  </div>

                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">

                  <p className="text-sm text-gray-500 truncate">
                    {client.email}
                  </p>

                </div>

                <div className="mt-3 text-xs font-medium text-indigo-600">
                  Open client workspace →
                </div>

              </button>

            ))}

          </div>

        )}

      </DashboardCard>

    </div>
  );
}


/* =====================================================
   CONTENT CREATOR DASHBOARD
===================================================== */

function ContentCreatorDashboard({
  username,
  posts,
  accounts,
}: {
  username: string;
  posts: any[];
  accounts: any[];
}) {
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>(null);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [sortOrder, setSortOrder] =
    useState<SortOrder>('newest');

  const drafts = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'draft'
  );

  const pendingApproval = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'pending_approval'
  );

  const scheduled = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'scheduled'
  );

  const published = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'published'
  );

  const failed = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'failed'
  );

  const cancelled = posts.filter(
    (post) =>
      normalizeStatus(post.status) === 'cancelled'
  );

  const handleStatusClick = (
    status: Exclude<StatusFilter, null>
  ) => {
    if (selectedStatus === status) {
      setSelectedStatus(null);
      setSearchTerm('');
      return;
    }

    setSelectedStatus(status);
    setSearchTerm('');
  };

  const getSelectedPosts = () => {
    switch (selectedStatus) {
      case 'draft':
        return drafts;

      case 'pending_approval':
        return pendingApproval;

      case 'scheduled':
        return scheduled;

      case 'published':
        return published;

      case 'failed':
        return failed;

      case 'cancelled':
        return cancelled;

      default:
        return [];
    }
  };

  const filteredPosts = getSelectedPosts()
    .filter((post) => {
      const search =
        searchTerm.toLowerCase().trim();

      if (!search) {
        return true;
      }

      const content =
        String(post.content || '')
          .toLowerCase();

      const campaign =
        String(
          post.campaign?.name ||
          post.campaign?.title ||
          post.campaign_name ||
          ''
        ).toLowerCase();

      const embeddedAccounts =
        Array.isArray(post.social_accounts)
          ? post.social_accounts
          : [];

      const platformText =
        embeddedAccounts
          .map((account: any) =>
            [
              account.platform,
              account.account_name,
              account.account_id,
            ]
              .filter(Boolean)
              .join(' ')
          )
          .join(' ')
          .toLowerCase();

      const fallbackAccounts =
        Array.isArray(post.social_account_ids)
          ? post.social_account_ids
              .map((id: number) =>
                accounts.find(
                  (account: any) =>
                    String(account.id) ===
                    String(id)
                )
              )
              .filter(Boolean)
          : [];

      const fallbackPlatformText =
        fallbackAccounts
          .map((account: any) =>
            [
              account.platform,
              account.account_name,
              account.account_id,
            ]
              .filter(Boolean)
              .join(' ')
          )
          .join(' ')
          .toLowerCase();

      return (
        content.includes(search) ||
        campaign.includes(search) ||
        platformText.includes(search) ||
        fallbackPlatformText.includes(search)
      );
    })
    .sort((a, b) => {
      const dateA = getPostSortDate(a);
      const dateB = getPostSortDate(b);

      if (sortOrder === 'newest') {
        return dateB - dateA;
      }

      return dateA - dateB;
    });

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Create and manage the content assigned to you."
      />

      {/* =================================================
          STATUS CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <StatusCard
          title="My Drafts"
          value={drafts.length}
          icon={FileText}
          active={selectedStatus === 'draft'}
          onClick={() =>
            handleStatusClick('draft')
          }
        />

        <StatusCard
          title="Pending Approval"
          value={pendingApproval.length}
          icon={Clock}
          active={
            selectedStatus === 'pending_approval'
          }
          onClick={() =>
            handleStatusClick(
              'pending_approval'
            )
          }
        />

        <StatusCard
          title="Scheduled"
          value={scheduled.length}
          icon={Calendar}
          active={
            selectedStatus === 'scheduled'
          }
          onClick={() =>
            handleStatusClick('scheduled')
          }
        />

        <StatusCard
          title="Published"
          value={published.length}
          icon={CheckCircle}
          active={
            selectedStatus === 'published'
          }
          onClick={() =>
            handleStatusClick('published')
          }
        />

        <StatusCard
          title="Failed"
          value={failed.length}
          icon={AlertCircle}
          active={
            selectedStatus === 'failed'
          }
          onClick={() =>
            handleStatusClick('failed')
          }
        />

        <StatusCard
          title="Cancelled"
          value={cancelled.length}
          icon={XCircle}
          active={
            selectedStatus === 'cancelled'
          }
          onClick={() =>
            handleStatusClick('cancelled')
          }
        />

      </div>

      {/* =================================================
          EMPTY STATE BEFORE STATUS SELECTION
      ================================================= */}

      {!selectedStatus ? (

        <DashboardCard
          title="My Content"
          icon={FileText}
        >

          <div className="text-center py-12">

            <FileText className="w-10 h-10 mx-auto text-gray-300" />

            <p className="mt-3 text-sm font-medium text-gray-600">
              Select a content status above
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Click Drafts, Pending Approval, Scheduled,
              Published, Failed, or Cancelled to view posts.
            </p>

          </div>

        </DashboardCard>

      ) : (

        <DashboardCard
          title={getStatusTitle(selectedStatus)}
          icon={getStatusIcon(selectedStatus)}
        >

          {/* Search + Sort */}

          <div className="flex flex-col sm:flex-row gap-3 mb-5">

            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder={`Search ${getStatusTitle(
                  selectedStatus
                ).toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
              />

            </div>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value as SortOrder
                )
              }
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>
            </select>

          </div>

          {/* Clear selection */}

          <div className="flex justify-end mb-4">

            <button
              type="button"
              onClick={() => {
                setSelectedStatus(null);
                setSearchTerm('');
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear selection
            </button>

          </div>

          {/* Posts */}

          {filteredPosts.length === 0 ? (

            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">

              <FileText className="w-8 h-8 mx-auto text-gray-400" />

              <p className="mt-3 text-sm font-medium text-gray-700">
                {searchTerm
                  ? 'No matching posts found'
                  : `No ${getStatusTitle(
                      selectedStatus
                    ).toLowerCase()} found`}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {searchTerm
                  ? 'Try a different search term.'
                  : 'There are currently no posts in this status.'}
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {filteredPosts.map(
                (post: any) => (

                  <CreatorPostRow
                    key={post.id}
                    post={post}
                    accounts={accounts}
                  />

                )
              )}

            </div>

          )}

        </DashboardCard>

      )}

    </div>
  );
}


/* =====================================================
   CREATOR POST ROW
===================================================== */

function CreatorPostRow({
  post,
  accounts,
}: {
  post: any;
  accounts: any[];
}) {
  const platforms =
    getPostPlatforms(
      post,
      accounts
    );

  const status =
    normalizeStatus(post.status);

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">

      <div className="flex flex-col gap-3">

        {/* Content */}

        <div>

          <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
            {post.content || 'No content'}
          </p>

        </div>

        {/* Status + platforms */}

        <div className="flex flex-wrap items-center gap-2">

          <span
            className={getStatusBadgeClass(
              status
            )}
          >
            {formatStatus(status)}
          </span>

          {platforms.length > 0 ? (

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700">

              <Share2 className="w-3.5 h-3.5 text-indigo-600" />

              {platforms.join(', ')}

            </span>

          ) : (

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-500">

              <Share2 className="w-3.5 h-3.5" />

              No social account

            </span>

          )}

        </div>

        {/* Scheduled time */}

        {post.scheduled_time && (

          <div className="text-xs text-gray-500">

            Scheduled:{' '}

            {formatDateTime(
              post.scheduled_time
            )}

          </div>

        )}

        {/* Published time */}

        {post.published_time && (

          <div className="text-xs text-gray-500">

            Published:{' '}

            {formatDateTime(
              post.published_time
            )}

          </div>

        )}

        {/* Failure information */}

        {status === 'failed' && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">

            <p className="text-xs font-medium text-red-700">
              Publishing failed
            </p>

            {(post.error_message ||
              post.failure_reason ||
              post.error) && (

              <p className="mt-1 text-xs text-red-600">
                {post.error_message ||
                  post.failure_reason ||
                  post.error}
              </p>

            )}

          </div>
        )}

        {/* Cancellation information */}

        {status === 'cancelled' && (
          <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">

            <p className="text-xs font-medium text-gray-700">
              This post was cancelled.
            </p>

            {(post.cancelled_at ||
              post.cancellation_reason) && (

              <p className="mt-1 text-xs text-gray-500">
                {post.cancellation_reason ||
                  (post.cancelled_at
                    ? `Cancelled: ${formatDateTime(
                        post.cancelled_at
                      )}`
                    : '')}
              </p>

            )}

          </div>
        )}

      </div>

    </div>
  );
}


/* =====================================================
   SOCIAL PLATFORM HELPERS
===================================================== */

function getPostPlatforms(
  post: any,
  accounts: any[]
): string[] {
  const platforms = new Set<string>();

  const embeddedAccounts =
    post.social_accounts ||
    post.post_social_accounts ||
    post.socialAccounts ||
    [];

  if (Array.isArray(embeddedAccounts)) {

    embeddedAccounts.forEach(
      (account: any) => {

        const platform =
          account?.platform ||
          account?.social_account?.platform;

        if (platform) {

          platforms.add(
            formatPlatform(platform)
          );

        }

      }
    );

  }

  const ids =
    post.social_account_ids ||
    post.socialAccountIds ||
    [];

  if (Array.isArray(ids)) {

    ids.forEach(
      (id: number | string) => {

        const account =
          accounts.find(
            (item: any) =>
              String(item.id) ===
              String(id)
          );

        if (account?.platform) {

          platforms.add(
            formatPlatform(
              account.platform
            )
          );

        }

      }
    );

  }

  if (Array.isArray(embeddedAccounts)) {

    embeddedAccounts.forEach(
      (item: any) => {

        const accountId =
          item?.social_account_id ||
          item?.socialAccountId ||
          item?.social_account?.id;

        if (accountId) {

          const account =
            accounts.find(
              (accountItem: any) =>
                String(accountItem.id) ===
                String(accountId)
            );

          if (account?.platform) {

            platforms.add(
              formatPlatform(
                account.platform
              )
            );

          }

        }

      }
    );

  }

  return Array.from(platforms);
}


function formatPlatform(
  platform: string
): string {

  const normalized =
    platform
      .toLowerCase()
      .replace(/[_-]/g, '');

  if (normalized === 'facebook') {
    return 'Facebook';
  }

  if (normalized === 'instagram') {
    return 'Instagram';
  }

  if (normalized === 'linkedin') {
    return 'LinkedIn';
  }

  if (normalized === 'youtube') {
    return 'YouTube';
  }

  if (
    normalized === 'twitter' ||
    normalized === 'x'
  ) {
    return 'X';
  }

  if (normalized === 'pinterest') {
    return 'Pinterest';
  }

  return platform;
}


/* =====================================================
   STATUS HELPERS
===================================================== */

function normalizeStatus(
  status: any
): string {
  return String(status || '')
    .toLowerCase()
    .trim();
}


function getStatusTitle(
  status: Exclude<StatusFilter, null>
): string {

  switch (status) {

    case 'draft':
      return 'My Drafts';

    case 'pending_approval':
      return 'Pending Approval';

    case 'scheduled':
      return 'Scheduled';

    case 'published':
      return 'Published';

    case 'failed':
      return 'Failed Posts';

    case 'cancelled':
      return 'Cancelled Posts';

    default:
      return 'Posts';

  }
}


function getStatusIcon(
  status: Exclude<StatusFilter, null>
) {

  switch (status) {

    case 'draft':
      return FileText;

    case 'pending_approval':
      return Clock;

    case 'scheduled':
      return Calendar;

    case 'published':
      return CheckCircle;

    case 'failed':
      return AlertCircle;

    case 'cancelled':
      return XCircle;

    default:
      return FileText;

  }
}


function formatStatus(
  status: string
): string {

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


function getStatusBadgeClass(
  status: string
): string {

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
      return `${base} bg-red-100 text-red-700`;

    case 'cancelled':
      return `${base} bg-gray-100 text-gray-600`;

    default:
      return `${base} bg-gray-100 text-gray-700`;

  }
}


/* =====================================================
   SORTING HELPERS
===================================================== */

function getPostSortDate(
  post: any
): number {

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

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}


/* =====================================================
   DATE/TIME
===================================================== */

function formatDateTime(
  value: string | null
): string {

  if (!value) {
    return 'Not available';
  }

  try {

    return new Date(value).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }
    );

  } catch {

    return value;

  }
}


/* =====================================================
   BUSINESS USER DASHBOARD
===================================================== */

function BusinessUserDashboard({
  username,
  posts,
  campaigns,
  accounts,
}: {
  username: string;
  posts: any[];
  campaigns: any[];
  accounts: any[];
}) {

  const scheduledPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) === 'scheduled'
    ).length;

  const publishedPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) === 'published'
    ).length;

  const failedPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) === 'failed'
    ).length;

  const cancelledPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) === 'cancelled'
    ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Monitor your business social media performance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Connected Accounts"
          value={accounts.length}
          icon={Share2}
        />

        <StatCard
          title="Active Campaigns"
          value={campaigns.length}
          icon={Megaphone}
        />

        <StatCard
          title="Scheduled Posts"
          value={scheduledPosts}
          icon={Calendar}
        />

        <StatCard
          title="Published Posts"
          value={publishedPosts}
          icon={FileText}
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <DashboardCard
          title="Social Accounts"
          icon={Share2}
        >

          {accounts.length === 0 ? (

            <div className="text-center py-8">

              <Share2 className="w-8 h-8 mx-auto text-gray-400" />

              <p className="mt-3 text-sm text-gray-500">
                No social accounts connected.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {accounts
                .slice(0, 5)
                .map((account: any) => (

                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >

                    <div>

                      <p className="text-sm font-medium text-gray-900">
                        {account.platform ||
                          'Social Account'}
                      </p>

                      <p className="text-xs text-gray-500">
                        {account.username ||
                          account.account_name ||
                          'Connected'}
                      </p>

                    </div>

                    <span className="text-xs font-medium text-emerald-600">
                      Connected
                    </span>

                  </div>

                ))}

            </div>

          )}

        </DashboardCard>

        <DashboardCard
          title="Recent Campaigns"
          icon={Megaphone}
        >

          {campaigns.length === 0 ? (

            <p className="text-sm text-gray-500">
              No campaigns available.
            </p>

          ) : (

            <div className="space-y-3">

              {campaigns
                .slice(0, 5)
                .map((campaign: any) => (

                  <div
                    key={campaign.id}
                    className="p-3 rounded-xl bg-gray-50"
                  >

                    <p className="text-sm font-medium text-gray-900">
                      {campaign.title ||
                        'Campaign'}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {campaign.status ||
                        'Active'}
                    </p>

                  </div>

                ))}

            </div>

          )}

        </DashboardCard>

      </div>

      {/* Post status summary */}

      <DashboardCard
        title="Post Status Summary"
        icon={BarChart3}
      >

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <MiniStatus
            label="Scheduled"
            value={scheduledPosts}
            className="bg-blue-50 text-blue-700"
          />

          <MiniStatus
            label="Published"
            value={publishedPosts}
            className="bg-emerald-50 text-emerald-700"
          />

          <MiniStatus
            label="Failed"
            value={failedPosts}
            className="bg-red-50 text-red-700"
          />

          <MiniStatus
            label="Cancelled"
            value={cancelledPosts}
            className="bg-gray-100 text-gray-700"
          />

        </div>

      </DashboardCard>

    </div>
  );
}


/* =====================================================
   SHARED COMPONENTS
===================================================== */

function DashboardHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {

  return (
    <div>

      <h1 className="text-2xl font-bold text-gray-900">
        {title}
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

    </div>
  );
}


function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: any;
}) {

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">

          <Icon className="w-5 h-5 text-indigo-600" />

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   CLICKABLE STATUS CARD
===================================================== */

function StatusCard({
  title,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: any;
  active: boolean;
  onClick: () => void;
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left
        bg-white rounded-2xl border p-5 shadow-sm
        transition-all duration-200
        cursor-pointer
        ${
          active
            ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md'
            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
        }
      `}
    >

      <div className="flex items-center justify-between">

        <div>

          <p
            className={`text-sm font-medium ${
              active
                ? 'text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            active
              ? 'bg-indigo-100'
              : 'bg-indigo-50'
          }`}
        >

          <Icon
            className={`w-5 h-5 ${
              active
                ? 'text-indigo-700'
                : 'text-indigo-600'
            }`}
          />

        </div>

      </div>

      <p
        className={`mt-3 text-xs ${
          active
            ? 'text-indigo-600'
            : 'text-gray-400'
        }`}
      >
        {active
          ? 'Click again to close'
          : 'Click to view posts'}
      </p>

    </button>
  );
}


function MiniStatus({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>

      <p className="text-xs font-medium opacity-80">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


function DashboardCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

      <div className="flex items-center gap-2 mb-5">

        <Icon className="w-5 h-5 text-indigo-600" />

        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

      </div>

      {children}

    </div>
  );
}


function OverviewRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">

      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
}


function ActivityRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">

      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
}