import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import authBg from '../assets/auth_bg.png';

const AuthLayout = () => {
  const user = useAuthStore((state) => state.user);

  // If already authenticated, redirect away from auth screens to dashboard/main app
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-split-container">
      {/* Left side cover pane (hidden on mobile) */}
      <div className="auth-image-pane">
        <img
          src={authBg}
          alt="GearCart Workstation Hardware Store"
          className="auth-brand-image"
        />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          <h2 className="auth-image-title">GearCart</h2>
          <p className="auth-image-subtitle">
            Experience next-generation speed. Browse, create, and manage high-performance workstation gear with our modular and secure marketplace platform.
          </p>
        </div>
      </div>

      {/* Right side form container (clean, flat, borderless) */}
      <div className="auth-form-pane">
        <div className="auth-form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
export { AuthLayout };
