<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SocialAccountsPage from "./pages/SocialAccountsPage";
import CreatePostPage from "./pages/CreatePostPage";
import CampaignsPage from "./pages/CampaignsPage";
import CalendarPage from "./pages/CalendarPage";

import { NotificationsPage } from "./pages/NotificationsPage";
import { NotificationSettingsPage } from "./pages/NotificationSettingsPage";
import { EmailPreferencesPage } from "./pages/EmailPreferencesPage";
import { NotificationHistoryPage } from "./pages/NotificationHistoryPage";
import { TeamActivityPage } from "./pages/TeamActivityPage";

import { SettingsPage } from "./pages/SettingsPage";
import ContentLibraryPage from "./pages/ContentLibraryPage";
import ReportsPage from "./pages/ReportsPage";
import GenerateReportPage from "./pages/GenerateReportPage";
import ReportPreviewPage from "./pages/ReportPreviewPage";
import DownloadCenterPage from "./pages/DownloadCenterPage";
import PlatformComparisonReportPage from "./pages/PlatformComparisonReportPage";

=======
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
import { SettingsPage } from './pages/SettingsPage';
import { MyClientsPage } from './pages/MyClientsPage';
import { MyMarketingTeamPage } from './pages/MyMarketingTeamPage';
import { ClientWorkspacePage } from './pages/ClientWorkspacePage';
import { DraftsPage } from './pages/DraftsPage';

import { ProtectedRoute } from './components/ProtectedRoute';
>>>>>>> origin/shravanik-latest-scheduler

function App() {
  return (
    <BrowserRouter>
      <Routes>

<<<<<<< HEAD
=======
        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

>>>>>>> origin/shravanik-latest-scheduler
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
<<<<<<< HEAD
=======
          path="/login"
          element={<LoginPage />}
        />

        <Route
>>>>>>> origin/shravanik-latest-scheduler
          path="/register"
          element={<RegisterPage />}
        />

<<<<<<< HEAD
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
  path="/signin"
  element={<LoginPage />}
/>

        {/* DASHBOARD */}
        <Route
          path="/app/dashboard"
          element={<DashboardPage />}
        />

        {/* EXISTING MODULES */}
        <Route
          path="/app/social-accounts"
          element={<SocialAccountsPage />}
        />

        <Route
          path="/app/create-post"
          element={<CreatePostPage />}
        />

        <Route
          path="/app/content-library"
          element={<ContentLibraryPage />}
        />

        <Route
          path="/app/calendar"
          element={<CalendarPage />}
        />

        <Route
          path="/app/campaigns"
          element={<CampaignsPage />}
        />

        <Route
          path="/app/analytics"
          element={<AnalyticsPage />}
        />


        <Route
          path="/app/notifications"
          element={<NotificationsPage />}
        />

        <Route
          path="/app/notifications/history"
          element={<NotificationHistoryPage />}
        />

        <Route
          path="/app/notifications/settings"
          element={<NotificationSettingsPage />}
        />

        <Route
          path="/app/notifications/email-preferences"
          element={<EmailPreferencesPage />}
        />

        <Route
          path="/app/notifications/team-activity"
          element={<TeamActivityPage />}
        />


<Route
  path="/app/reports"
  element={<ReportsPage />}
/>

<Route
  path="/app/reports/generate"
  element={<GenerateReportPage />}
/>

<Route
  path="/app/reports/preview"
  element={<ReportPreviewPage />}
/>

<Route
  path="/app/reports/downloads"
  element={<DownloadCenterPage />}
/>

<Route
  path="/app/reports/platform-comparison"
  element={<PlatformComparisonReportPage />}
/>

        {/* SETTINGS */}
        <Route
          path="/app/settings"
          element={<SettingsPage />}
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={<Navigate to="/app/dashboard" replace />}
=======

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
                MY POSTS
                All four roles can access My Posts
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
                Content Creator only
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
                DRAFTS
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
                    'administrator',
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
                All four roles
            ================================================= */}

            <Route
              path="notifications"
              element={<NotificationsPage />}
            />


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
>>>>>>> origin/shravanik-latest-scheduler
        />

      </Routes>
    </BrowserRouter>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> origin/shravanik-latest-scheduler
