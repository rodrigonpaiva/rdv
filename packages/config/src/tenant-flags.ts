import { ConfigurationError } from './runtime.js';
import type { EnvironmentName, ServerConfig } from './runtime.js';

export interface TenantFlagSnapshot {
  readonly tenantId: string;
  readonly environment: EnvironmentName;
  readonly version: number;
  readonly botEnabled: boolean;
  readonly pixEnabled: boolean;
  readonly botIntegrationActive: boolean;
  readonly pixIntegrationActive: boolean;
}
export type TenantOperation = 'bot.mutate' | 'pix.create' | 'payment.reconcile' | 'refund.resolve';

/** Validates a server-owned snapshot. Persistence, auditing and identity are later tasks. */
export function validateTenantFlags(value: unknown, environment: EnvironmentName, tenantId: string): TenantFlagSnapshot {
  if (!tenantId || tenantId !== tenantId.trim()) throw new ConfigurationError('TENANT_CONTEXT', 'trusted tenant is required');
  if (!value || typeof value !== 'object') throw new ConfigurationError('TENANT_FLAGS', 'snapshot required');
  const raw = value as Record<string, unknown>;
  if (raw.tenantId !== tenantId || raw.environment !== environment) throw new ConfigurationError('TENANT_FLAGS', 'tenant or environment mismatch');
  if (!Number.isSafeInteger(raw.version) || (raw.version as number) < 1) throw new ConfigurationError('TENANT_FLAGS', 'positive version required');
  const fields = ['botEnabled', 'pixEnabled', 'botIntegrationActive', 'pixIntegrationActive'] as const;
  for (const key of fields) if (typeof raw[key] !== 'boolean') throw new ConfigurationError('TENANT_FLAGS', 'boolean flags required');
  return Object.freeze({ tenantId, environment, version: raw.version as number, botEnabled: raw.botEnabled as boolean, pixEnabled: raw.pixEnabled as boolean, botIntegrationActive: raw.botIntegrationActive as boolean, pixIntegrationActive: raw.pixIntegrationActive as boolean });
}

/** Flag gate only, not authorization or a claim that an external adapter can resolve work.
 * Existing financial obligations bypass creation switches, but never tenant/env validation.
 */
export function isTenantOperationEnabled(config: ServerConfig, tenantId: string, snapshot: unknown, operation: TenantOperation): boolean {
  if (!tenantId || tenantId !== tenantId.trim()) throw new ConfigurationError('TENANT_CONTEXT', 'trusted tenant is required');
  const flags = snapshot === undefined ? undefined : validateTenantFlags(snapshot, config.environment, tenantId);
  if (operation === 'payment.reconcile' || operation === 'refund.resolve') return true;
  if (!flags) return false;
  if (operation === 'pix.create') return flags.pixEnabled && flags.pixIntegrationActive && config.providers.payment !== 'disabled';
  if (operation === 'bot.mutate') return flags.botEnabled && flags.botIntegrationActive && config.providers.model !== 'disabled' && config.providers.whatsapp !== 'disabled';
  return false;
}
