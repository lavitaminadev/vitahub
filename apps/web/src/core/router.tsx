import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ClientsPage } from '../features/clients/ClientsPage';
import { LeadsPage } from '../features/crm/LeadsPage';
import { ProductionPage } from '../features/production/ProductionPage';
import { ContentGridPage } from '../features/content/ContentGridPage';
import { ApprovalsPage } from '../features/approvals/ApprovalsPage';
import { MeetingsPage } from '../features/meetings/MeetingsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { IntegrationsPage } from '../features/integrations/IntegrationsPage';
import { OperationsPage } from '../features/operations/OperationsPage';
import { DirectionPage } from '../features/direction/DirectionPage';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/crm/leads" element={<LeadsPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/content" element={<ContentGridPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/operations" element={<OperationsPage />} />
          <Route path="/direction" element={<DirectionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
