/** Explicit synthetic input; never a production default or a real credential. */
export function testEnvironment(overrides = {}) {
  return {
    APP_ENV: 'test', SECRET_STORE: 'mock',
    DATABASE_URL: 'secret://test/platform/database', REDIS_URL: 'secret://test/platform/redis',
    PAYMENT_PROVIDER: 'disabled', WHATSAPP_PROVIDER: 'disabled', MODEL_PROVIDER: 'disabled',
    PUBLIC_APP_URL: 'http://127.0.0.1:3000', TRUSTED_ORIGINS: 'http://127.0.0.1:3000',
    ...overrides,
  };
}
