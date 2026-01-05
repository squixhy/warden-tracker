import React, { useState, useCallback } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import CheckInFlow from './components/CheckInFlow.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import './styles.css';

const VIEW = {
  HOME: 'home',
  CHECK_IN: 'checkIn',
  USER_DASHBOARD: 'userDashboard',
  ADMIN: 'admin'
};

export default function App() {
  const [currentView, setCurrentView] = useState(VIEW.HOME);
  const [activeSession, setActiveSession] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleCheckInSuccess = useCallback((wardenData) => {
    setActiveSession(wardenData);
    setCurrentView(VIEW.USER_DASHBOARD);
  }, []);

  const handleClockOff = useCallback(() => {
    setActiveSession(null);
    setCurrentView(VIEW.HOME);
  }, []);

  const handleAdminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    setCurrentView(VIEW.HOME);
  }, []);

  const navigateTo = useCallback((view) => {
    setCurrentView(view);
  }, []);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.png" alt="University of Winchester" className="logo-img" />
            <div className="logo-text">
              <span className="logo-title">Fire Warden System</span>
              <span className="logo-subtitle">University of Winchester</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="main">
        {currentView === VIEW.HOME && (
          <HomeScreen
            onCheckIn={() => navigateTo(VIEW.CHECK_IN)}
            onAdmin={() => navigateTo(VIEW.ADMIN)}
          />
        )}

        {currentView === VIEW.CHECK_IN && (
          <CheckInFlow
            onBack={() => navigateTo(VIEW.HOME)}
            onCheckInSuccess={handleCheckInSuccess}
          />
        )}

        {currentView === VIEW.USER_DASHBOARD && activeSession && (
          <UserDashboard
            session={activeSession}
            onClockOff={handleClockOff}
            onUpdateSession={setActiveSession}
            onBack={() => navigateTo(VIEW.HOME)}
          />
        )}

        {currentView === VIEW.ADMIN && (
          <AdminDashboard
            isAuthenticated={isAdminAuthenticated}
            onAuthenticate={() => setIsAdminAuthenticated(true)}
            onLogout={handleAdminLogout}
            onBack={() => navigateTo(VIEW.HOME)}
          />
        )}
      </main>
    </div>
  );
}