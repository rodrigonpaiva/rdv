import fs from 'node:fs';
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

export function quality() {
  fs.rmSync(outputDirectory, { recursive: true, force: true });
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
  }, () => fs.rmSync(outputDirectory, { recursive: true, force: true }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) quality();
