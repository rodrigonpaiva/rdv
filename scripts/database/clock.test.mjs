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
