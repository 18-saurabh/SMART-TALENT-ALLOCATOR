import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'employee';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    const redirectPath = userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}