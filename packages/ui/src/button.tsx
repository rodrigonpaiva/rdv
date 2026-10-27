'use client';

import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  loading?: boolean;
  loadingLabel?: string;
}
export function Button({ variant = 'primary', loading = false, loadingLabel, children, disabled, className = '', onClick, type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ds-button ds-button-${variant} ${className}`} disabled={disabled}
    aria-busy={loading || undefined} aria-disabled={disabled || loading || undefined} data-loading={loading}
    onClick={(event) => { if (loading) { event.preventDefault(); return; } onClick?.(event); }}>
    <span className="ds-button-idle" aria-hidden={loading && Boolean(loadingLabel) || undefined}>{children}</span>
    {loadingLabel && <span className="ds-button-loading" aria-hidden={!loading}>{loadingLabel}</span>}
  </button>;
}
