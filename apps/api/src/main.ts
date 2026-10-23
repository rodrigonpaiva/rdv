import { ConfigurationError, SERVER_RUNTIME } from '@agenda/config';
import type { ServerRuntime } from '@agenda/config';
import { createApi } from './bootstrap.js';

try {
  const app = await createApi();
  const runtime = app.get<ServerRuntime>(SERVER_RUNTIME);
  await app.listen(runtime.config.http.port, runtime.config.http.host);
  console.log('API started with validated configuration.');
} catch (error) {
  console.error(error instanceof ConfigurationError ? error.message : 'Application startup failed.');
  process.exitCode = 1;
}
