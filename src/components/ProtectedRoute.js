// src/components/ProtectedRoute.js
//
// Wraps any route that requires authentication.
// If no token exists, redirects to /login instead of showing the page.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
