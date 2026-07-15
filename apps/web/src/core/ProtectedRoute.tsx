import { Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
