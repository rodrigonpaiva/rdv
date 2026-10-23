import { spawnSync } from 'node:child_process';
for (const script of ['test:boundaries', 'build', 'smoke']) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script], { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
