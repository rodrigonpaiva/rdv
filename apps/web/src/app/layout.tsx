import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = { title: 'Agenda / BR', description: 'Agendamento para negócios de beleza.' };

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
