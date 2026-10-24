import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { migrate } from './migrate.mjs';
import { seedTenants, tenantFixtures, fixtureInstant } from './fixtures.mjs';
import { postgresImage } from './image.mjs';

const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('real PostgreSQL: empty deploy, least privilege, fixtures, populated deploy and recreation', { timeout: 240000 }, async (t) => {
  // Never accepts a caller-supplied database. Only this randomly named container is removed.
  const container = `rdv-bk004-${randomUUID()}`;
  const password = randomBytes(24).toString('hex');
  const migrationPassword = randomBytes(24).toString('hex');
  const appPassword = randomBytes(24).toString('hex');
  const previousEnvironment = process.env.APP_ENV;
  process.env.APP_ENV = 'test';
  let created = false;
  const clients = new Set();
  async function connect(user, database, secret, port) {
    const client = new pg.Client({ host: '127.0.0.1', port, user, database, password: secret, connectionTimeoutMillis: 1000 });
    clients.add(client);
    try { await client.connect(); return client; }
    catch (error) { clients.delete(client); await client.end().catch(() => {}); throw error; }
  }
  try {
    // Only synthetic generated credentials are passed to the child environment.
    execFileSync('docker', ['run', '--detach', '--name', container, '--label', 'rdv.task=BK-004',
      '--publish', '127.0.0.1::5432', '--env', 'POSTGRES_PASSWORD',
      '--tmpfs', '/var/lib/postgresql', postgresImage],
    { env: { ...process.env, POSTGRES_PASSWORD: password }, stdio: ['ignore', 'pipe', 'pipe'] });
    created = true;
    const binding = JSON.parse(docker('inspect', '--format', '{{json .NetworkSettings.Ports}}', container));
    const port = Number(binding['5432/tcp'][0].HostPort);
    let admin;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { admin = await connect('postgres', 'postgres', password, port); break; }
      catch { await pause(500); }
    }
    assert.ok(admin, 'isolated PostgreSQL became ready');
    assert.equal((await admin.query('SHOW server_version')).rows[0].server_version.split(' ')[0], '18.6');
    // CREATE DATABASE must execute outside a transaction / multi-statement query.
    const bootstrap = await readFile(new URL('../../database/bootstrap.sql', import.meta.url), 'utf8');
    for (const statement of bootstrap.split(';').map((s) => s.trim()).filter(Boolean)) await admin.query(statement);
    await admin.query(`ALTER ROLE rdv_migration PASSWORD ${pg.escapeLiteral(migrationPassword)}`);
    await admin.query(`ALTER ROLE rdv_app PASSWORD ${pg.escapeLiteral(appPassword)}`);
    const url = `postgresql://rdv_migration:${migrationPassword}@127.0.0.1:${port}/rdv_test`;

    for (let cycle = 1; cycle <= 2; cycle++) {
      if (cycle === 2) {
        for (const client of [...clients]) {
          if (client !== admin) { await client.end(); clients.delete(client); }
        }
        await admin.query('DROP DATABASE rdv_test');
        await admin.query('CREATE DATABASE rdv_test OWNER rdv_migration');
        await admin.query('REVOKE ALL ON DATABASE rdv_test FROM PUBLIC');
        await admin.query('GRANT CONNECT ON DATABASE rdv_test TO rdv_migration, rdv_app');
      }
      migrate(url);
      const owner = await connect('rdv_migration', 'rdv_test', migrationPassword, port);
      const app = await connect('rdv_app', 'rdv_test', appPassword, port);
      assert.equal((await owner.query("SELECT extname FROM pg_extension WHERE extname='btree_gist'")).rowCount, 1);
      assert.equal((await owner.query('SELECT count(*)::int AS count FROM tenants')).rows[0].count, 0);
      await seedTenants(owner);
      await seedTenants(owner);
      const before = (await owner.query('SELECT * FROM tenants ORDER BY id')).rows;
      assert.equal(before.length, 2);
      assert.ok(before.every((row) => row.created_at.toISOString() === fixtureInstant));
      assert.ok(before.every((row) => row.operational_status === 'INACTIVE'));
      migrate(url); // Populated deploy must retain fixtures and have no pending changes.
      assert.deepEqual((await owner.query('SELECT * FROM tenants ORDER BY id')).rows, before);
      assert.equal((await owner.query('SELECT count(*)::int AS count FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rows[0].count, 1);
      const roles = (await owner.query(`SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
        FROM pg_roles WHERE rolname IN ('rdv_app', 'rdv_migration') ORDER BY rolname`)).rows;
      assert.equal(roles.length, 2);
      for (const role of roles) {
        for (const key of ['rolsuper', 'rolcreaterole', 'rolcreatedb', 'rolreplication', 'rolbypassrls']) assert.equal(role[key], false);
      }
      assert.equal((await owner.query("SELECT tableowner FROM pg_tables WHERE schemaname='public' AND tablename='tenants'")).rows[0].tableowner, 'rdv_migration');
      for (const sql of ['CREATE TABLE public.forbidden (id int)', 'ALTER TABLE tenants ADD COLUMN forbidden int',
        'DROP TABLE tenants', 'SET ROLE rdv_migration', 'SELECT * FROM _prisma_migrations',
        'CREATE SCHEMA forbidden', 'TRUNCATE tenants', 'CREATE EXTENSION hstore']) {
        await assert.rejects(app.query(sql), { code: '42501' });
      }
      assert.equal((await app.query('SELECT * FROM tenants')).rowCount, 0);
      await assert.rejects(app.query('INSERT INTO tenants (id, name) VALUES ($1, $2)', [randomUUID(), 'Synthetic denied']), { code: '42501' });
      for (const tenant of tenantFixtures) {
        await app.query('BEGIN');
        await app.query("SELECT set_config('app.tenant_id', $1, true)", [tenant.id]);
        assert.deepEqual((await app.query('SELECT id FROM tenants')).rows, [{ id: tenant.id }]);
        assert.equal((await app.query('UPDATE tenants SET name = name WHERE id = $1', [tenant.id])).rowCount, 1);
        const other = tenantFixtures.find((candidate) => candidate.id !== tenant.id);
        assert.equal((await app.query('UPDATE tenants SET name = name WHERE id = $1', [other.id])).rowCount, 0);
        await app.query('ROLLBACK');
        assert.equal((await app.query('SELECT * FROM tenants')).rowCount, 0);
      }
      t.diagnostic(`Cycle ${cycle}: empty migration, two deterministic tenants, populated redeploy, role denials and transaction context reset passed`);
    }
  } finally {
    await Promise.all([...clients].map((client) => client.end().catch(() => {})));
    if (created) docker('rm', '--force', '--volumes', container);
    if (previousEnvironment === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = previousEnvironment;
  }
});
