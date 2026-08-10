import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import  RegisterPage  from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import  AnalyticsPage  from "./pages/AnalyticsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/app/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/app/analytics" 
          element={<AnalyticsPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;