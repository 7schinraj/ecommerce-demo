import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    // Redirect to login page while preserving the attempted URL path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but role is unauthorized, redirect back to root home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
export { PrivateRoute };
