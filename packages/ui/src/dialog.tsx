'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from './button.js';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  busy?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
}
export function Dialog({ open, onClose, title, description, closeLabel, busy = false, children, actions }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    headingRef.current?.focus();
    return () => { if (dialog.open) dialog.close(); if (trigger?.isConnected) trigger.focus(); };
  }, [open]);
  return <dialog ref={dialogRef} className="ds-dialog" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}
    aria-busy={busy || undefined} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    // Ignore a queued close event from effect cleanup if Strict Mode has reopened the dialog.
    onClose={(event) => { if (open && !event.currentTarget.open) onClose(); }}
    onKeyDown={(event) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;
      const stops = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex], [contenteditable]'))
        .filter((element) => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
      const first = stops[0]; const last = stops.at(-1);
      if (!first || !last) { event.preventDefault(); headingRef.current?.focus(); return; }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !stops.includes(active as HTMLElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
    }}>
    <div className="ds-dialog-heading"><h2 ref={headingRef} tabIndex={-1} id={`${id}-title`}>{title}</h2>
      <Button variant="ghost" disabled={busy} onClick={onClose} aria-label={closeLabel}><span aria-hidden="true">×</span></Button></div>
    {description && <p className="ds-secondary" id={`${id}-description`}>{description}</p>}
    {children && <div className="ds-dialog-content">{children}</div>}
    {actions && <div className="ds-dialog-actions">{actions}</div>}
  </dialog>;
}
