/**
 * @fileoverview Loading spinner with optional helper text.
 */

import { memo, type JSX } from 'react';

/**
 * Props for the loading spinner.
 */
export interface LoadingSpinnerProps {
  /** Text shown below the spinner. */
  text?: string;
}

/**
 * Renders a centered loading indicator.
 */
export const LoadingSpinner = memo(function LoadingSpinner({ text = 'Cargando...' }: LoadingSpinnerProps): JSX.Element {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div className="spinner" />
      <p style={{ color: '#666', marginTop: '0.5rem' }}>{text}</p>
    </div>
  );
});
