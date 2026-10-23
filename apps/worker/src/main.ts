import { ConfigurationError } from '@agenda/config';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import { createWorker } from './bootstrap.js';

try {
  const worker = await createWorker();
  try { console.log(JSON.stringify(worker.get(GetWorkspaceInfo).execute())); }
  finally { await worker.close(); }
} catch (error) {
  console.error(error instanceof ConfigurationError ? error.message : 'Application startup failed.');
  process.exitCode = 1;
}
