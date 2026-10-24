import { createApiClient } from '@agenda/contracts/client';

/** Browser uses its own origin; deployment must forward /v1 to the API. */
export function createWebApiClient() {
  return createApiClient({ baseUrl: '/', credentials: 'same-origin' });
}
