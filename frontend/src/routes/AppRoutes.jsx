import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout, MainLayout } from '../layouts';
import { LoginForm, SignupForm } from '../features/auth';
import PrivateRoute from './PrivateRoute';
import { useAuthStore } from '../store/authStore';
import { AdminDashboard } from '../features/Admin';
import { adminApi } from '../features/Admin/AdminApi';
import { 
  Search, Filter, ShoppingBag, ChevronLeft, ChevronRight, 
  Package, Star 
} from 'lucide-react';
import { Button, Alert, Select } from '../components/ui';

import { CustomerDashboard } from '../features/Customer/CustomerDashboard';

// --- 2. CORE GATE ROUTER ---
const RootDashboard = () => {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <CustomerDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth routes embedded within Split Screen Cover frame */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Route>

      {/* Secure private paths mapped within Navigated Header frame */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<RootDashboard />} />
      </Route>

      {/* Fallback route redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
export { AppRoutes };
