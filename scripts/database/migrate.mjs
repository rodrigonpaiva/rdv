import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { realpath } from 'node:fs/promises';

export function localDatabaseUrl(value, role) {
  if (!['test', 'development'].includes(process.env.APP_ENV)) throw new Error('Local database commands require APP_ENV=test or development');
  let url;
  try { url = new URL(value); } catch { throw new Error('A valid local database URL is required'); }
  if (!['postgresql:', 'postgres:'].includes(url.protocol) ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      !['/rdv_test', '/rdv_dev'].includes(url.pathname) ||
      decodeURIComponent(url.username) !== role || !url.password || url.search || url.hash) {
    throw new Error('Database target must be a local rdv_test/rdv_dev database with the expected role and no URL options');
  }
  return url;
}

export function migrate(value) {
  const url = localDatabaseUrl(value, 'rdv_migration');
  const result = spawnSync(process.execPath, [
    fileURLToPath(new URL('../../node_modules/prisma/build/index.js', import.meta.url)),
    'migrate', 'deploy', '--config', 'database/prisma.config.ts',
  ], { encoding: 'utf8', env: { ...process.env, MIGRATION_DATABASE_URL: url.href } });
  // Prisma output is intentionally not forwarded: configuration/connection errors may contain secrets.
  if (result.error || result.status !== 0) throw new Error('Migration deploy failed; check local provisioning and migration SQL (connection output withheld)');
  console.log('Prisma migrate deploy passed');
}

if (process.argv[1] && await realpath(process.argv[1]).catch(() => null) === fileURLToPath(import.meta.url)) {
  try { migrate(process.env.MIGRATION_DATABASE_URL); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
