import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createArchive } from './artifact.mjs';
import { writeVerificationReport } from '../verification-report.mjs';

test('workspace build removes obsolete binaries while preserving sources and emitting current output', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rdv-build-regression-'));
  try {
    const names = ['contracts', 'backend', 'config', 'testkit', 'ui', 'api', 'worker', 'web'];
    fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ private: true, workspaces: ['packages/*', 'apps/*'] }));
    for (const name of names) {
      const workspace = path.join(directory, ['api', 'worker', 'web'].includes(name) ? 'apps' : 'packages', name);
      const output = name === 'web' ? '.next' : 'dist';
      fs.mkdirSync(path.join(workspace, output), { recursive: true });
      fs.mkdirSync(path.join(workspace, 'src'));
      fs.writeFileSync(path.join(workspace, output, 'obsolete.js'), 'obsolete');
      fs.writeFileSync(path.join(workspace, 'tsconfig.tsbuildinfo'), 'obsolete incremental state');
      fs.writeFileSync(path.join(workspace, 'src', 'current.js'), 'current');
      fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({ name: `@agenda/${name}`, scripts: { build: 'node build.mjs' } }));
      fs.writeFileSync(path.join(workspace, 'build.mjs'), `import fs from 'node:fs';
if (fs.existsSync('${output}/obsolete.js') || fs.existsSync('tsconfig.tsbuildinfo')) throw new Error('Stale build state survived');
fs.mkdirSync('${output}', { recursive: true });
fs.copyFileSync('src/current.js', '${output}/current.js');
`);
    }
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../workspaces.mjs', import.meta.url)), 'build'], {
      cwd: directory, encoding: 'utf8', timeout: 30000, env: process.env,
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    for (const name of names) {
      const workspace = path.join(directory, ['api', 'worker', 'web'].includes(name) ? 'apps' : 'packages', name);
      const output = name === 'web' ? '.next' : 'dist';
      assert.equal(fs.existsSync(path.join(workspace, output, 'obsolete.js')), false);
      assert.equal(fs.readFileSync(path.join(workspace, output, 'current.js'), 'utf8'), 'current');
      assert.equal(fs.readFileSync(path.join(workspace, 'src/current.js'), 'utf8'), 'current');
    }
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('default and task-scoped verification append unique reports without overwriting historical evidence', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rdv-evidence-regression-'));
  try {
    const historical = path.join(root, 'docs/evidence/bk-003/clean-verification.json');
    fs.mkdirSync(path.dirname(historical), { recursive: true });
    fs.writeFileSync(historical, 'accepted historical evidence');
    const paths = [
      writeVerificationReport(root, undefined, { passed: true }),
      writeVerificationReport(root, 'bk-003', { passed: false }),
      writeVerificationReport(root, 'bk-003', { passed: true }),
    ];
    assert.equal(new Set(paths).size, paths.length);
    assert.equal(path.dirname(paths[0]), path.join(root, '.artifacts/verification'));
    assert.equal(fs.readFileSync(historical, 'utf8'), 'accepted historical evidence');
    assert.deepEqual(paths.map((file) => JSON.parse(fs.readFileSync(file, 'utf8')).passed), [true, false, true]);
    assert.throws(() => writeVerificationReport(root, '../../outside', {}));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('verification source copy excludes nested local dotenv files and preserves source/templates', async () => {
  const { copyVerificationSources } = await import('../verification-source.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rdv-environment-copy-'));
  try {
    const input = path.join(root, 'input');
    const output = path.join(root, 'output');
    fs.mkdirSync(input);
    for (const file of ['package.json', 'package-lock.json', '.npmrc', 'tsconfig.base.json', 'tsconfig.node.json', 'eslint.config.mjs']) {
      fs.writeFileSync(path.join(input, file), 'synthetic fixture');
    }
    const paths = ['apps/web', 'packages/config', 'scripts/nested', 'database/nested'];
    const localFiles = ['.env', '.env.local', '.env.development', '.env.production.local', '.env.test'];
    for (const directory of paths) {
      fs.mkdirSync(path.join(input, directory), { recursive: true });
      for (const file of localFiles) fs.writeFileSync(path.join(input, directory, file), 'SYNTHETIC_LOCAL_ONLY');
      fs.writeFileSync(path.join(input, directory, '.env.example'), 'SYNTHETIC_TEMPLATE');
      fs.writeFileSync(path.join(input, directory, 'source.ts'), 'export const value = 1;');
      fs.mkdirSync(path.join(input, directory, 'dist'));
      fs.writeFileSync(path.join(input, directory, 'dist/old.js'), 'obsolete');
    }
    fs.symlinkSync(path.join(input, 'apps/web/.env.local'), path.join(input, 'apps/web/.env.staging'));
    copyVerificationSources(input, output);
    for (const directory of paths) {
      for (const file of [...localFiles, '.env.staging']) assert.equal(fs.existsSync(path.join(output, directory, file)), false);
      assert.equal(fs.readFileSync(path.join(output, directory, '.env.example'), 'utf8'), 'SYNTHETIC_TEMPLATE');
      assert.equal(fs.readFileSync(path.join(output, directory, 'source.ts'), 'utf8'), 'export const value = 1;');
      assert.equal(fs.existsSync(path.join(output, directory, 'dist')), false);
      assert.equal(fs.readFileSync(path.join(input, directory, '.env.local'), 'utf8'), 'SYNTHETIC_LOCAL_ONLY');
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('quality CLI preserves default verification reports while invalidating stale bundles on failure', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rdv-report-retention-'));
  try {
    const init = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH } });
    assert.equal(init.status, 0, init.stderr);
    fs.writeFileSync(path.join(root, 'uncommitted-source'), 'dirty checkout');
    const report = writeVerificationReport(root, undefined, { accepted: 'synthetic verification' });
    const artifact = path.join(root, '.artifacts/rdv-synthetic.tar.gz');
    const receipt = path.join(root, '.artifacts/quality.json');
    const payload = path.join(root, '.artifacts/payload');
    fs.writeFileSync(artifact, 'stale artifact');
    fs.writeFileSync(receipt, 'stale receipt');
    fs.mkdirSync(payload);
    fs.writeFileSync(path.join(payload, 'stale.js'), 'obsolete');
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./quality.mjs', import.meta.url))], {
      cwd: root, encoding: 'utf8', timeout: 10000, env: { PATH: process.env.PATH },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /requires a clean committed checkout/);
    assert.deepEqual(JSON.parse(fs.readFileSync(report, 'utf8')), { accepted: 'synthetic verification' });
    for (const file of [artifact, receipt, payload]) assert.equal(fs.existsSync(file), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('verification source copy rejects template, file and directory links without accessing excluded targets', async () => {
  const { copyVerificationSources } = await import('../verification-source.mjs');
  for (const kind of ['dotenv-template', 'external-file', 'external-directory', 'internal-file', 'dangling-file']) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rdv-copy-link-regression-'));
    try {
      const input = path.join(root, 'input');
      const output = path.join(root, 'output');
      fs.mkdirSync(input);
      for (const file of ['package.json', 'package-lock.json', '.npmrc', 'tsconfig.base.json', 'tsconfig.node.json', 'eslint.config.mjs']) {
        fs.writeFileSync(path.join(input, file), 'synthetic fixture');
      }
      for (const directory of ['apps/web', 'packages', 'scripts', 'database']) fs.mkdirSync(path.join(input, directory), { recursive: true });
      const local = path.join(input, 'apps/web/.env.local');
      fs.writeFileSync(local, 'SYNTHETIC_LOCAL_ONLY');
      const outside = path.join(root, 'outside');
      fs.mkdirSync(outside);
      fs.writeFileSync(path.join(outside, 'source.ts'), 'SYNTHETIC_EXTERNAL_ONLY');
      const internal = path.join(input, 'apps/web/source.ts');
      fs.writeFileSync(internal, 'export const value = 1;');
      const target = kind === 'dotenv-template' ? local : kind === 'external-directory' ? outside :
        kind === 'internal-file' ? internal : kind === 'dangling-file' ? path.join(root, 'missing') : path.join(outside, 'source.ts');
      const alias = kind === 'dotenv-template' ? '.env.example' : 'linked-source';
      const link = path.join(input, 'apps/web', alias);
      fs.symlinkSync(target, link);
      assert.throws(() => copyVerificationSources(input, output), /not symbolic links/);
      assert.equal(fs.existsSync(path.join(output, 'apps/web', alias)), false);
      assert.equal(fs.lstatSync(link).isSymbolicLink(), true);
      assert.equal(fs.readFileSync(local, 'utf8'), 'SYNTHETIC_LOCAL_ONLY');
      assert.equal(fs.readFileSync(path.join(outside, 'source.ts'), 'utf8'), 'SYNTHETIC_EXTERNAL_ONLY');
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  }
});

test('archive includes only verified payload files without platform metadata sidecars', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rdv-archive-metadata-'));
  try {
    const payload = path.join(root, 'payload');
    fs.mkdirSync(payload);
    const file = path.join(payload, 'verified.txt');
    fs.writeFileSync(file, 'synthetic verified bytes');
    if (process.platform === 'darwin') {
      execFileSync('xattr', ['-w', 'com.apple.metadata:rdv-test', 'synthetic', file]);
    }
    const archive = path.join(root, 'bundle.tar.gz');
    createArchive(archive, payload);
    const names = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
      .trim().split('\n').filter((name) => !name.endsWith('/')).map((name) => name.replace(/^\.\//, ''));
    assert.deepEqual(names, ['verified.txt']);
    assert.equal(execFileSync('tar', ['-xOzf', archive, './verified.txt'], { encoding: 'utf8' }), 'synthetic verified bytes');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
