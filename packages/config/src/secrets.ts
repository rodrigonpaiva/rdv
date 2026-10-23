import { ConfigurationError, loadServerConfig } from './runtime.js';
import type { EnvironmentInput, SecretReference, ServerConfig } from './runtime.js';

/** Supplied by a server-side vault adapter, never by HTTP input or a model. */
export interface SecretResolver {
  resolve(reference: SecretReference): Promise<string | undefined>;
}

export class SecretValue {
  #value: string;
  constructor(value: string) { this.#value = value; Object.freeze(this); }
  /** Explicit adapter-only access. Never log, spread or return this value in a DTO. */
  read(): string { return this.#value; }
  toJSON(): string { return '[REDACTED]'; }
  toString(): string { return '[REDACTED]'; }
  [Symbol.for('nodejs.util.inspect.custom')](): string { return '[REDACTED]'; }
}

export interface ServerRuntime {
  readonly config: ServerConfig;
  readonly secrets: Readonly<{ database: SecretValue; redis: SecretValue }>;
}
export const SERVER_RUNTIME = Symbol('SERVER_RUNTIME');

function mockResolver(): SecretResolver {
  return {
    async resolve(ref) {
      if (ref.environment !== 'development' && ref.environment !== 'test') return undefined;
      if (ref.purpose === 'database' && ref.key === `secret://${ref.environment}/platform/database`) return `postgresql://synthetic:synthetic@127.0.0.1:15432/agenda_${ref.environment}`;
      if (ref.purpose === 'redis' && ref.key === `secret://${ref.environment}/platform/redis`) return 'redis://127.0.0.1:16379/0';
      return undefined;
    },
  };
}

async function resolveConnection(ref: SecretReference, resolver: SecretResolver): Promise<SecretValue> {
  let value: string | undefined;
  try { value = await resolver.resolve(ref); } catch { throw new ConfigurationError('SECRET_STORE', 'secret resolution failed'); }
  if (!value?.trim()) throw new ConfigurationError('SECRET_STORE', 'required secret is missing');
  let url: URL;
  try { url = new URL(value); } catch { throw new ConfigurationError('SECRET_STORE', 'invalid connection secret'); }
  const protocols = ref.purpose === 'database' ? ['postgres:', 'postgresql:'] : ['redis:', 'rediss:'];
  if (!protocols.includes(url.protocol) || !url.hostname || url.hash) throw new ConfigurationError('SECRET_STORE', 'invalid connection secret');
  if ((ref.environment === 'staging' || ref.environment === 'production') && ref.purpose === 'redis' && url.protocol !== 'rediss:') throw new ConfigurationError('SECRET_STORE', 'TLS required for Redis');
  return new SecretValue(value);
}

/** Runs before Nest creation. Resolves references but never connects to a database/provider. */
export async function prepareServerRuntime(env: EnvironmentInput, resolver?: SecretResolver): Promise<ServerRuntime> {
  const config = loadServerConfig(env);
  if (config.secretStore === 'external' && !resolver) throw new ConfigurationError('SECRET_STORE', 'external resolver is required');
  if (config.secretStore === 'mock' && resolver) throw new ConfigurationError('SECRET_STORE', 'external resolver cannot override the mock store');
  const selected = config.secretStore === 'mock' ? mockResolver() : resolver!;
  const database = await resolveConnection(config.connections.database, selected);
  const redis = await resolveConnection(config.connections.redis, selected);
  return Object.freeze({ config, secrets: Object.freeze({ database, redis }) });
}
