import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

// The internal component demonstration is a development-only page extension.
// Production builds never register page.demo.tsx as an application route.
export default function config(phase: string): NextConfig {
  return {
    transpilePackages: ['@agenda/ui'],
    poweredByHeader: false,
    pageExtensions: phase === PHASE_DEVELOPMENT_SERVER ? ['ts', 'tsx', 'demo.tsx'] : ['ts', 'tsx'],
  };
}
