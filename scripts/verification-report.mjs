import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/** Each execution gets a new report; accepted historical evidence is never replaced. */
export function writeVerificationReport(root, task, report) {
  if (task !== undefined && !/^bk-\d{3}$/.test(task)) throw new Error('Expected an evidence task such as bk-006.');
  const directory = task === undefined ? path.join(root, '.artifacts/verification') : path.join(root, 'docs/evidence', task);
  fs.mkdirSync(directory, { recursive: true });
  const destination = path.join(directory, `clean-verification-${randomUUID()}.json`);
  fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  return destination;
}
