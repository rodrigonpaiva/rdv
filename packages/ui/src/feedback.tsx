import type { HTMLAttributes, ReactNode } from 'react';
export type FeedbackTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export function StatusBadge({ tone = 'neutral', children }: { tone?: FeedbackTone; children: ReactNode }) {
  return <span className={`ds-badge ds-tone-${tone}`}>{children}</span>;
}
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> { tone?: FeedbackTone; title: string; children?: ReactNode }
export function Banner({ tone = 'info', title, children, className = '', ...props }: BannerProps) {
  // Consumers opt into a live role only when feedback changes, avoiding announcements on every render.
  return <div {...props} className={`ds-banner ds-tone-${tone} ${className}`}><strong>{title}</strong>{children && <div>{children}</div>}</div>;
}
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="ds-empty"><h3>{title}</h3>{children && <p>{children}</p>}{action}</div>;
}
export function Skeleton({ label, children }: { label: string; children?: ReactNode }) {
  return <div role="status" aria-label={label} className="ds-skeleton"><span aria-hidden="true">{children ?? <><span /><span /><span /></>}</span></div>;
}
