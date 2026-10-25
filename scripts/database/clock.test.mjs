import test from 'node:test';
import assert from 'node:assert/strict';
import { ManualClock } from '@agenda/testkit';
import { localDatabaseUrl } from './migrate.mjs';

test('clock is deterministic across a UTC day boundary and returns defensive dates', () => {
  const clock = new ManualClock('2026-01-15T23:59:59.999Z');
  clock.now().setUTCFullYear(2000);
  clock.advance(1);
  assert.equal(clock.now().toISOString(), '2026-01-16T00:00:00.000Z');
  assert.throws(() => new ManualClock('invalid'));
  for (const value of [-1, 0.1, Infinity, Number.MAX_SAFE_INTEGER]) assert.throws(() => clock.advance(value));
  assert.equal(clock.now().toISOString(), '2026-01-16T00:00:00.000Z');
});

test('local commands reject external targets, wrong roles and production', () => {
  const original = process.env.APP_ENV;
  try {
    process.env.APP_ENV = 'test';
    assert.ok(localDatabaseUrl('postgres://rdv_migration:synthetic@127.0.0.1:5432/rdv_test', 'rdv_migration'));
    for (const value of [undefined, 'bad', 'postgres://rdv_migration:p@remote/rdv_test',
      'postgres://rdv_app:p@localhost/rdv_test', 'postgres://rdv_migration:p@localhost/production',
      'postgres://rdv_migration:p@localhost/rdv_test?host=remote']) {
      assert.throws(() => localDatabaseUrl(value, 'rdv_migration'));
    }
    process.env.APP_ENV = 'production';
    assert.throws(() => localDatabaseUrl('postgres://rdv_migration:p@localhost/rdv_test', 'rdv_migration'));
  } finally {
    if (original === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = original;
  }
});

test('migration CLI validates configuration through canonical and symlink entry paths', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { spawnSync } = await import('node:child_process');
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rdv-migration-cli-'));
  try {
    const canonical = fileURLToPath(new URL('./migrate.mjs', import.meta.url));
    const alias = path.join(directory, 'migration-alias.mjs');
    await fs.symlink(canonical, alias);
    const imported = spawnSync(process.execPath, ['--input-type=module', '-'], {
      input: `await import(${JSON.stringify(new URL('./migrate.mjs', import.meta.url).href)});`,
      encoding: 'utf8', timeout: 10000, env: { PATH: process.env.PATH },
    });
    assert.equal(imported.status, 0, imported.stderr);
    assert.equal(imported.stdout, '');
    for (const entry of [canonical, alias]) {
      const result = spawnSync(process.execPath, [entry], {
        encoding: 'utf8', timeout: 10000,
        env: { PATH: process.env.PATH, APP_ENV: 'test' },
      });
      assert.equal(result.status, 1, entry);
      assert.match(result.stderr, /A valid local database URL is required/);
      assert.equal(result.stdout, '');
    }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
