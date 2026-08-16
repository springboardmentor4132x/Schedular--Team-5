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


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

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
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;