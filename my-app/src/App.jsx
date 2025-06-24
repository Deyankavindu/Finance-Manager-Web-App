import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';

// Helper component to protect routes
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null while loading
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync transactions to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Check auth status on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(storedAuth === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  // While auth state is loading, show nothing or a loader
  if (isAuthenticated === null) {
    return null; // or a loader spinner
  }

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        transactions={transactions}
        setTransactions={setTransactions}
      />
    </Router>
  );
}

function AppContent({ isAuthenticated, onLogin, onLogout, transactions, setTransactions }) {
  const location = useLocation();

  // Detect if current path is an auth page (including nested routes)
  const isAuthPage = ['/login', '/signup'].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Show Navbar & Sidebar only if not on auth pages */}
      {!isAuthPage && <Navbar onLogout={onLogout} />}
      {!isAuthPage && <Sidebar />}

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {!isAuthPage && <Toolbar />}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard
                  transactions={transactions}
                  setTransactions={setTransactions}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={onLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Signup onSignup={onLogin} />
              )
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ReportsPage transactions={transactions} />
              </ProtectedRoute>
            }
          />
          {/* Fallback route */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? '/' : '/login'} replace />
            }
          />
          <Route
  path="/settings"
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <SettingsPage />
    </ProtectedRoute>
  }
/>
        </Routes>
      </Box>
    </Box>
  );
}

export default AppWrapper;
