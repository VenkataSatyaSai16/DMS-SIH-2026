import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, LogOut, User, Menu, X } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Official Government Fixed Header Navbar */}
      <header className="app-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Hamburger Menu Toggle Button */}
          <button 
            className="header-toggle-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Menu"
            title="Toggle Menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', textDecoration: 'none' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)', 
              padding: '6px', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Secure DMS
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.85, color: '#e2e8f0', display: 'block' }}>
                Law Enforcement & Case Portal
              </div>
            </div>
          </Link>
        </div>

        {/* User Badge & Profile Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#ffffff', 
                textDecoration: 'none',
                background: location.pathname === '/profile' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                padding: '5px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '0.85rem'
              }}
              title="View Officer Profile"
            >
              <User size={16} color="#ffffff" />
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              {user.role && (
                <span className="badge badge-secondary" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                  {user.role.name || user.role}
                </span>
              )}
            </Link>
          )}

          <button 
            onClick={logout}
            style={{ 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.4)', 
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Sign Out of Portal"
          >
            <LogOut size={14} />
            <span style={{ display: 'inline' }}>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="page-container">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} />
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className={`main-content ${!isSidebarOpen ? '' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
