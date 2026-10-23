import { spawnSync } from 'node:child_process';

// Synthetic canary only: a web build must never inline server environment values.
const marker = 'BK003_WEB_SECRET_CANARY_b431ef';
const run = spawnSync(process.execPath, ['scripts/workspaces.mjs', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    SERVER_SECRET_CANARY: marker,
    DATABASE_URL: `postgresql://synthetic:${marker}@127.0.0.1/never_connected`,
    REDIS_URL: `redis://:${marker}@127.0.0.1/0`,
  },
});
if (run.error) throw run.error;
if (run.status !== 0) process.exit(run.status ?? 1);
