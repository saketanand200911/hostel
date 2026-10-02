import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'warden' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const authUserStr = localStorage.getItem('campushaven_user');

  if (!authUserStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const authUser = JSON.parse(authUserStr);
    if (allowedRoles && !allowedRoles.includes(authUser.role)) {
      // Redirect based on current role
      if (authUser.role === 'student') {
        return <Navigate to="/student" replace />;
      } else {
        return <Navigate to="/admin" replace />;
      }
    }
  } catch {
    localStorage.removeItem('campushaven_user');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

