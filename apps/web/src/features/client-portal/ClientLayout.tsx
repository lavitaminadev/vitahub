import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth';

const CLIENT_NAV = [
  { label: 'Mi Dashboard', path: '/portal', icon: '📊' },
  { label: 'Mi Parrilla', path: '/portal/grid', icon: '📝' },
  { label: 'Aprobaciones', path: '/portal/approvals', icon: '✅' },
  { label: 'Reuniones', path: '/portal/meetings', icon: '📅' },
  { label: 'Reportes', path: '/portal/reports', icon: '📈' },
];

export function ClientLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-layout">
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>☰</button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header"><h2>Mi Cuenta</h2></div>
        <nav className="sidebar-nav">
          {CLIENT_NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline btn-sm" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>
      <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
      <main className="main-content"><Outlet /></main>
    </div>
  );
}
