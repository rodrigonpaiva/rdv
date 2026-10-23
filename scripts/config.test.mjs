import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import { spawnSync } from 'node:child_process';
import { ConfigurationError, loadServerConfig, prepareServerRuntime, isTenantOperationEnabled, validateTenantFlags } from '@agenda/config';
import { testEnvironment } from './fixtures/runtime.mjs';

const marker = 'BK003_SERVER_SECRET_CANARY_8a65c1';
const snapshot = (changes = {}) => ({ tenantId: 'tenant-a', environment: 'test', version: 1, botEnabled: true, pixEnabled: true, botIntegrationActive: true, pixIntegrationActive: true, ...changes });
const expectConfigError = (callback, field) => assert.throws(callback, (error) => error instanceof ConfigurationError && error.field === field && !inspect(error).includes(marker));

test('environment is mandatory and never inferred from NODE_ENV', () => {
  expectConfigError(() => loadServerConfig({ NODE_ENV: 'production' }), 'APP_ENV');
  expectConfigError(() => loadServerConfig(testEnvironment({ APP_ENV: 'prod' })), 'APP_ENV');
});
test('all required configuration is validated without leaking values', () => {
  for (const field of ['APP_ENV', 'SECRET_STORE', 'DATABASE_URL', 'REDIS_URL', 'PUBLIC_APP_URL', 'TRUSTED_ORIGINS', 'PAYMENT_PROVIDER', 'WHATSAPP_PROVIDER', 'MODEL_PROVIDER']) {
    expectConfigError(() => loadServerConfig(testEnvironment({ [field]: undefined })), field);
  }
  expectConfigError(() => loadServerConfig(testEnvironment({ DATABASE_URL: `postgresql://user:${marker}@localhost/db` })), 'DATABASE_URL');
});
test('no default live provider, no mock activation in staging/production', () => {
  expectConfigError(() => loadServerConfig(testEnvironment({ PAYMENT_PROVIDER: 'unvalidated-live-adapter' })), 'PAYMENT_PROVIDER');
  for (const environment of ['staging', 'production']) {
    expectConfigError(() => loadServerConfig(testEnvironment({ APP_ENV: environment })), 'SECRET_STORE');
    expectConfigError(() => loadServerConfig(testEnvironment({ APP_ENV: environment, SECRET_STORE: 'external', PUBLIC_APP_URL: 'https://example.com', TRUSTED_ORIGINS: 'https://example.com', PAYMENT_PROVIDER: 'mock' })), 'PAYMENT_PROVIDER');
  }
});
test('origins and bind settings reject malformed or unsafe input', () => {
  for (const value of ['https://user:password@example.com', 'https://example.com/path', 'https://example.com?token=x', 'file:///tmp/private', 'https://example.com/']) expectConfigError(() => loadServerConfig(testEnvironment({ PUBLIC_APP_URL: value })), 'PUBLIC_APP_URL');
  expectConfigError(() => loadServerConfig(testEnvironment({ TRUSTED_ORIGINS: 'http://localhost:3000' })), 'TRUSTED_ORIGINS');
  for (const value of ['0', '-1', '65536', 'NaN', '1e3', '3001.0']) expectConfigError(() => loadServerConfig(testEnvironment({ API_PORT: value })), 'API_PORT');
  expectConfigError(() => loadServerConfig(testEnvironment({ API_HOST: 'example.com' })), 'API_HOST');
});
test('secret references cannot cross environments or purposes', () => {
  for (const value of ['secret://production/platform/database', 'secret://test/platform/redis', 'secret://test/platform/database?token=x', 'secret://test/platform/%64atabase']) expectConfigError(() => loadServerConfig(testEnvironment({ DATABASE_URL: value })), 'DATABASE_URL');
});
test('global tenant flags and secret-like public variables fail closed', () => {
  for (const field of ['BOT_ENABLED', 'PIX_ENABLED', 'TENANT_FLAGS']) expectConfigError(() => loadServerConfig(testEnvironment({ [field]: 'true' })), field);
  expectConfigError(() => loadServerConfig(testEnvironment({ NEXT_PUBLIC_SECRET_TOKEN: marker })), 'PUBLIC_ENVIRONMENT');
});
test('validated configuration is immutable and retains explicit disabled adapters', () => {
  const config = loadServerConfig(testEnvironment());
  assert.equal(config.providers.payment, 'disabled');
  assert.equal(config.http.host, '127.0.0.1');
  assert.throws(() => { config.providers.payment = 'mock'; }, TypeError);
  assert.throws(() => config.trustedOrigins.push('https://unexpected.example'), TypeError);
});
test('an external secret store is required explicitly and missing secrets abort boot', async () => {
  const env = testEnvironment({ SECRET_STORE: 'external' });
  await assert.rejects(prepareServerRuntime(env), /external resolver is required/);
  await assert.rejects(prepareServerRuntime(env, { async resolve() { return undefined; } }), /required secret is missing/);
  await assert.rejects(prepareServerRuntime(env, { async resolve() { return 'invalid'; } }), /invalid connection secret/);
});
test('resolver exceptions and secret values cannot leak through errors or serialization', async () => {
  const env = testEnvironment({ SECRET_STORE: 'external' });
  await assert.rejects(prepareServerRuntime(env, { async resolve() { throw new Error(marker); } }), (e) => !inspect(e).includes(marker) && /secret resolution failed/.test(e.message));
  const runtime = await prepareServerRuntime(env, { async resolve(ref) { return ref.purpose === 'database' ? `postgresql://user:${marker}@localhost/db` : `redis://:${marker}@localhost/0`; } });
  for (const value of [JSON.stringify(runtime), inspect(runtime), String(runtime.secrets.database)]) assert.ok(!value.includes(marker));
  assert.ok(runtime.secrets.database.read().includes(marker), 'only explicit adapter access reveals the secret');
});
test('mock store is deterministic, isolated and cannot be replaced by an external resolver', async () => {
  const runtime = await prepareServerRuntime(testEnvironment());
  assert.ok(runtime.secrets.database.read().endsWith('/agenda_test'));
  await assert.rejects(prepareServerRuntime(testEnvironment(), { async resolve() { return marker; } }), /cannot override/);
});
test('invalid environment input is rejected before any secret lookup', async () => {
  let calls = 0;
  await assert.rejects(prepareServerRuntime(testEnvironment({ APP_ENV: undefined, SECRET_STORE: 'external' }), { async resolve() { calls++; return undefined; } }));
  assert.equal(calls, 0);
});
test('new operations require explicit matching tenant flags and active integrations', () => {
  const config = loadServerConfig(testEnvironment({ PAYMENT_PROVIDER: 'mock', WHATSAPP_PROVIDER: 'mock', MODEL_PROVIDER: 'mock' }));
  assert.equal(isTenantOperationEnabled(config, 'tenant-a', undefined, 'pix.create'), false);
  assert.equal(isTenantOperationEnabled(config, 'tenant-a', snapshot(), 'pix.create'), true);
  assert.equal(isTenantOperationEnabled(config, 'tenant-a', snapshot(), 'bot.mutate'), true);
  assert.equal(isTenantOperationEnabled(config, 'tenant-a', snapshot({ pixEnabled: false }), 'pix.create'), false);
  assert.equal(isTenantOperationEnabled(config, 'tenant-a', snapshot({ botIntegrationActive: false }), 'bot.mutate'), false);
  assert.equal(isTenantOperationEnabled(loadServerConfig(testEnvironment()), 'tenant-a', snapshot(), 'pix.create'), false);
});
test('switching off new operations leaves existing obligations eligible for resolution', () => {
  const config = loadServerConfig(testEnvironment());
  for (const flags of [undefined, snapshot({ pixEnabled: false, botEnabled: false, pixIntegrationActive: false, botIntegrationActive: false })]) {
    assert.equal(isTenantOperationEnabled(config, 'tenant-a', flags, 'pix.create'), false);
    assert.equal(isTenantOperationEnabled(config, 'tenant-a', flags, 'bot.mutate'), false);
    assert.equal(isTenantOperationEnabled(config, 'tenant-a', flags, 'payment.reconcile'), true);
    assert.equal(isTenantOperationEnabled(config, 'tenant-a', flags, 'refund.resolve'), true);
  }
});
test('tenant/environment mismatches never bypass scope checks, even during resolution', () => {
  const config = loadServerConfig(testEnvironment());
  for (const flags of [snapshot({ tenantId: 'tenant-b' }), snapshot({ environment: 'production' }), snapshot({ pixEnabled: 'true' }), snapshot({ version: 0 })]) {
    for (const operation of ['pix.create', 'refund.resolve']) assert.throws(() => isTenantOperationEnabled(config, 'tenant-a', flags, operation), ConfigurationError);
  }
  assert.throws(() => isTenantOperationEnabled(config, '', undefined, 'refund.resolve'), ConfigurationError);
});
test('flag snapshots are immutable copies and unknown operations are denied', () => {
  const raw = snapshot();
  const flags = validateTenantFlags(raw, 'test', 'tenant-a');
  raw.pixEnabled = false;
  assert.equal(flags.pixEnabled, true);
  assert.ok(Object.isFrozen(flags));
  assert.equal(isTenantOperationEnabled(loadServerConfig(testEnvironment()), 'tenant-a', flags, 'unknown'), false);
});
test('API and worker processes reject raw secret URLs without logging credentials', () => {
  for (const app of ['api', 'worker']) {
    const child = spawnSync(process.execPath, [`apps/${app}/dist/main.js`], {
      encoding: 'utf8', timeout: 10000,
      env: { PATH: process.env.PATH, ...testEnvironment({ DATABASE_URL: `postgresql://user:${marker}@localhost/db` }) },
    });
    assert.equal(child.status, 1);
    assert.ok(child.stderr.includes('Invalid configuration: DATABASE_URL'));
    assert.ok(!`${child.stdout}${child.stderr}`.includes(marker));
  }
});

test('both processes fail before boot when the external resolver is missing', () => {
  for (const app of ['api', 'worker']) {
    const child = spawnSync(process.execPath, [`apps/${app}/dist/main.js`], {
      encoding: 'utf8', timeout: 10000,
      env: { PATH: process.env.PATH, ...testEnvironment({ SECRET_STORE: 'external' }) },
    });
    assert.equal(child.status, 1);
    assert.ok(child.stderr.includes('external resolver is required'));
    assert.ok(!child.stdout.includes('application successfully started'));
  }
});
test('missing Redis secret rejects runtime after the database secret resolves', async () => {
  const purposes = [];
  await assert.rejects(prepareServerRuntime(testEnvironment({ SECRET_STORE: 'external' }), {
    async resolve(ref) {
      purposes.push(ref.purpose);
      return ref.purpose === 'database' ? 'postgresql://synthetic:synthetic@localhost/db' : undefined;
    },
  }), /required secret is missing/);
  assert.deepEqual(purposes, ['database', 'redis']);
});
