export type EnvironmentName = 'development' | 'test' | 'staging' | 'production';
export type ProviderName = 'disabled' | 'mock';
export type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export class ConfigurationError extends Error {
  constructor(readonly field: string, readonly reason: string) {
    super(`Invalid configuration: ${field} (${reason}).`);
    this.name = 'ConfigurationError';
  }
}

export interface SecretReference {
  readonly key: string;
  readonly environment: EnvironmentName;
  readonly purpose: 'database' | 'redis';
}

export interface ServerConfig {
  readonly environment: EnvironmentName;
  readonly providers: Readonly<{ payment: ProviderName; whatsapp: ProviderName; model: ProviderName }>;
  readonly publicAppUrl: string;
  readonly trustedOrigins: readonly string[];
  readonly http: Readonly<{ host: string; port: number }>;
  readonly secretStore: 'mock' | 'external';
  readonly connections: Readonly<{ database: SecretReference; redis: SecretReference }>;
}

function required(env: EnvironmentInput, field: string): string {
  const value = env[field];
  if (typeof value !== 'string' || !value.trim()) throw new ConfigurationError(field, 'required');
  if (value !== value.trim()) throw new ConfigurationError(field, 'unexpected whitespace');
  return value;
}

function environmentName(value: string): EnvironmentName {
  if (!['development', 'test', 'staging', 'production'].includes(value)) throw new ConfigurationError('APP_ENV', 'unsupported environment');
  return value as EnvironmentName;
}

function provider(env: EnvironmentInput, field: string, environment: EnvironmentName): ProviderName {
  const value = required(env, field);
  if (value !== 'disabled' && value !== 'mock') throw new ConfigurationError(field, 'adapter not implemented or validated');
  if (value === 'mock' && environment !== 'development' && environment !== 'test') throw new ConfigurationError(field, 'mock adapters require development or test');
  return value;
}

function origin(value: string, field: string, environment: EnvironmentName): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new ConfigurationError(field, 'invalid origin'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new ConfigurationError(field, 'origin must not contain credentials, paths, query or fragment');
  if ((environment === 'production' || environment === 'staging') && url.protocol !== 'https:') throw new ConfigurationError(field, 'HTTPS required');
  if (url.origin !== value) throw new ConfigurationError(field, 'use a canonical origin without a trailing slash');
  return url.origin;
}

function reference(value: string, environment: EnvironmentName, purpose: 'database' | 'redis', field: string): SecretReference {
  // These variables hold references, never connection credentials. Exact namespace matching
  // prevents using production secrets from a test process (or the reverse).
  if (value !== `secret://${environment}/platform/${purpose}`) throw new ConfigurationError(field, 'expected an environment-scoped protected reference');
  return Object.freeze({ key: value, environment, purpose });
}

/** Pure validation: no environment mutation, file reads, network or provider defaults. */
export function loadServerConfig(env: EnvironmentInput): ServerConfig {
  const environment = environmentName(required(env, 'APP_ENV'));
  for (const field of ['BOT_ENABLED', 'PIX_ENABLED', 'TENANT_FLAGS']) {
    if (env[field] !== undefined) throw new ConfigurationError(field, 'tenant flags must come from trusted tenant-scoped state');
  }
  for (const field of Object.keys(env)) {
    if (/^(?:NEXT_PUBLIC_|VITE_).*(?:SECRET|TOKEN|PASSWORD|DATABASE|REDIS)/i.test(field)) throw new ConfigurationError('PUBLIC_ENVIRONMENT', 'secret-like public variable rejected');
  }
  const secretStore = required(env, 'SECRET_STORE');
  if (secretStore !== 'mock' && secretStore !== 'external') throw new ConfigurationError('SECRET_STORE', 'unsupported secret store');
  if (secretStore === 'mock' && environment !== 'development' && environment !== 'test') throw new ConfigurationError('SECRET_STORE', 'mock store requires development or test');
  const publicAppUrl = origin(required(env, 'PUBLIC_APP_URL'), 'PUBLIC_APP_URL', environment);
  const origins = required(env, 'TRUSTED_ORIGINS').split(',').map((value) => origin(value.trim(), 'TRUSTED_ORIGINS', environment));
  if (!origins.includes(publicAppUrl)) throw new ConfigurationError('TRUSTED_ORIGINS', 'must include PUBLIC_APP_URL');
  const portText = env.API_PORT ?? '3001';
  if (!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) throw new ConfigurationError('API_PORT', 'expected an integer from 1 to 65535');
  const host = env.API_HOST ?? '127.0.0.1';
  if (!['127.0.0.1', '0.0.0.0', '::1', '::'].includes(host)) throw new ConfigurationError('API_HOST', 'expected an explicit bind address');
  return Object.freeze({
    environment,
    providers: Object.freeze({ payment: provider(env, 'PAYMENT_PROVIDER', environment), whatsapp: provider(env, 'WHATSAPP_PROVIDER', environment), model: provider(env, 'MODEL_PROVIDER', environment) }),
    publicAppUrl,
    trustedOrigins: Object.freeze([...new Set(origins)]),
    http: Object.freeze({ host, port: Number(portText) }),
    secretStore,
    connections: Object.freeze({ database: reference(required(env, 'DATABASE_URL'), environment, 'database', 'DATABASE_URL'), redis: reference(required(env, 'REDIS_URL'), environment, 'redis', 'REDIS_URL') }),
  });
}
