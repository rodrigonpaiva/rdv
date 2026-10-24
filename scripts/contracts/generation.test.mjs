import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { spawnSync } from 'node:child_process';
import { validateDocument, sourceFile, generate } from './generate.mjs';

test('OpenAPI validation rejects invalid structure, unresolved/external refs and duplicate operation IDs', async () => {
  const document = JSON.parse(await fs.readFile(sourceFile, 'utf8'));
  for (const mutate of [
    (doc) => { doc.paths['/v1/health'].get.responses = 'invalid'; },
    (doc) => { doc.components.schemas.BookingAcceptance.properties.policy_version_id = { $ref: '#/components/schemas/Missing' }; },
    (doc) => { doc.components.schemas.BookingAcceptance.properties.policy_version_id = { $ref: 'https://untrusted.invalid/schema' }; },
    (doc) => { doc.paths['/health'].get.operationId = 'getWorkspaceInfo'; },
  ]) {
    const invalid = structuredClone(document);
    mutate(invalid);
    await assert.rejects(validateDocument(invalid));
  }
});

test('generated client and schema snapshot reproduce exactly from the source', async () => {
  await generate(true);
});

test('browser consumer receives typed operations, safe error DTOs and pagination without Node/ORM types', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'agenda-client-types-'));
  try {
    const clientPath = fileURLToPath(new URL('../../packages/contracts/dist/client.js', import.meta.url));
    const dtoPath = fileURLToPath(new URL('../../packages/contracts/dist/index.js', import.meta.url));
    const file = path.join(directory, 'consumer.mts');
    await fs.writeFile(file, `import { createApiClient } from ${JSON.stringify(clientPath)};
import type { CursorPage, WorkspaceInfoDto, CreateBookingInput } from ${JSON.stringify(dtoPath)};
const client = createApiClient({ baseUrl: '/' });
const result = await client.GET('/v1/health');
const stage: 'foundation' | undefined = result.data?.stage;
const correlation: string | undefined = result.error?.error.correlation_id;
const page: CursorPage<WorkspaceInfoDto> = { data: [{name: 'agenda-br', stage:'foundation'}], page_info:{limit:25,next_cursor:null} };
// @ts-expect-error nonexistent operations must not compile
await client.GET('/v1/bookings');
// @ts-expect-error a GET diagnostic is not a mutation
await client.POST('/v1/health');
// @ts-expect-error unknown query fields are rejected by the generated client
await client.GET('/v1/health', { params:{query:{tenant_id:'arbitrary'}} });
// @ts-expect-error unknown response fields are not database records
const privateRecord = result.data?.password_hash;
// @ts-expect-error acceptance cannot be false
const input: CreateBookingInput = {quote_id:'q',acceptance:{policy_version_id:'id',summary_hash:'hash',confirmed:false}};
void stage; void correlation; void page;
`);
    const program = ts.createProgram([file], { noEmit: true, strict: true, exactOptionalPropertyTypes: true, noUncheckedIndexedAccess: true,
      target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
      types: [], lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: false });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => directory, getCanonicalFileName: (name) => name, getNewLine: () => '\n',
    }));
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

// Exercise the real check command in a separate source copy, preserving the checkout.
test('contract drift fails the check without rewriting generated files', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'agenda-contract-drift-'));
  try {
    await fs.mkdir(path.join(directory, 'scripts/contracts'), { recursive: true });
    await fs.cp(new URL('../../packages/contracts', import.meta.url), path.join(directory, 'packages/contracts'), { recursive: true });
    await fs.copyFile(new URL('./generate.mjs', import.meta.url), path.join(directory, 'scripts/contracts/generate.mjs'));
    await fs.symlink(fileURLToPath(new URL('../../node_modules', import.meta.url)), path.join(directory, 'node_modules'), 'dir');
    const source = path.join(directory, 'packages/contracts/openapi/v1.json');
    const document = JSON.parse(await fs.readFile(source, 'utf8'));
    document.components.schemas.WorkspaceInfo.properties.name = { type: 'integer' };
    await fs.writeFile(source, JSON.stringify(document));
    const generated = path.join(directory, 'packages/contracts/src/generated/schema.ts');
    const before = await fs.readFile(generated, 'utf8');
    const result = spawnSync(process.execPath, [path.join(directory, 'scripts/contracts/generate.mjs'), '--check'], { encoding: 'utf8', timeout: 10000 });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Generated contracts drifted/);
    assert.equal(await fs.readFile(generated, 'utf8'), before);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
