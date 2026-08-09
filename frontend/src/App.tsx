import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { ContentAnalyticsPage } from './pages/ContentAnalyticsPage';
import { AudienceAnalyticsPage } from './pages/AudienceAnalyticsPage';
import { CampaignAnalyticsPage } from './pages/CampaignAnalyticsPage';
import { PlatformComparisonPage } from './pages/PlatformComparisonPage';
import { PerformanceTrendsPage } from './pages/PerformanceTrendsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';
import { EmailPreferencesPage } from './pages/EmailPreferencesPage';
import { NotificationHistoryPage } from "./pages/NotificationHistoryPage";
import { TeamActivityPage } from './pages/TeamActivityPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="accounts" element={<SocialAccountsPage />} />
          <Route path="create-post" element={<CreatePostPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="analytics/content" element={<ContentAnalyticsPage />} />
          <Route path="analytics/audience" element={<AudienceAnalyticsPage />} />
          <Route path="analytics/campaigns" element={<CampaignAnalyticsPage />} />
          <Route path="analytics/platforms" element={<PlatformComparisonPage />} />
          <Route path="analytics/trends" element={<PerformanceTrendsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="notifications/settings" element={<NotificationSettingsPage/>} />
          <Route path="notifications/email-preferences" element={<EmailPreferencesPage />} />
          <Route path="notifications/history" element={<NotificationHistoryPage />} />
          <Route path="notifications/team-activity" element={<TeamActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
