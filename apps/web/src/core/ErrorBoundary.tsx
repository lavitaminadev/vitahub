import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h1>Algo salió mal</h1>
        <p style={{ color: '#666' }}>{this.state.error?.message}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Recargar página
        </button>
      </div>
    );
  }
}
