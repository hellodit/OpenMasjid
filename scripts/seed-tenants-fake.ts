/**
 * Fake mosques (tenants) for local development of the directory / landing search.
 *   bun run db:seed:tenants          # insert (idempotent)
 *   bun run db:seed:tenants --clean  # remove them
 * Fictional names; no owner accounts are created.
 */
import 'dotenv/config'
import { inArray } from 'drizzle-orm'
import { tenants } from '../server/db/schema'

if (process.env.DATABASE_DIRECT_URL) process.env.DATABASE_URL = process.env.DATABASE_DIRECT_URL
const { db } = await import('../server/utils/db')
const { provisionTenant } = await import('../server/utils/tenant-provisioning')

const FAKE = [
  { slug: 'nurul-huda-bandung', name: 'Masjid Nurul Huda', city: 'Bandung', timezone: 'Asia/Jakarta', latitude: -6.914744, longitude: 107.60981 },
  { slug: 'baitur-rahman-surabaya', name: 'Masjid Baitur Rahman', city: 'Surabaya', timezone: 'Asia/Jakarta', latitude: -7.257472, longitude: 112.75209 },
  { slug: 'al-ikhlas-yogyakarta', name: 'Masjid Al-Ikhlas', city: 'Yogyakarta', timezone: 'Asia/Jakarta', latitude: -7.795580, longitude: 110.36949 },
  { slug: 'darussalam-medan', name: 'Masjid Darussalam', city: 'Medan', timezone: 'Asia/Jakarta', latitude: 3.595196, longitude: 98.672226 },
  { slug: 'an-nur-makassar', name: 'Masjid An-Nur', city: 'Makassar', timezone: 'Asia/Makassar', latitude: -5.147665, longitude: 119.432732 },
]

async function main() {
  if (process.argv.includes('--clean')) {
    const removed = await db.delete(tenants).where(inArray(tenants.slug, FAKE.map((f) => f.slug))).returning({ slug: tenants.slug })
    console.log(`✓ removed ${removed.length} fake mosques`)
    return
  }
  const existing = new Set(
    (await db.select({ slug: tenants.slug }).from(tenants).where(inArray(tenants.slug, FAKE.map((f) => f.slug)))).map((r) => r.slug),
  )
  let created = 0
  for (const t of FAKE) {
    if (existing.has(t.slug)) continue
    await provisionTenant(t)
    created++
  }
  console.log(`✓ fake mosques: ${created} created, ${existing.size} already present`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => process.exit())
