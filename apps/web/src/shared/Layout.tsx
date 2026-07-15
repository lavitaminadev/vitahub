import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../core/auth';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Clientes', path: '/clients', icon: '👥' },
  { label: 'Leads CRM', path: '/crm/leads', icon: '🎯' },
  { label: 'Producción', path: '/production', icon: '🎨' },
  { label: 'Contenido', path: '/content', icon: '📝' },
  { label: 'Aprobaciones', path: '/approvals', icon: '✅' },
  { label: 'Reuniones', path: '/meetings', icon: '📅' },
  { label: 'Reportes', path: '/reports', icon: '📈' },
  { label: 'Operaciones', path: '/operations', icon: '⚙️' },
  { label: 'Dirección', path: '/direction', icon: '🎯' },
  { label: 'Integraciones', path: '/integrations', icon: '🔗' },
  { label: 'Configuración', path: '/settings', icon: '⚙️' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>VITAHUB</h2>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
