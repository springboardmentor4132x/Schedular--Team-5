import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
return (
<BrowserRouter>
<Routes>

{/* FIRST PAGE — CREATE ACCOUNT */}  
    <Route  
      path="/"  
      element={<Navigate to="/register" replace />}  
    />  

    {/* CREATE ACCOUNT — DON'T CHANGE */}  
    <Route  
      path="/register"  
      element={<RegisterPage />}  
    />  

    {/* LOGIN / SIGN IN — DON'T CHANGE */}  
    <Route  
      path="/login"  
      element={<LoginPage />}  
    />  

    {/* DASHBOARD */}  
    <Route  
      path="/app/dashboard"  
      element={<DashboardPage />}  
    />  

    {/* DASHBOARD SECTIONS */}  
    <Route  
      path="/app/social-accounts"  
      element={<DashboardPage />}  
    />  

    <Route  
      path="/app/create-post"  
      element={<DashboardPage />}  
    />  

    <Route  
      path="/app/calendar"  
      element={<DashboardPage />}  
    />  

    <Route  
      path="/app/notifications"  
      element={<DashboardPage />}  
    />  

    <Route  
      path="/app/campaigns"  
      element={<DashboardPage />}  
    />  

    {/* ANALYTICS */}  
    <Route  
      path="/app/analytics"  
      element={<AnalyticsPage />}  
    />  

    {/* UNKNOWN URL */}  
    <Route  
      path="*"  
      element={<Navigate to="/register" replace />}  
    />  

  </Routes>  
</BrowserRouter>

);
}

export default App;