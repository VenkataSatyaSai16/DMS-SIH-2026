import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Files, 
  Users, 
  ShieldAlert, 
  Building,
  User,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/cases', label: 'Cases & Evidence', icon: Files },
    { path: '/units', label: 'Organization Units', icon: Building },
    { path: '/users', label: 'Users & Roles', icon: Users },
    { path: '/audit', label: 'Audit Logs', icon: ShieldAlert },
    { path: '/profile', label: 'My Officer Profile', icon: User },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Portal Navigation
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '4px',
                color: isActive ? 'var(--govt-navy)' : 'var(--text-secondary)',
                background: isActive ? '#e0f2fe' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '4px solid var(--govt-navy)' : '4px solid transparent',
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <item.icon size={18} color={isActive ? 'var(--govt-navy)' : '#64748b'} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} color="var(--govt-navy)" />}
            </Link>
          );
        })}
      </nav>

      {user?.organizationUnit && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', background: '#f8fafc', margin: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASSIGNED UNIT</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--govt-navy)', marginTop: '2px' }}>
            {user.organizationUnit.name}
          </div>
        </div>
      )}
    </aside>
  );
};
