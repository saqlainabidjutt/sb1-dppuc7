import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import SalesEntry from './components/SalesEntry';
import EditSale from './components/EditSale';
import DriverManagement from './components/DriverManagement';
import DriverProfile from './components/DriverProfile';
import ProfileSettingsPage from './components/pages/ProfileSettings';
import Navbar from './components/Navbar';
import SessionExpiredModal from './components/SessionExpiredModal';
import { useAuth } from './lib/auth/AuthContext';

const AppRoutes = () => {
  const { 
    isAuthenticated, 
    userRole, 
    userId, 
    userName, 
    companyId,
    settings,
    updateSettings
  } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SessionExpiredModal />
      
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard
                userRole={userRole}
                userId={userId}
                companyId={companyId}
                settings={settings}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/sales"
          element={
            isAuthenticated ? (
              <SalesEntry
                userRole={userRole}
                userId={userId}
                userName={userName}
                companyId={companyId}
                enabledPlatforms={[...settings.enabledPlatforms, ...settings.customPlatforms]}
                settings={settings}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/sales/:id/edit"
          element={
            isAuthenticated ? (
              <EditSale
                userRole={userRole}
                userId={userId}
                userName={userName}
                companyId={companyId}
                enabledPlatforms={[...settings.enabledPlatforms, ...settings.customPlatforms]}
                settings={settings}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <Reports
                userRole={userRole}
                userId={userId}
                companyId={companyId}
                settings={settings}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/drivers"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <DriverManagement
                adminId={userId}
                companyId={companyId}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/drivers/:id"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <DriverProfile />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/settings"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <ProfileSettingsPage
                onSave={updateSettings}
                initialSettings={settings}
                companyId={companyId}
                userRole={userRole}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;