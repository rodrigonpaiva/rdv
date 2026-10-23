import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import { expectedWorkspaceInfo } from '@agenda/testkit';

const expected = expectedWorkspaceInfo();
const { createApi } = await import('../apps/api/dist/bootstrap.js');
const { HealthController } = await import('../apps/api/dist/health.controller.js');
const { createWorker } = await import('../apps/worker/dist/bootstrap.js');
assert.equal(Reflect.getMetadata('design:paramtypes', HealthController)[0], GetWorkspaceInfo, 'ESM decorator metadata must preserve the shared runtime class');
const api = await createApi();
try {
  await api.listen(0, '127.0.0.1');
  const response = await fetch(`${await api.getUrl()}/health`, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expected);
  assert.equal((await fetch(`${await api.getUrl()}/bookings`)).status, 404, 'No business API is implemented in BK-002');
} finally { await api.close(); }
const worker = await createWorker();
try {
  assert.ok(worker.get(GetWorkspaceInfo) instanceof GetWorkspaceInfo);
  assert.deepEqual(worker.get(GetWorkspaceInfo).execute(), expected);
} finally { await worker.close(); }
const once = spawnSync(process.execPath, ['apps/worker/dist/main.js'], { encoding: 'utf8', timeout: 10000 });
assert.equal(once.status, 0, once.stderr);
assert.deepEqual(JSON.parse(once.stdout.trim()), expected);

// Select an available loopback port; only local production-build smoke traffic is sent.
const reservation = createServer();
await new Promise((resolve, reject) => { reservation.once('error', reject); reservation.listen(0, '127.0.0.1', resolve); });
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const web = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', 'apps/web', '--port', String(port), '--hostname', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
let output = '';
web.stdout.on('data', (chunk) => { output = (output + chunk).slice(-8000); });
web.stderr.on('data', (chunk) => { output = (output + chunk).slice(-8000); });
try {
  let response;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (web.exitCode !== null) throw new Error(`Web exited early: ${output}`);
    try { response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(1000) }); break; } catch { await delay(100); }
  }
  assert.ok(response, `Web did not start: ${output}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /lang="pt-BR"/);
  assert.ok(html.includes('Seu próximo cuidado.'));
  assert.equal(response.headers.get('x-powered-by'), null);
} finally {
  if (web.exitCode === null) {
    const stopped = new Promise((resolve) => web.once('exit', resolve));
    web.kill('SIGTERM');
    const killer = setTimeout(() => web.kill('SIGKILL'), 5000);
    await stopped;
    clearTimeout(killer);
  }
}
console.log('Smoke passed: shared ESM use case, Nest DI/decorator metadata, API HTTP, one-shot worker and production web.');
