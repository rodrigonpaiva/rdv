import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { sourceIdentity, buildFiles, receiptPath, outputDirectory, sha256 } from './provenance.mjs';
import { gates } from './quality.mjs';

export function validateReceipt(receipt, identity, files) {
  assert.equal(receipt.version, 1);
  assert.equal(receipt.node, 'v24.22.1');
  assert.match(receipt.npm, /^npm\/12\.2\.1 /);
  assert.deepEqual(receipt.gates, gates);
  for (const key of ['commit', 'lock_sha256', 'sources']) assert.deepEqual(receipt[key], identity[key]);
  assert.deepEqual(receipt.files, files);
}

export function createArchive(archive, payload) {
  // macOS tar otherwise adds AppleDouble files absent from the verified manifest.
  // GNU tar ignores this environment setting; payload bytes remain unchanged.
  execFileSync('tar', ['-czf', archive, '-C', payload, '.'], {
    env: { ...process.env, COPYFILE_DISABLE: '1' },
  });
}

export function artifact() {
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  validateReceipt(receipt, sourceIdentity(), buildFiles());
  const payload = `${outputDirectory}/payload`;
  fs.rmSync(payload, { recursive: true, force: true });
  fs.mkdirSync(payload, { recursive: true });
  for (const file of Object.keys(receipt.files)) {
    fs.mkdirSync(path.dirname(`${payload}/${file}`), { recursive: true });
    fs.copyFileSync(file, `${payload}/${file}`);
    assert.equal(sha256(`${payload}/${file}`), receipt.files[file]);
  }
  fs.copyFileSync(receiptPath, `${payload}/manifest.json`);
  const archive = `${outputDirectory}/rdv-${receipt.commit}.tar.gz`;
  createArchive(archive, payload);
  fs.writeFileSync(`${archive}.sha256`, `${sha256(archive)}  ${path.basename(archive)}\n`);
  console.log(`Verified build bundle: ${archive}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) artifact();
