import 'reflect-metadata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Controller, Get, Post, Query, Body, Module, HttpException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createApiClient } from '@agenda/contracts/client';
import { apiDocument } from '@agenda/contracts/openapi';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import { testEnvironment } from '../fixtures/runtime.mjs';
import { createApi } from '../../apps/api/dist/bootstrap.js';
import { configureHttp } from '../../apps/api/dist/http/transport.js';
import { errorCatalog, SafeHttpError } from '../../apps/api/dist/http/errors.js';
import { SchemaValidationPipe, PaginationPipe, schemaValidator } from '../../apps/api/dist/http/validation.js';

const marker = 'SYNTHETIC_PRIVATE_SQL_TOKEN_STACK';
const uuid = /^[0-9a-f-]{36}$/;
async function expectError(response, status, code) {
  assert.equal(response.status, status);
  const text = await response.text();
  assert.equal(text.includes(marker), false);
  assert.equal(text.includes('stack'), false);
  const body = JSON.parse(text);
  assert.equal(schemaValidator('ApiError')(body), true);
  assert.equal(body.error.code, code);
  assert.match(body.error.correlation_id, uuid);
  assert.equal(response.headers.get('x-correlation-id'), body.error.correlation_id);
  assert.equal(body.error.retryable, false);
  return body;
}

test('versioned production API, compatibility alias, generated HTTP client and safe errors', async () => {
  const app = await createApi(testEnvironment());
  try {
    await app.listen(0, '127.0.0.1');
    const baseUrl = await app.getUrl();
    const client = createApiClient({ baseUrl });
    const result = await client.GET('/v1/health');
    assert.equal(result.response.status, 200);
    assert.deepEqual(result.data, { name: 'agenda-br', stage: 'foundation' });
    assert.equal(schemaValidator('WorkspaceInfo')(result.data), true);
    const correlation = randomUUID();
    const legacy = await fetch(`${baseUrl}/health`, { headers: { 'X-Correlation-ID': correlation } });
    assert.deepEqual(await legacy.json(), result.data);
    assert.equal(legacy.headers.get('x-correlation-id'), correlation);
    const generatedError = await client.GET('/v1/health', { params: { query: { tenant_id: marker } } });
    assert.equal(generatedError.response.status, 400);
    assert.equal(generatedError.error.error.code, 'VALIDATION_ERROR');
    for (const header of [marker, `${correlation},${randomUUID()}`, 'x'.repeat(512)]) {
      const response = await fetch(`${baseUrl}/v1/health?secret=${marker}`, { headers: { 'X-Correlation-ID': header } });
      const body = await expectError(response, 400, 'VALIDATION_ERROR');
      assert.notEqual(body.error.correlation_id, header);
    }
    for (const route of ['/v2/health', '/v1/bookings', '/bookings', `/v1/${marker}`]) {
      await expectError(await fetch(baseUrl + route), 404, 'RESOURCE_NOT_FOUND');
    }
    const service = app.get(GetWorkspaceInfo);
    const original = service.execute;
    try {
      service.execute = () => { throw new Error(marker); };
      await expectError(await fetch(`${baseUrl}/v1/health`), 500, 'INTERNAL_ERROR');
      service.execute = () => { throw new HttpException({ sql: marker, message: marker, stack: marker }, 403); };
      await expectError(await fetch(`${baseUrl}/v1/health`), 403, 'FORBIDDEN');
      service.execute = () => { throw new SafeHttpError('POLICY_CHANGED'); };
      await expectError(await fetch(`${baseUrl}/v1/health`), 409, 'POLICY_CHANGED');
    } finally { service.execute = original; }
  } finally { await app.close(); }
});

// Controllers below are registered only in this test process, never in AppModule/OpenAPI.
class ContractProbeController {
  pagination(query) { return { data: [], page_info: { next_cursor: query.cursor ?? null, limit: query.limit } }; }
  body(value) { return value; }
}
Controller('contract-probe')(ContractProbeController);
for (const [method, route, decorator, pipe] of [
  ['pagination', 'pagination', Get, new PaginationPipe()],
  ['body', 'body', Post, new SchemaValidationPipe('CreateBookingInput')],
]) {
  decorator(route)(ContractProbeController.prototype, method, Object.getOwnPropertyDescriptor(ContractProbeController.prototype, method));
  (method === 'pagination' ? Query(pipe) : Body(pipe))(ContractProbeController.prototype, method, 0);
}
class ProbeModule {}
Module({ controllers: [ContractProbeController] })(ProbeModule);

test('real HTTP strict sensitive input, malformed/oversized JSON and bounded pagination', async () => {
  const app = await NestFactory.create(ProbeModule, { logger: false });
  configureHttp(app);
  try {
    await app.listen(0, '127.0.0.1');
    const base = `${await app.getUrl()}/v1/contract-probe`;
    const valid = { quote_id: 'opaque_quote', acceptance: { policy_version_id: randomUUID(), summary_hash: 'server-hash', confirmed: true } };
    const send = (body, headers = { 'Content-Type': 'application/json' }) => fetch(`${base}/body`, { method: 'POST', headers, body });
    const positive = await send(JSON.stringify(valid));
    assert.equal(positive.status, 201);
    assert.deepEqual(await positive.json(), valid);
    const invalid = [null, [], {}, { ...valid, tenant_id: marker }, { ...valid, role: 'owner' },
      { ...valid, price_cents: 1 }, { ...valid, customer_id: randomUUID() },
      { ...valid, acceptance: { ...valid.acceptance, confirmed: false } },
      { ...valid, acceptance: { ...valid.acceptance, confirmed: 'true' } },
      { ...valid, acceptance: { ...valid.acceptance, policy_version_id: 'invalid' } },
      { ...valid, acceptance: { ...valid.acceptance, hidden: marker } }, { ...valid, quote_id: 123 }];
    for (const value of invalid) await expectError(await send(JSON.stringify(value)), 400, 'VALIDATION_ERROR');
    const correlation = randomUUID();
    const malformed = await expectError(await send(`{"${marker}":`, { 'Content-Type': 'application/json', 'X-Correlation-ID': correlation }), 400, 'VALIDATION_ERROR');
    assert.equal(malformed.error.correlation_id, correlation);
    await expectError(await send(JSON.stringify({ secret: marker + 'x'.repeat(110000) })), 413, 'PAYLOAD_TOO_LARGE');
    for (const headers of [
      { 'Content-Type': 'application/json; charset=definitely-invalid' },
      { 'Content-Type': 'application/json', 'Content-Encoding': 'definitely-invalid' },
    ]) {
      const response = await send(JSON.stringify(valid), { ...headers, 'X-Correlation-ID': correlation });
      const body = await expectError(response, 415, 'UNSUPPORTED_MEDIA_TYPE');
      assert.equal(body.error.correlation_id, correlation);
    }
    for (const [query, limit] of [['', 25], ['?limit=1', 1], ['?limit=100&cursor=opaque_cursor-1', 100]]) {
      const response = await fetch(`${base}/pagination${query}`);
      assert.equal(response.status, 200);
      const page = await response.json();
      assert.equal(schemaValidator('CursorPage')(page), true);
      assert.equal(page.page_info.limit, limit);
    }
    for (const query of ['limit=0', 'limit=101', 'limit=-1', 'limit=1.5', 'limit=1e2', 'limit=01', 'limit=',
      'limit=1&limit=2', 'limit[x]=1', 'cursor=', 'cursor=a%2Fb', `cursor=${'x'.repeat(513)}`, `tenant_id=${marker}`]) {
      await expectError(await fetch(`${base}/pagination?${query}`), 400, 'VALIDATION_ERROR');
    }
    // Probe routes exist only under the versioning default.
    await expectError(await fetch(`${await app.getUrl()}/contract-probe/pagination`), 404, 'RESOURCE_NOT_FOUND');
  } finally { await app.close(); }
});

test('every reusable schema compiles and stable catalog matches the public code enum', () => {
  for (const schema of Object.keys(apiDocument.components.schemas)) assert.equal(typeof schemaValidator(schema), 'function');
  assert.deepEqual(Object.keys(errorCatalog).sort(), [...apiDocument.components.schemas.ErrorCode.enum].sort());
});
