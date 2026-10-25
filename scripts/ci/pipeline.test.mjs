import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { runGates, gates } from './quality.mjs';
import { validateReceipt } from './artifact.mjs';

test('real lint rejects a controlled JavaScript and TypeScript regression', async () => {
  const lint = new ESLint();
  for (const filePath of ['scripts/ci/probe.mjs', 'apps/api/src/probe.ts']) {
    const [result] = await lint.lintText('const unusedRegression = 1;\n', { filePath });
    assert.ok(result.errorCount > 0, filePath);
    assert.ok(result.messages.some((message) => message.ruleId?.endsWith('no-unused-vars')));
  }
});

test('every failed gate invalidates old evidence and prevents all later gates and promotion', () => {
  for (const failed of gates) {
    const events = [];
    assert.throws(() => runGates(gates, (gate) => { events.push(gate); return gate === failed ? 1 : 0; },
      () => events.push('promoted'), () => events.push('invalidated')), /Quality gate failed/);
    assert.deepEqual(events, ['invalidated', ...gates.slice(0, gates.indexOf(failed) + 1)]);
  }
});

test('artifact verification rejects stale commits, locks, migrations, outputs and missing gates', () => {
  const identity = { commit: 'a'.repeat(40), lock_sha256: 'b'.repeat(64), sources: { 'database/migrations/001/migration.sql': 'c'.repeat(64) } };
  const files = { 'apps/api/dist/main.js': 'd'.repeat(64), 'database/migrations/001/migration.sql': 'c'.repeat(64) };
  const receipt = { version: 1, node: 'v24.22.1', npm: 'npm/12.2.1 node/v24.22.1', ...identity, gates, files };
  validateReceipt(receipt, identity, files);
  for (const mutate of [
    (r) => { r.commit = 'e'.repeat(40); },
    (r) => { r.lock_sha256 = 'e'.repeat(64); },
    (r) => { r.sources['database/migrations/001/migration.sql'] = 'e'.repeat(64); },
    (r) => { r.files['apps/api/dist/main.js'] = 'e'.repeat(64); },
    (r) => { r.files['database/migrations/001/migration.sql'] = 'e'.repeat(64); },
    (r) => { r.gates.pop(); },
  ]) {
    const stale = structuredClone(receipt);
    mutate(stale);
    assert.throws(() => validateReceipt(stale, identity, files));
  }
});
