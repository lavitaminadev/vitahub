/**
 * @fileoverview Accessible modal dialog with Escape-to-close and backdrop click.
 */

import { useCallback, useEffect, useRef, type JSX, type ReactNode } from 'react';

/**
 * Props for the modal component.
 */
export interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Callback invoked when the modal should close. */
  onClose: () => void;
  /** Modal title shown in the header. */
  title: string;
  /** Modal body content. */
  children: ReactNode;
}

/**
 * Renders a modal overlay.
 */
export function Modal({ open, onClose, title, children }: ModalProps): JSX.Element | null {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, handleEsc]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal" type="button">
            x
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
