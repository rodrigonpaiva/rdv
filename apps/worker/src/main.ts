import { GetWorkspaceInfo } from '@agenda/backend/application';
import { createWorker } from './bootstrap.js';

const worker = await createWorker();
console.log(JSON.stringify(worker.get(GetWorkspaceInfo).execute()));
// No queue consumer exists before BK-031. Bootstrap completes and shuts down cleanly.
await worker.close();
