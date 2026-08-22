import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { DashboardLayout } from './layouts/DashboardLayout';

import { DashboardPage } from './pages/DashboardPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { PublishingHubPage } from './pages/PublishingHubPage';
import { ProfilePage } from './pages/ProfilePage';
import { SocialAccountsPage } from './pages/SocialAccountsPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CalendarPage } from './pages/CalendarPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationHistoryPage } from './pages/NotificationHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { MyClientsPage } from './pages/MyClientsPage';
import { MyMarketingTeamPage } from './pages/MyMarketingTeamPage';
import { ClientWorkspacePage } from './pages/ClientWorkspacePage';
import { DraftsPage } from './pages/DraftsPage';
import { TeamActivityPage } from './pages/TeamActivityPage';

/* =========================================================
   ADMIN PAGES
========================================================= */

import { UsersPage } from './pages/UsersPage';
import { BusinessAccountsPage } from './pages/BusinessAccountsPage';
import { MarketingTeamsPage } from './pages/MarketingTeamsPage';
import { ContentCreatorsPage } from './pages/ContentCreatorsPage';
import { ReportsPage } from './pages/ReportsPage';

import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />


        {/* =====================================================
            PROTECTED APPLICATION ROUTES
        ===================================================== */}

        <Route
          path="/app"
          element={<ProtectedRoute />}
        >
          <Route element={<DashboardLayout />}>

            {/* =================================================
                /app → /app/dashboard
            ================================================= */}

            <Route
              index
              element={
                <Navigate
                  to="/app/dashboard"
                  replace
                />
              }
            />


            {/* =================================================
                DASHBOARD
                All authenticated users
            ================================================= */}

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />


            {/* =================================================
                ADMINISTRATOR - USERS
            ================================================= */}

            <Route
              path="users"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<UsersPage />}
              />
            </Route>


            {/* =================================================
                ADMINISTRATOR - BUSINESS ACCOUNTS
            ================================================= */}

            <Route
              path="business-accounts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<BusinessAccountsPage />}
              />
            </Route>


            {/* =================================================
                ADMINISTRATOR - MARKETING TEAMS
            ================================================= */}

            <Route
              path="marketing-teams"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<MarketingTeamsPage />}
              />
            </Route>


            {/* =================================================
                ADMINISTRATOR - CONTENT CREATORS
            ================================================= */}

            <Route
              path="content-creators"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<ContentCreatorsPage />}
              />
            </Route>


            {/* =================================================
                REPORTS
                Administrator + Marketing Team + Business User
            ================================================= */}

            <Route
              path="reports"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<ReportsPage />}
              />
            </Route>


            {/* =================================================
                MY POSTS
                All four roles
            ================================================= */}

            <Route
              path="posts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<MyPostsPage />}
              />
            </Route>


            {/* =================================================
                PUBLISHING HUB
                Marketing Team + Content Creator + Business User
            ================================================= */}

            <Route
              path="publishing"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<PublishingHubPage />}
              />
            </Route>


            {/* =================================================
                PROFILE
                All authenticated users
            ================================================= */}

            <Route
              path="profile"
              element={<ProfilePage />}
            />


            {/* =================================================
                SOCIAL ACCOUNTS
                All four roles
            ================================================= */}

            <Route
              path="accounts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'business_user',
                    'content_creator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<SocialAccountsPage />}
              />
            </Route>


            {/* =================================================
                BUSINESS USER - MY MARKETING TEAM
            ================================================= */}

            <Route
              path="my-marketing-team"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<MyMarketingTeamPage />}
              />
            </Route>


            {/* =================================================
                MARKETING TEAM - MY CLIENTS
            ================================================= */}

            <Route
              path="clients"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'marketing_team',
                  ]}
                />
              }
            >
              <Route
                index
                element={<MyClientsPage />}
              />

              <Route
                path=":clientId"
                element={<ClientWorkspacePage />}
              />
            </Route>


            {/* =================================================
                CREATE POST
                Content Creator + Marketing Team
            ================================================= */}

            <Route
              path="create-post"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'content_creator',
                    'marketing_team',
                  ]}
                />
              }
            >
              <Route
                index
                element={<CreatePostPage />}
              />
            </Route>


            {/* =================================================
                DRAFTS
                Content Creator + Marketing Team
            ================================================= */}

            <Route
              path="drafts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'content_creator',
                    'marketing_team',
                  ]}
                />
              }
            >
              <Route
                index
                element={<DraftsPage />}
              />
            </Route>


            {/* =================================================
                CALENDAR
                Marketing Team + Content Creator + Business User
            ================================================= */}

            <Route
              path="calendar"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<CalendarPage />}
              />
            </Route>


            {/* =================================================
                CAMPAIGNS
                All four roles
            ================================================= */}

            <Route
              path="campaigns"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<CampaignsPage />}
              />
            </Route>


            {/* =================================================
                ANALYTICS
                Administrator + Marketing Team + Business User
            ================================================= */}

            <Route
              path="analytics"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'business_user',
                     'content_creator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<AnalyticsPage />}
              />
            </Route>


            {/* =================================================
                NOTIFICATIONS
                All four roles
            ================================================= */}

            <Route
              path="notifications"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<NotificationsPage />}
              />
            </Route>


            {/* =================================================
                NOTIFICATION HISTORY
                All four roles
            ================================================= */}

            <Route
              path="notification-history"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<NotificationHistoryPage />}
              />
            </Route>


            {/* =================================================
                TEAM ACTIVITY
                All four roles
            ================================================= */}

            <Route
              path="team-activity"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'marketing_team',
                    'content_creator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<TeamActivityPage />}
              />
            </Route>


            {/* =================================================
                SETTINGS
                Administrator only
            ================================================= */}

            <Route
              path="settings"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                  ]}
                />
              }
            >
              <Route
                index
                element={<SettingsPage />}
              />
            </Route>

          </Route>
        </Route>


        {/* =====================================================
            CATCH-ALL ROUTE
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;