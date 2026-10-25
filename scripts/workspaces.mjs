import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const packages = ['contracts', 'backend', 'config', 'testkit', 'ui'];
const apps = ['api', 'worker', 'web'];
const command = process.argv[2];
if (!['build', 'typecheck'].includes(command)) throw new Error('Expected build or typecheck');
const names = process.argv.includes('--packages') ? packages : [...packages, ...apps];
for (const name of names) {
  if (command === 'build') {
    const directory = path.join(packages.includes(name) ? 'packages' : 'apps', name);
    // tsc does not delete outputs whose source files were removed.
    fs.rmSync(path.join(directory, name === 'web' ? '.next' : 'dist'), { recursive: true, force: true });
    fs.rmSync(path.join(directory, 'tsconfig.tsbuildinfo'), { force: true });
  }
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', command, `--workspace=@agenda/${name}`], {
    stdio: 'inherit', env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
