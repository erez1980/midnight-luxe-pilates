import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Native modal dialogs provide inert background, focus trapping and Escape.
// Rendering outside the app avoids fixed headers covering the modal.
export default function Dialog({ open, onClose, label, children, className = '' }: {
  open: boolean; onClose: () => void; label: string; children: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <dialog ref={ref} aria-label={label} aria-modal="true" onCancel={(event) => { event.preventDefault(); closeRef.current(); }}
      className={`m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl border border-outline/40 bg-surface-container-high p-6 text-on-surface shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm ${className}`}>
      {children}
    </dialog>, document.body,
  );
}
