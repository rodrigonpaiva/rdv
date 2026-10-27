import type { HTMLAttributes, ReactNode } from 'react';

export function PublicHeader({ brand = 'Agenda / BR', children }: { brand?: ReactNode; children?: ReactNode }) {
  return <header className="ds-header"><div className="ds-container ds-header-inner"><span className="ds-brand">{brand}</span>{children}</div></header>;
}

export function SkipLink({ children = 'Skip to content' }: { children?: ReactNode }) {
  return <a className="ds-skip-link" href="#main-content">{children}</a>;
}

export function PageContent({ children, className = '', id = 'main-content', ...props }: HTMLAttributes<HTMLElement>) {
  return <main {...props} tabIndex={props.tabIndex ?? -1} id={id} className={`ds-container ds-main ${className}`}>{children}</main>;
}

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  surface?: 'base' | 'canvas';
}
export function Panel({ surface = 'canvas', className = '', ...props }: PanelProps) {
  return <section {...props} className={`ds-panel ds-panel-${surface} ${className}`} />;
}
