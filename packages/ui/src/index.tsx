import type { ReactNode } from 'react';

/** Composition boundary only; DS tokens and interactive components are BK-008. */
export function PageContent({ children }: { readonly children: ReactNode }) {
  return <main>{children}</main>;
}
