import { ManualClock } from '@agenda/testkit';

export const fixtureInstant = '2026-01-15T12:00:00.000Z';
export const tenantFixtures = Object.freeze([
  Object.freeze({ id: '00000000-0000-4000-8000-000000000001', name: 'Synthetic tenant Alpha' }),
  Object.freeze({ id: '00000000-0000-4000-8000-000000000002', name: 'Synthetic tenant Beta' }),
]);

// Caller owns the disposable database and passes its migration connection.
// No customer contacts, accounts, appointments or financial data are seeded.
export async function seedTenants(client, clock = new ManualClock(fixtureInstant)) {
  await client.query('BEGIN');
  try {
    for (const tenant of tenantFixtures) {
      await client.query(`INSERT INTO tenants (id, name, created_at, updated_at)
        VALUES ($1, $2, $3, $3) ON CONFLICT (id) DO NOTHING`, [tenant.id, tenant.name, clock.now()]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
