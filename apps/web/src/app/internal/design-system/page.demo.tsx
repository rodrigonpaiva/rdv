import type { Metadata } from 'next';
import { DesignSystemDemo } from './showcase';

export const metadata: Metadata = { title: 'Design system · Internal', robots: { index: false, follow: false } };
export default function DesignSystemPage() { return <DesignSystemDemo />; }
