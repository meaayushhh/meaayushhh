import { useEffect, useRef } from 'react';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible confirmation dialog for destructive actions (resign, new game). */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="cb-modal-scrim" onMouseDown={onCancel}>
      <div
        ref={dialogRef}
        className="cb-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cb-modal-title"
        aria-describedby={body ? 'cb-modal-body' : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="cb-modal-title" className="cb-modal__title">{title}</h2>
        {body && <p id="cb-modal-body" className="cb-modal__body">{body}</p>}
        <div className="cb-modal__actions">
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`cb-btn ${tone === 'danger' ? 'cb-btn--danger' : 'cb-btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
