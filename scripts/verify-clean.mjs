import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { writeVerificationReport } from './verification-report.mjs';
import { copyVerificationSources } from './verification-source.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
const task = args.find((arg) => /^bk-\d{3}$/.test(arg));
if (new Set(args).size !== args.length || args.filter((arg) => arg !== '--database' && arg !== task).length || args.filter((arg) => /^bk-\d{3}$/.test(arg)).length > 1) {
  throw new Error('Usage: npm run verify:clean -- [bk-xxx] [--database]');
}
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-clean-'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before = hash(path.join(root, 'package-lock.json'));
copyVerificationSources(root, directory);
const results = [];
const commands = [['ci', '--offline', '--no-audit', '--no-fund'], ['run', 'lint'], ['run', 'test:ci'], ['run', 'check'], ['run', 'typecheck']];
if (process.argv.includes('--database')) commands.push(['run', 'test:database']);
for (const args of commands) {
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
  scope: `${task?.toUpperCase() ?? 'Workspace'} clean source copy: no node_modules/dist/.next copied; offline installation from the workspace lockfile`,
  node: process.version, npm: process.env.npm_config_user_agent, temporary_directory: directory,
  lock_sha256: before, lock_unchanged: lockUnchanged, results,
  passed: results.length === commands.length && results.every((r) => r.exit_code === 0) && lockUnchanged,
};
const destination = writeVerificationReport(root, task, report);
console.log(`Verification report: ${destination}`);
if (!report.passed) {
  console.error(results.at(-1)?.output, results.at(-1)?.error ?? '');
  process.exitCode = 1;
} else console.log('Clean installation, build, boundaries, smoke, typecheck and requested integrations passed; lock unchanged.');
// Retain the isolated copy for evidence/review. It is outside the repository; local dotenv files and build outputs are excluded.
