// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';



function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status on mount
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Login handler: set auth state and persist to localStorage
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  // Logout handler: clear auth state and localStorage
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </Router>
  );
}

function AppContent({ isAuthenticated, onLogin, onLogout }) {
  const location = useLocation();

  // Determine if current path is an auth-related page
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Only show Navbar and Sidebar on non-auth pages */}
      {!isAuthPage && <Navbar onLogout={onLogout} />}
      {!isAuthPage && <Sidebar />}
      
      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Toolbar for spacing when Navbar is present */}
        {!isAuthPage && <Toolbar />}
        <Routes>
          {/* Default route */}
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />

          {/* Login route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={onLogin} />
            }
          />

          {/* Signup route */}
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Signup onSignup={onLogin} />
            }
          />

          {/* Optional: Add a catch-all 404 route */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default AppWrapper;
