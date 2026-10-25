import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { sourceIdentity, buildFiles, receiptPath, outputDirectory } from './provenance.mjs';

export const gates = ['lint', 'typecheck', 'test:ci', 'check', 'test:database'];

// Injectable executor lets tests prove failure sequencing without skipping production gates.
export function runGates(commands, execute, finish, invalidate) {
  invalidate();
  for (const command of commands) {
    if (execute(command) !== 0) throw new Error(`Quality gate failed: ${command}`);
  }
  finish();
}

function invalidateBuildArtifacts() {
  if (!fs.existsSync(outputDirectory)) return;
  for (const entry of fs.readdirSync(outputDirectory)) {
    // Verification reports are retained even when the checkout fails validation.
    if (entry === 'verification') continue;
    fs.rmSync(path.join(outputDirectory, entry), { recursive: true, force: true });
  }
}

export function quality() {
  invalidateBuildArtifacts();
  const identity = sourceIdentity();
  runGates(gates, (script) => {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script], { stdio: 'inherit' });
    if (result.error) throw result.error;
    return result.status;
  }, () => {
    if (JSON.stringify(sourceIdentity()) !== JSON.stringify(identity)) throw new Error('Sources changed during verification.');
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(receiptPath, JSON.stringify({ version: 1, ...identity, node: process.version,
      npm: process.env.npm_config_user_agent, gates, files: buildFiles() }, null, 2) + '\n');
  }, invalidateBuildArtifacts);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) quality();
