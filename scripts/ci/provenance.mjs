import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const outputDirectory = '.artifacts';
export const receiptPath = `${outputDirectory}/quality.json`;
export const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

export function sourceIdentity() {
  if (git('status', '--porcelain', '--untracked-files=normal')) throw new Error('Artifact provenance requires a clean committed checkout.');
  const commit = git('rev-parse', 'HEAD');
  if (process.env.GITHUB_SHA && commit !== process.env.GITHUB_SHA) throw new Error('Checkout does not match GITHUB_SHA.');
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean).sort();
  // Git metadata, ignored secrets and local planning files are never copied into artifacts.
  return { commit, lock_sha256: sha256('package-lock.json'), sources: Object.fromEntries(files.map((file) => [file, sha256(file)])) };
}

export function buildFiles() {
  const roots = ['apps/api/dist', 'apps/worker/dist', 'apps/web/.next',
    ...fs.readdirSync('packages').filter((name) => fs.statSync(`packages/${name}`).isDirectory()).map((name) => `packages/${name}/dist`),
    'database/migrations', 'database/schema.prisma', 'database/prisma.config.ts',
    'package.json', 'package-lock.json', '.npmrc', 'packages/contracts/openapi'];
  const files = [];
  const visit = (file) => {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Unexpected artifact symlink: ${file}`);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(file).sort()) {
        if (['cache', 'dev'].includes(entry)) continue;
        visit(path.join(file, entry));
      }
    } else if (stat.isFile()) files.push(file);
  };
  roots.forEach(visit);
  for (const workspace of ['apps', 'packages']) {
    for (const name of fs.readdirSync(workspace)) {
      const file = `${workspace}/${name}/package.json`;
      if (fs.existsSync(file)) files.push(file);
    }
  }
  return Object.fromEntries([...new Set(files)].sort().map((file) => [file, sha256(file)]));
}
