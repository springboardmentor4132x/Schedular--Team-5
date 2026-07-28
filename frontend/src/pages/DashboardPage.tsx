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

type Client = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
};

export function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        if (!token) {
          return;
        }

        const storedRole =
          localStorage.getItem('user_role');

        const storedUsername =
          localStorage.getItem('username');

        const currentRole =
          (storedRole as UserRole) ||
          'business_user';

        setUser({
          username:
            storedUsername || 'User',
          role: currentRole,
        });

        const [
          postsResult,
          campaignsResult,
          accountsResult,
        ] = await Promise.allSettled([
          postService.getAll(),
          campaignService.getAll(),
          accountService.getAll(),
        ]);

        if (
          postsResult.status === 'fulfilled'
        ) {
          setPosts(
            Array.isArray(
              postsResult.value.data
            )
              ? postsResult.value.data
              : []
          );
        }

        if (
          campaignsResult.status === 'fulfilled'
        ) {
          setCampaigns(
            Array.isArray(
              campaignsResult.value.data
            )
              ? campaignsResult.value.data
              : []
          );
        }

        if (
          accountsResult.status === 'fulfilled'
        ) {
          setAccounts(
            Array.isArray(
              accountsResult.value.data
            )
              ? accountsResult.value.data
              : []
          );
        }

        if (
          currentRole === 'marketing_team'
        ) {
          try {
            const clientsResponse =
              await businessAssignmentService.getMyClients();

            console.log(
              'Marketing Team Clients:',
              clientsResponse.data
            );

            setClients(
              Array.isArray(
                clientsResponse.data
              )
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
        setLoading(false);
      }
    };

    loadDashboard();
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

  const role =
    user?.role || 'business_user';

  const username =
    user?.username || 'User';

  if (role === 'administrator') {
    return (
      <AdministratorDashboard
        username={username}
        posts={posts}
        campaigns={campaigns}
        accounts={accounts}
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
}: any) {
  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Manage your SocialPilot platform and monitor overall activity."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Users"
          value="—"
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
              value="—"
            />

            <OverviewRow
              label="Marketing Teams"
              value="—"
            />

            <OverviewRow
              label="Business Users"
              value="—"
            />

            <OverviewRow
              label="Content Creators"
              value="—"
            />

          </div>
        </DashboardCard>

        <DashboardCard
          title="Recent Activity"
          icon={Calendar}
        >
          <p className="text-sm text-gray-500">
            Platform activity and user actions
            will appear here.
          </p>
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
          value={posts.length}
          icon={Calendar}
        />

        <StatCard
          title="Published Posts"
          value="—"
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
}: any) {
  return (
    <div className="space-y-6">

      <DashboardHeader
        title={`Welcome back, ${username}`}
        description="Create and manage the content assigned to you."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="My Drafts"
          value={posts.length}
          icon={FileText}
        />

        <StatCard
          title="Pending Approval"
          value="—"
          icon={Calendar}
        />

        <StatCard
          title="Scheduled"
          value="—"
          icon={Calendar}
        />

        <StatCard
          title="Published"
          value="—"
          icon={Share2}
        />

      </div>

      <DashboardCard
        title="My Content"
        icon={FileText}
      >

        {posts.length === 0 ? (

          <div className="text-center py-10">

            <FileText className="w-8 h-8 mx-auto text-gray-400" />

            <p className="mt-3 text-sm text-gray-500">
              No content assigned yet.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {posts
              .slice(0, 5)
              .map(
                (post: any) => (

                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >

                    <p className="text-sm font-medium text-gray-900">
                      {post.content ||
                        'No content'}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Status:{' '}
                      {post.status ||
                        'Unknown'}
                    </p>

                  </div>

                )
              )}

          </div>

        )}

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
}: any) {
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
          value={posts.length}
          icon={Calendar}
        />

        <StatCard
          title="Published Posts"
          value="—"
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