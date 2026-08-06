
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
import { ProfilePage } from './pages/ProfilePage';
import { SocialAccountsPage } from './pages/SocialAccountsPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CalendarPage } from './pages/CalendarPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MyClientsPage } from './pages/MyClientsPage';
import { MyMarketingTeamPage } from './pages/MyMarketingTeamPage';
import { ClientWorkspacePage } from './pages/ClientWorkspacePage';

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
          <Route
            element={<DashboardLayout />}
          >

            {/* /app → /app/dashboard */}

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
            ================================================= */}

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />


            {/* =================================================
                PROFILE
            ================================================= */}

            <Route
              path="profile"
              element={<ProfilePage />}
            />


            {/* =================================================
                SOCIAL ACCOUNTS
            ================================================= */}

            <Route
              path="accounts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
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
            ================================================= */}

            <Route
              path="create-post"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'content_creator',
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
                CALENDAR
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
            ================================================= */}

            <Route
              path="campaigns"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'marketing_team',
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
            ================================================= */}

            <Route
              path="analytics"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'marketing_team',
                    'business_user',
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
            ================================================= */}

            <Route
              path="notifications"
              element={<NotificationsPage />}
            />


            {/* =================================================
                SETTINGS
            ================================================= */}

            <Route
              path="settings"
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

