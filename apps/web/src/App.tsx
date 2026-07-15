import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './core/auth';
import { AppRouter } from './core/router';
import { ErrorBoundary } from './core/ErrorBoundary';

const queryClient = new QueryClient();

function AppContent() {
  const checkAuth = useAuth(s => s.checkAuth);
  useEffect(() => { checkAuth(); }, [checkAuth]);
  return <AppRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
