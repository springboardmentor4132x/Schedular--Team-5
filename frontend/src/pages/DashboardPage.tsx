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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  postService,
  campaignService,
  accountService,
  businessAssignmentService,
  userService,
} from '../services/api';


/* =====================================================
   TYPES
===================================================== */

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
  full_name?: string | null;
};

type Client = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
};


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

        /*
         * Common dashboard data.
         *
         * Every role can use posts/campaigns/accounts
         * according to its existing dashboard behavior.
         */
        const requests: Promise<any>[] = [
          postService.getAll(),
          campaignService.getAll(),
          accountService.getAll(),
        ];

        /*
         * Administrator additionally loads users
         * for administrator statistics.
         */
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

        /* =================================================
           POSTS
        ================================================= */

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

        /* =================================================
           CAMPAIGNS
        ================================================= */

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

        /* =================================================
           SOCIAL ACCOUNTS
        ================================================= */

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

        /* =================================================
           ADMINISTRATOR USERS
        ================================================= */

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

        /* =================================================
           MARKETING TEAM CLIENTS
        ================================================= */

        if (
          mounted &&
          currentRole === 'marketing_team'
        ) {
          try {
            const clientsResponse =
              await businessAssignmentService.getMyClients();

            if (!mounted) {
              return;
            }

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

            if (mounted) {
              setClients([]);
            }
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

  /* =====================================================
     LOADING
  ===================================================== */

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

  const role =
    user?.role || 'business_user';

  const username =
    user?.username || 'User';


  /* =====================================================
     IMPORTANT

     ONLY ONE dashboard is returned based on the
     currently logged-in user's role.

     Administrator -> AdministratorDashboard ONLY
     Marketing Team -> MarketingTeamDashboard ONLY
     Content Creator -> ContentCreatorDashboard ONLY
     Business User -> BusinessUserDashboard ONLY
  ===================================================== */

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
    (user) =>
      user.role === 'marketing_team'
  ).length;

  const businessUsers = users.filter(
    (user) =>
      user.role === 'business_user'
  ).length;

  const contentCreators = users.filter(
    (user) =>
      user.role === 'content_creator'
  ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Manage your SocialPilot platform and monitor overall activity."
      />

      {/* =================================================
          ADMIN STATISTICS
      ================================================= */}

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


      {/* =================================================
          ADMIN OVERVIEW
      ================================================= */}

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

  const [searchTerm, setSearchTerm] =
    useState('');

  const filteredClients =
    clients.filter((client) => {
      const search =
        searchTerm.toLowerCase();

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

  const scheduledPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'scheduled'
    ).length;

  const publishedPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'published'
    ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Manage your assigned clients and their social media campaigns."
      />


      {/* =================================================
          MARKETING TEAM STATISTICS
      ================================================= */}

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


      {/* =================================================
          CLIENTS
      ================================================= */}

      <DashboardCard
        title="My Clients"
        icon={Users}
      >

        <div className="mb-5 relative">

          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
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

            {filteredClients.map(
              (client) => (

                <button
                  key={client.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/app/clients/${client.id}`
                    )
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

              )
            )}

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
}: {
  username: string;
  posts: any[];
}) {
  const navigate = useNavigate();

  const drafts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'draft'
    ).length;

  const scheduled =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'scheduled'
    ).length;

  const published =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'published'
    ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Here's a quick look at your content activity."
      />


      {/* =================================================
          CONTENT CREATOR STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Posts"
          value={posts.length}
          icon={FileText}
        />

        <StatCard
          title="Drafts"
          value={drafts}
          icon={FileText}
        />

        <StatCard
          title="Scheduled"
          value={scheduled}
          icon={Calendar}
        />

        <StatCard
          title="Published"
          value={published}
          icon={BarChart3}
        />

      </div>


      {/* =================================================
          MY CONTENT
      ================================================= */}

      <DashboardCard
        title="My Content"
        icon={FileText}
      >

        <div className="text-center py-10">

          <FileText className="w-10 h-10 mx-auto text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-600">
            Manage your drafts, scheduled, and published posts
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Head over to My Posts to filter and search your content.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/app/posts')
            }
            className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to My Posts
          </button>

        </div>

      </DashboardCard>

    </div>
  );
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
        normalizeStatus(post.status) ===
        'scheduled'
    ).length;

  const publishedPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'published'
    ).length;

  const failedPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'failed'
    ).length;

  const cancelledPosts =
    posts.filter(
      (post) =>
        normalizeStatus(post.status) ===
        'cancelled'
    ).length;

  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Monitor your business social media performance."
      />


      {/* =================================================
          BUSINESS USER STATISTICS
      ================================================= */}

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


      {/* =================================================
          SOCIAL ACCOUNTS + CAMPAIGNS
      ================================================= */}

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
                .map(
                  (account: any) => (

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

                  )
                )}

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
                .map(
                  (campaign: any) => (

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

                  )
                )}

            </div>

          )}

        </DashboardCard>

      </div>


      {/* =================================================
          POST STATUS SUMMARY
      ================================================= */}

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
   STATUS HELPER
===================================================== */

function normalizeStatus(
  status: any
): string {
  return String(status || '')
    .toLowerCase()
    .trim();
}


/* =====================================================
   SHARED DASHBOARD HEADER
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


/* =====================================================
   STAT CARD
===================================================== */

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
   MINI STATUS
===================================================== */

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
    <div
      className={`rounded-xl p-4 ${className}`}
    >

      <p className="text-xs font-medium opacity-80">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   DASHBOARD CARD
===================================================== */

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


/* =====================================================
   OVERVIEW ROW
===================================================== */

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


/* =====================================================
   ACTIVITY ROW
===================================================== */

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