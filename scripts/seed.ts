/**
 * Seed one mosque (tenant) with default data and its owner account.
 *   bun run db:seed
 * Env: SEED_TENANT_SLUG, SEED_TENANT_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME.
 * Idempotent: re-running only fills in what is missing.
 */
import 'dotenv/config'
import { and, eq, sql } from 'drizzle-orm'
import { tenants, users } from '../server/db/schema'

// Seeds use the direct (owner) connection; the app modules read DATABASE_URL.
if (process.env.DATABASE_DIRECT_URL) process.env.DATABASE_URL = process.env.DATABASE_DIRECT_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_DIRECT_URL / DATABASE_URL is not set — aborting seed.')
  process.exit(1)
}

const { db, withTenant } = await import('../server/utils/db')
const { provisionTenant, seedTenantDefaults, createStaffUser } = await import('../server/utils/tenant-provisioning')

const slug = process.env.SEED_TENANT_SLUG ?? 'al-hikmah'
const name = process.env.SEED_TENANT_NAME ?? 'Masjid Al-Hikmah'

async function seedTenant() {
  let tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
  if (!tenant) {
    tenant = await provisionTenant({ slug, name, timezone: 'Asia/Jakarta', city: 'Jakarta Pusat', latitude: -6.175392, longitude: 106.827153 })
    console.log(`✓ tenant: created /${slug}`)
  }
  else {
    await withTenant(tenant.id, (tx) => seedTenantDefaults(tx, tenant!.id))
    console.log(`✓ tenant: /${slug} exists, defaults ensured`)
  }
  return tenant
}

async function seedOwner(tenant: { id: string, slug: string, ownerUserId: string | null }) {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Admin DKM'
  if (!email || !password) {
    console.warn('⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping owner account.')
    return
  }

  const findUser = () =>
    db.query.users.findFirst({ where: and(eq(users.tenantId, tenant.id), eq(sql`lower(${users.email})`, email)) })

  let user = await findUser()
  if (!user) {
    await createStaffUser(tenant, { name: adminName, email, password }, 'admin')
    user = await findUser()
    console.log(`✓ users: created ${email} in /${tenant.slug}`)
  }
  if (!user) throw new Error('Owner user was not created')
  if (user.role !== 'admin') await db.update(users).set({ role: 'admin', emailVerified: true }).where(eq(users.id, user.id))
  if (!tenant.ownerUserId) await db.update(tenants).set({ ownerUserId: user.id }).where(eq(tenants.id, tenant.id))
  console.log(`✓ owner: ${email}`)
}

async function main() {
  console.log('Seeding OpenMasjid…')
  const tenant = await seedTenant()
  await seedOwner(tenant)
  console.log(`Done. Open http://localhost:3000/${slug}/admin`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => process.exit())
