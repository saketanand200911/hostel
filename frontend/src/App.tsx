import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { StickyNav } from './components/StickyNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { StudentPortal } from './pages/StudentPortal';
import { AdminConsole } from './pages/AdminConsole';
import { HelpDeskPage, NoticesPage, WeeklyTimetable } from './pages/StudentPages';

export const App: React.FC = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem('campushaven_user');
  let authUser = null;
  try {
    authUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('campushaven_user');
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen overflow-y-auto bg-[var(--primary)] transition-colors duration-300 flex flex-col">
        {authUser && location.pathname !== '/login' && <StickyNav />}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to={authUser ? (authUser.role === 'student' ? '/student' : '/admin') : '/login'} replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/timetable"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <WeeklyTimetable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notices"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <NoticesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/help"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <HelpDeskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden']}>
                  <AdminConsole />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;

