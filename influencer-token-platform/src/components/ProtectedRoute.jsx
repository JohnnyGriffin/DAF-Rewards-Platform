// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

/**
 * Wraps child components in an auth check; if no user, redirects to login.
 */
function ProtectedRoute({ children }) {
  if (!auth.currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
