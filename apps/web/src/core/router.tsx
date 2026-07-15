import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFoundPage } from '../features/not-found/NotFoundPage';

const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ClientsPage = lazy(() => import('../features/clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
const LeadsPage = lazy(() => import('../features/crm/LeadsPage').then(m => ({ default: m.LeadsPage })));
const ProductionPage = lazy(() => import('../features/production/ProductionPage').then(m => ({ default: m.ProductionPage })));
const ContentGridPage = lazy(() => import('../features/content/ContentGridPage').then(m => ({ default: m.ContentGridPage })));
const ApprovalsPage = lazy(() => import('../features/approvals/ApprovalsPage').then(m => ({ default: m.ApprovalsPage })));
const MeetingsPage = lazy(() => import('../features/meetings/MeetingsPage').then(m => ({ default: m.MeetingsPage })));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const IntegrationsPage = lazy(() => import('../features/integrations/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const OperationsPage = lazy(() => import('../features/operations/OperationsPage').then(m => ({ default: m.OperationsPage })));
const DirectionPage = lazy(() => import('../features/direction/DirectionPage').then(m => ({ default: m.DirectionPage })));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}><p>Cargando...</p></div>}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<SuspenseWrapper><DashboardPage /></SuspenseWrapper>} />
          <Route path="/clients" element={<SuspenseWrapper><ClientsPage /></SuspenseWrapper>} />
          <Route path="/crm/leads" element={<SuspenseWrapper><LeadsPage /></SuspenseWrapper>} />
          <Route path="/production" element={<SuspenseWrapper><ProductionPage /></SuspenseWrapper>} />
          <Route path="/content" element={<SuspenseWrapper><ContentGridPage /></SuspenseWrapper>} />
          <Route path="/approvals" element={<SuspenseWrapper><ApprovalsPage /></SuspenseWrapper>} />
          <Route path="/meetings" element={<SuspenseWrapper><MeetingsPage /></SuspenseWrapper>} />
          <Route path="/reports" element={<SuspenseWrapper><ReportsPage /></SuspenseWrapper>} />
          <Route path="/settings" element={<SuspenseWrapper><SettingsPage /></SuspenseWrapper>} />
          <Route path="/integrations" element={<SuspenseWrapper><IntegrationsPage /></SuspenseWrapper>} />
          <Route path="/operations" element={<SuspenseWrapper><OperationsPage /></SuspenseWrapper>} />
          <Route path="/direction" element={<SuspenseWrapper><DirectionPage /></SuspenseWrapper>} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
