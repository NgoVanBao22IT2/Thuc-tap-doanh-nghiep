import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Nếu user thường cố truy cập admin page
  if (adminOnly && currentUser.role === 'admin') {
    return children;
  }

  // Nếu admin cố truy cập user page thì redirect về admin
  if (!adminOnly && currentUser.role === 'admin' && location.pathname !== '/profile') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
