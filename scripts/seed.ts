import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import * as schema from '../server/db/schema'
import {
  categories,
  mosqueProfile,
  MOSQUE_PROFILE_SINGLETON_ID,
  transactionCategories,
  users,
} from '../server/db/schema'

const url = process.env.DATABASE_DIRECT_URL
if (!url) {
  console.error('DATABASE_DIRECT_URL is not set — aborting seed.')
  process.exit(1)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client, { schema, casing: 'snake_case' })

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

async function promoteAdmin() {
  const adminId = process.env.ADMIN_USER_ID
  if (!adminId) {
    console.warn('⚠ ADMIN_USER_ID not set — skipping admin promotion.')
    return
  }
  const result = await db
    .update(users)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(users.id, adminId))
    .returning({ id: users.id, email: users.email })
  if (result.length === 0) {
    console.warn(
      `⚠ No users row found for ADMIN_USER_ID=${adminId}. ` +
        'Make sure the user signed up via Supabase Auth first so the trigger creates a public.users row.',
    )
    return
  }
  console.log(`✓ users: promoted ${result[0].email} to role='admin'`)
}

type CashbookSeed = {
  slug: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  colorToken?: string
  sortOrder: number
  children?: Array<Omit<CashbookSeed, 'children' | 'type'>>
}

const CASHBOOK_CATEGORY_SEED: CashbookSeed[] = [
  // Income
  { slug: 'infaq-jumat',  name: "Infaq Jum'at",  type: 'income', icon: 'lucide:hand-coins', sortOrder: 1 },
  { slug: 'kotak-amal',   name: 'Kotak Amal',    type: 'income', icon: 'lucide:box',        sortOrder: 2 },
  {
    slug: 'donasi-terikat', name: 'Donasi Terikat', type: 'income', icon: 'lucide:gift', sortOrder: 3,
    children: [
      { slug: 'donasi-renovasi',    name: 'Renovasi',     icon: 'lucide:hammer', sortOrder: 1 },
      { slug: 'donasi-pembangunan', name: 'Pembangunan',  icon: 'lucide:building', sortOrder: 2 },
    ],
  },
  {
    slug: 'zakat', name: 'Zakat', type: 'income', icon: 'lucide:heart', sortOrder: 4,
    children: [
      { slug: 'zakat-maal',    name: 'Maal',    icon: 'lucide:coins',  sortOrder: 1 },
      { slug: 'zakat-fitrah',  name: 'Fitrah',  icon: 'lucide:wheat',  sortOrder: 2 },
    ],
  },
  { slug: 'hibah',        name: 'Hibah',         type: 'income', icon: 'lucide:gift-of-the-magi', sortOrder: 5 },
  { slug: 'pemasukan-lain', name: 'Lain-lain',   type: 'income', icon: 'lucide:circle-dollar-sign', sortOrder: 99 },

  // Expense
  {
    slug: 'operasional', name: 'Operasional', type: 'expense', icon: 'lucide:plug', sortOrder: 1,
    children: [
      { slug: 'op-listrik',    name: 'Listrik',    icon: 'lucide:zap',     sortOrder: 1 },
      { slug: 'op-air',        name: 'Air',        icon: 'lucide:droplet', sortOrder: 2 },
      { slug: 'op-internet',   name: 'Internet',   icon: 'lucide:wifi',    sortOrder: 3 },
      { slug: 'op-kebersihan', name: 'Kebersihan', icon: 'lucide:sparkles', sortOrder: 4 },
    ],
  },
  {
    slug: 'honor', name: 'Honor', type: 'expense', icon: 'lucide:user-check', sortOrder: 2,
    children: [
      { slug: 'honor-imam',    name: 'Imam',    icon: 'lucide:user', sortOrder: 1 },
      { slug: 'honor-marbot',  name: 'Marbot',  icon: 'lucide:user', sortOrder: 2 },
      { slug: 'honor-muadzin', name: 'Muadzin', icon: 'lucide:user', sortOrder: 3 },
    ],
  },
  {
    slug: 'kegiatan', name: 'Kegiatan', type: 'expense', icon: 'lucide:calendar', sortOrder: 3,
    children: [
      { slug: 'keg-kajian',    name: 'Kajian',     icon: 'lucide:book-open', sortOrder: 1 },
      { slug: 'keg-bukber',    name: 'Buka Puasa', icon: 'lucide:utensils',  sortOrder: 2 },
      { slug: 'keg-ramadhan',  name: 'Ramadhan',   icon: 'lucide:moon',      sortOrder: 3 },
    ],
  },
  { slug: 'perawatan',     name: 'Perawatan & Renovasi', type: 'expense', icon: 'lucide:wrench',  sortOrder: 4 },
  { slug: 'sosial',        name: 'Sosial',               type: 'expense', icon: 'lucide:heart-handshake', sortOrder: 5 },
  { slug: 'pengeluaran-lain', name: 'Lain-lain',         type: 'expense', icon: 'lucide:more-horizontal', sortOrder: 99 },
]

async function seedCashbookCategories() {
  let inserted = 0
  for (const top of CASHBOOK_CATEGORY_SEED) {
    const [topRow] = await db
      .insert(transactionCategories)
      .values({
        slug: top.slug,
        name: top.name,
        type: top.type,
        icon: top.icon ?? null,
        colorToken: top.colorToken ?? null,
        sortOrder: top.sortOrder,
      })
      .onConflictDoNothing()
      .returning({ id: transactionCategories.id, slug: transactionCategories.slug })

    if (topRow) inserted++

    const parentId =
      topRow?.id ??
      (
        await db.query.transactionCategories.findFirst({
          where: eq(transactionCategories.slug, top.slug),
          columns: { id: true },
        })
      )?.id

    if (!parentId || !top.children?.length) continue

    for (const child of top.children) {
      const res = await db
        .insert(transactionCategories)
        .values({
          parentId,
          slug: child.slug,
          name: child.name,
          type: top.type,
          icon: child.icon ?? null,
          colorToken: child.colorToken ?? null,
          sortOrder: child.sortOrder,
        })
        .onConflictDoNothing()
        .returning({ id: transactionCategories.id })
      if (res.length) inserted++
    }
  }
  console.log(`✓ transaction_categories: inserted ${inserted} new rows`)
}

async function main() {
  console.log('Seeding OpenMasjid…')
  await seedCategories()
  await seedMosqueProfile()
  await seedCashbookCategories()
  await promoteAdmin()
  console.log('Done.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => client.end({ timeout: 5 }))
