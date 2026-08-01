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

        {/* Public Routes */}

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


        {/* Protected Application Routes */}

        <Route
          path="/app"
          element={<ProtectedRoute />}
        >
          <Route
            element={<DashboardLayout />}
          >

            {/* /app */}

            <Route
              index
              element={
                <Navigate
                  to="/app/dashboard"
                  replace
                />
              }
            />


            {/* Dashboard */}

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />


            {/* Social Accounts */}

            <Route
              path="accounts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'administrator',
                    'business_user',
                  ]}
                />
              }
            >
              <Route
                index
                element={<SocialAccountsPage />}
              />
            </Route>


            {/* Business User - Marketing Team */}

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


            {/* Marketing Team - My Clients */}

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
              {/* /app/clients */}

              <Route
                index
                element={<MyClientsPage />}
              />

              {/* /app/clients/:clientId */}

              <Route
                path=":clientId"
                element={<ClientWorkspacePage />}
              />
            </Route>


            {/* Create Post */}

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


            {/* Calendar */}

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


            {/* Campaigns */}

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


            {/* Analytics */}

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


            {/* Notifications */}

            <Route
              path="notifications"
              element={<NotificationsPage />}
            />


            {/* Administrator Settings */}

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


        {/* Catch-All Route */}

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