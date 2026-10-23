import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const task = process.argv[2] ?? 'bk-003';
if (!/^bk-\d{3}$/.test(task)) throw new Error('Expected an evidence task such as bk-003.');
const evidenceDirectory = path.join(root, 'docs/evidence', task);
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-clean-'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before = hash(path.join(root, 'package-lock.json'));
const copied = ['package.json', 'package-lock.json', '.npmrc', 'tsconfig.base.json', 'tsconfig.node.json', 'apps', 'packages', 'scripts'];
const excluded = new Set(['node_modules', 'dist', '.next']);
for (const item of copied) {
  fs.cpSync(path.join(root, item), path.join(directory, item), {
    recursive: true,
    filter: (source) => !excluded.has(path.basename(source)) && !source.endsWith('.tsbuildinfo'),
  });
}
const results = [];
for (const args of [['ci', '--offline', '--no-audit', '--no-fund'], ['run', 'check'], ['run', 'typecheck']]) {
  console.log(`Clean checkout: npm ${args.join(' ')}`);
  const run = spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: directory, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 240000,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  results.push({ command: `npm ${args.join(' ')}`, exit_code: run.status, output: `${run.stdout ?? ''}${run.stderr ?? ''}`, error: run.error?.message ?? null });
  if (run.status !== 0) break;
}
const lockUnchanged = hash(path.join(directory, 'package-lock.json')) === before && hash(path.join(root, 'package-lock.json')) === before;
const report = {
  scope: `${task.toUpperCase()} clean source copy: no node_modules/dist/.next copied; offline installation from the workspace lockfile`,
  node: process.version, npm: process.env.npm_config_user_agent, temporary_directory: directory,
  lock_sha256: before, lock_unchanged: lockUnchanged, results,
  passed: results.length === 3 && results.every((r) => r.exit_code === 0) && lockUnchanged,
};
fs.mkdirSync(evidenceDirectory, { recursive: true });
fs.writeFileSync(path.join(evidenceDirectory, 'clean-verification.json'), JSON.stringify(report, null, 2) + '\n');
if (!report.passed) {
  console.error(results.at(-1)?.output, results.at(-1)?.error ?? '');
  process.exitCode = 1;
} else console.log('Clean installation, build, boundaries, smoke and typecheck passed; lock unchanged.');
// Retain the isolated copy for evidence/review. It is outside the repository and contains no secrets.
