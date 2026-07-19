/**
 * @fileoverview Global error boundary that catches render errors.
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  /** Application tree to wrap. */
  children: ReactNode;
  /** Optional error reporter callback (e.g. Sentry). */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches JavaScript errors anywhere in the child component tree and renders a
 * fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
    this.props.onError?.(error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h1>Algo salió mal</h1>
        <p style={{ color: '#666' }}>
          Ocurrió un error inesperado. Intenta recargar la página.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Recargar página
        </button>
      </div>
    );
  }
}
