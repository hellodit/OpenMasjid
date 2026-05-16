import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import {
  categories,
  mosqueProfile,
  MOSQUE_PROFILE_SINGLETON_ID,
  users,
} from '../server/db/schema'

const url = process.env.DATABASE_DIRECT_URL
if (!url) {
  console.error('DATABASE_DIRECT_URL is not set — aborting seed.')
  process.exit(1)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client, { casing: 'snake_case' })

const CATEGORY_SEED = [
  { slug: 'kajian',   name: 'Kajian',         icon: 'lucide:book-open',   sortOrder: 1 },
  { slug: 'tahsin',   name: 'Tahsin Quran',   icon: 'lucide:book-marked', sortOrder: 2 },
  { slug: 'tpa',      name: 'TPA / TPQ',      icon: 'lucide:users',       sortOrder: 3 },
  { slug: 'zakat',    name: 'Zakat & Sosial', icon: 'lucide:heart',       sortOrder: 4 },
  { slug: 'muharram', name: 'Hari Besar',     icon: 'lucide:moon',        sortOrder: 5 },
  { slug: 'umum',     name: 'Lainnya',        icon: 'lucide:tag',         sortOrder: 6 },
]

async function seedCategories() {
  const result = await db
    .insert(categories)
    .values(CATEGORY_SEED)
    .onConflictDoNothing({ target: categories.slug })
    .returning({ slug: categories.slug })
  console.log(`✓ categories: inserted ${result.length} new (out of ${CATEGORY_SEED.length})`)
}

async function seedMosqueProfile() {
  const result = await db
    .insert(mosqueProfile)
    .values({
      id: MOSQUE_PROFILE_SINGLETON_ID,
      slug: 'al-hikmah',
      name: 'Masjid Al-Hikmah',
      arabicName: 'مَسْجِد الْحِكْمَة',
      tagline: 'Mengabdi kepada Allah, melayani jamaah.',
      yearFounded: 1987,
      capacity: 600,
      countryCode: 'ID',
      timezone: 'Asia/Jakarta',
    })
    .onConflictDoNothing({ target: mosqueProfile.id })
    .returning({ id: mosqueProfile.id })
  console.log(`✓ mosque_profile: ${result.length ? 'inserted singleton' : 'already exists'}`)
}

async function promoteOwner() {
  const ownerId = process.env.OWNER_USER_ID
  if (!ownerId) {
    console.warn('⚠ OWNER_USER_ID not set — skipping owner promotion.')
    return
  }
  const result = await db
    .update(users)
    .set({ role: 'owner', updatedAt: new Date() })
    .where(eq(users.id, ownerId))
    .returning({ id: users.id, email: users.email })
  if (result.length === 0) {
    console.warn(
      `⚠ No users row found for OWNER_USER_ID=${ownerId}. ` +
        'Make sure the user signed up via Supabase Auth first so the trigger creates a public.users row.',
    )
    return
  }
  console.log(`✓ users: promoted ${result[0].email} to role='owner'`)
}

async function main() {
  console.log('Seeding OpenMasjid…')
  await seedCategories()
  await seedMosqueProfile()
  await promoteOwner()
  console.log('Done.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => client.end({ timeout: 5 }))
