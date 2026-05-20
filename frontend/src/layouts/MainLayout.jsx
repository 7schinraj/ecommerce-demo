import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, ShoppingBag, User } from 'lucide-react';
import { Button } from '../components/ui';

const MainLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Mobile responsive overrides for Top Navigation Bar */}
      <style>{`
        @media (max-width: 576px) {
          .navbar-header {
            padding: 0 12px !important;
            height: 60px !important;
          }
          .navbar-brand-text {
            font-size: 1.1rem !important;
          }
          .navbar-user-container {
            gap: 8px !important;
          }
          .navbar-user-badge {
            padding: 6px 10px !important;
            font-size: 0.8rem !important;
            gap: 6px !important;
          }
          .navbar-role {
            display: none !important;
          }
          .navbar-signout-text {
            display: none !important;
          }
          .navbar-signout-btn {
            padding: 8px !important;
            min-width: auto !important;
          }
        }
      `}</style>

      {/* Premium Navbar */}
      <header
        className="navbar-header"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 var(--spacing-lg)',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--primary-color)',
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            textDecoration: 'none'
          }}
        >
          <ShoppingBag size={26} strokeWidth={2.5} />
          <span className="navbar-brand-text" style={{ color: 'var(--text-primary)' }}>GearCart</span>
        </Link>

        {user ? (
          <div className="navbar-user-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              className="navbar-user-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-color)',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
              }}
            >
              <User size={16} style={{ color: 'var(--primary-color)' }} />
              <span className="font-medium">
                {user.username}
              </span>
              <span
                className="navbar-role"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-color)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {user.role}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="navbar-signout-btn"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <LogOut size={15} />
              <span className="navbar-signout-text">Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="navbar-user-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              style={{ padding: '8px 14.5px', fontSize: '0.85rem' }}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/signup')}
              style={{ padding: '8px 14.5px', fontSize: '0.85rem' }}
            >
              Sign Up
            </Button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="main-viewport-container">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
export { MainLayout };
