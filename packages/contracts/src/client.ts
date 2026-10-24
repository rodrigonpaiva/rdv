import createClient from 'openapi-fetch';
import type { ClientOptions } from 'openapi-fetch';
import type { paths } from './generated/schema.js';

/** Generated operation types drive every path, method, query, body and result. */
export function createApiClient(options: ClientOptions = {}) {
  return createClient<paths>(options);
}
export type { paths, components } from './generated/schema.js';
