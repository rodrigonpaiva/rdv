import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { inspectSource, inspectManifests, workspaceTopology } from './check-boundaries.mjs';

const root = process.cwd();
const topology = workspaceTopology(root);
function errors(relative, code) { return inspectSource(path.join(root, relative), code, root, topology); }

test('API and worker may use only the shared public application entry', () => {
  for (const app of ['api', 'worker']) {
    assert.deepEqual(errors(`apps/${app}/src/example.ts`, "import { GetWorkspaceInfo } from '@agenda/backend/application';"), []);
    assert.ok(errors(`apps/${app}/src/example.ts`, "import '@agenda/backend/src/modules/foundation/domain/workspace-info.js';").some((e) => e.includes('non-public')));
  }
});
test('domain rejects framework, database and even type-only external imports', () => {
  for (const specifier of ['@nestjs/common', '@prisma/client', 'pg', '@agenda/contracts', 'node:fs']) {
    assert.ok(errors('packages/backend/src/modules/foundation/domain/invalid.ts', `import type { X } from '${specifier}';`).some((e) => e.includes('domain imports')));
  }
});
test('application cannot reach infrastructure or server configuration', () => {
  for (const specifier of ['../infrastructure/adapter.js', '@agenda/config', '@nestjs/common']) {
    assert.ok(errors('packages/backend/src/modules/foundation/application/invalid.ts', `import '${specifier}';`).length);
  }
});
test('web and UI reject direct, re-exported and dynamic server imports', () => {
  for (const file of ['apps/web/src/invalid.ts', 'packages/ui/src/invalid.ts']) {
    for (const code of ["export * from '@agenda/config';", "import('@agenda/backend/application');", "require('pg');", "import '@prisma/client';"]) {
      assert.ok(errors(file, code).length);
    }
    assert.ok(errors(file, 'import(moduleName);').length);
    assert.ok(errors(file, 'require(moduleName);').length);
    assert.ok(errors(file, 'console.log(process.env.SECRET);').length);
    assert.ok(errors(file, "console.log(process['env'].SECRET);").length);
  }
});
test('relative cross-workspace paths cannot bypass public exports', () => {
  assert.ok(errors('apps/web/src/invalid.ts', "import '../../../packages/backend/src/application/index.js';").some((e) => e.includes('cross-workspace')));
});
test('TypeScript paths aliases cannot hide backend imports from web', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-boundary-'));
  try {
    fs.mkdirSync(path.join(fixture, 'apps/web/src'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'packages/backend/src'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'packages/backend/src/secret.ts'), 'export const secret = 1;');
    fs.writeFileSync(path.join(fixture, 'apps/web/tsconfig.json'), JSON.stringify({ compilerOptions: { baseUrl: '../..', paths: { '@server/*': ['packages/backend/src/*'] } } }));
    const mapped = topology.map((w) => ({ ...w, directory: path.join(fixture, path.relative(root, w.directory)) }));
    const found = inspectSource(path.join(fixture, 'apps/web/src/invalid.ts'), "import '@server/secret';", fixture, mapped);
    assert.ok(found.some((e) => e.includes('cross-workspace')));
    assert.ok(found.some((e) => e.includes('server-only')));
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});
test('web cannot reach server files outside every declared workspace', () => {
  assert.ok(errors('apps/web/src/invalid.ts', "import '../../../secrets.js';").some((e) => e.includes('escapes')));
});
test('manifest closure detects server imports hidden behind a shared package', () => {
  const modified = structuredClone(topology);
  modified.find((w) => w.name === '@agenda/ui').manifest.dependencies['@agenda/config'] = '0.0.0';
  assert.ok(inspectManifests(modified).some((e) => e.startsWith('@agenda/web:')));
});
test('frontend contracts and UI imports stay permitted', () => {
  assert.deepEqual(errors('apps/web/src/example.ts', "import '@agenda/contracts'; import '@agenda/ui'; import 'react';"), []);
});

test('web/UI reject Node builtins with bare and node-prefixed names, including subpaths', () => {
  for (const file of ['apps/web/src/invalid.ts', 'packages/ui/src/invalid.ts']) {
    for (const specifier of ['fs', 'node:fs', 'fs/promises', 'node:fs/promises', 'child_process', 'net', 'tls', 'process', 'node:os']) {
      assert.ok(errors(file, `import '${specifier}';`).some((error) => error.includes('server dependency')), `${file}: ${specifier}`);
    }
  }
  for (const specifier of ['fs', 'fs/promises', 'child_process', 'net', 'tls', 'process']) {
    assert.ok(errors('packages/backend/src/modules/foundation/application/invalid.ts', `import '${specifier}';`).length, specifier);
  }
  const modified = structuredClone(topology);
  modified.find((w) => w.name === '@agenda/contracts').manifest.dependencies.fs = '0.0.0';
  assert.ok(inspectManifests(modified).some((error) => error.startsWith('@agenda/web:')));
});
