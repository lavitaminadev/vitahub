/**
 * @fileoverview Application layout with responsive sidebar and role-based
 * navigation.
 */

import { useCallback, useMemo, useState, type JSX } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../core/auth';
import { getNavigation } from '../core/navigation.registry';
import { NotificationBell } from '../features/notifications/NotificationBell';

/**
 * Main layout shell rendered for authenticated users.
 *
 * Responsibilities:
 * - Render responsive sidebar.
 * - Filter navigation by user role.
 * - Provide an outlet for nested routes.
 */
export function Layout(): JSX.Element {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Compute navigation once per role change to avoid filtering on every render.
  const navItems = useMemo(() => getNavigation(user?.role), [user?.role]);

  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-layout">
      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>VITAHUB</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <NotificationBell />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="sidebar-backdrop" onClick={closeSidebar} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
