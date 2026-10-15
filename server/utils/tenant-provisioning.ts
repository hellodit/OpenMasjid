import { and, eq, isNull, sql } from 'drizzle-orm'
import { db, withTenant, type DbOrTx } from './db'
import { getTenantAuth } from './auth'
import { cashAccounts, categories, mosqueProfile, tenants, transactionCategories, users } from '../db/schema'

// Default data every new mosque starts with. Used by POST /api/onboarding
// and scripts/seed.ts.

export const EVENT_CATEGORY_SEED = [
  { slug: 'kajian',   name: 'Kajian',         icon: 'lucide:book-open',   sortOrder: 1 },
  { slug: 'tahsin',   name: 'Tahsin Quran',   icon: 'lucide:book-marked', sortOrder: 2 },
  { slug: 'tpa',      name: 'TPA / TPQ',      icon: 'lucide:users',       sortOrder: 3 },
  { slug: 'zakat',    name: 'Zakat & Sosial', icon: 'lucide:heart',       sortOrder: 4 },
  { slug: 'muharram', name: 'Hari Besar',     icon: 'lucide:moon',        sortOrder: 5 },
  { slug: 'umum',     name: 'Lainnya',        icon: 'lucide:tag',         sortOrder: 6 },
]

type CashbookSeed = {
  slug: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  colorToken?: string
  sortOrder: number
  children?: Array<Omit<CashbookSeed, 'children' | 'type'>>
}

export const CASHBOOK_CATEGORY_SEED: CashbookSeed[] = [
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
  { slug: 'hibah',        name: 'Hibah',         type: 'income', icon: 'lucide:gift', sortOrder: 5 },
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

/** Idempotent: inserts missing default categories and a cash account. Run inside withTenant(). */
export async function seedTenantDefaults(tx: DbOrTx) {
  const partial = { target: [categories.tenantId, categories.slug], where: sql`deleted_at IS NULL` }
  await tx.insert(categories).values(EVENT_CATEGORY_SEED).onConflictDoNothing(partial)

  const txPartial = { target: [transactionCategories.tenantId, transactionCategories.slug], where: sql`deleted_at IS NULL` }
  for (const top of CASHBOOK_CATEGORY_SEED) {
    await tx
      .insert(transactionCategories)
      .values({ slug: top.slug, name: top.name, type: top.type, icon: top.icon ?? null, sortOrder: top.sortOrder })
      .onConflictDoNothing(txPartial)
    const parent = await tx.query.transactionCategories.findFirst({
      where: and(eq(transactionCategories.slug, top.slug), isNull(transactionCategories.deletedAt)),
      columns: { id: true },
    })
    if (!parent || !top.children?.length) continue
    await tx
      .insert(transactionCategories)
      .values(top.children.map((c) => ({
        parentId: parent.id,
        slug: c.slug,
        name: c.name,
        type: top.type,
        icon: c.icon ?? null,
        sortOrder: c.sortOrder,
      })))
      .onConflictDoNothing(txPartial)
  }

  const hasAccount = await tx.query.cashAccounts.findFirst({ columns: { id: true } })
  if (!hasAccount) await tx.insert(cashAccounts).values({ name: 'Kas Tunai', type: 'cash', sortOrder: 1 })
}

export interface NewTenantInput {
  slug: string
  name: string
  timezone: string
  city?: string | null
  latitude?: number | null
  longitude?: number | null
}

/** Create tenant + mosque profile + default data. Returns the tenant row. */
export async function provisionTenant(input: NewTenantInput) {
  const [tenant] = await db.insert(tenants).values({ slug: input.slug, name: input.name }).returning()
  await withTenant(tenant!.id, async (tx) => {
    await tx.insert(mosqueProfile).values({
      name: input.name,
      city: input.city ?? null,
      timezone: input.timezone,
      latitude: input.latitude != null ? input.latitude.toFixed(6) : null,
      longitude: input.longitude != null ? input.longitude.toFixed(6) : null,
    })
    await seedTenantDefaults(tx)
  })
  return tenant!
}

/**
 * Create a staff account in a tenant through Better Auth (hashed password,
 * credential account), then set its role. Returns the user id.
 */
export async function createStaffUser(
  tenant: { id: string, slug: string },
  input: { name: string, email: string, password: string },
  role: 'admin' | 'viewer',
) {
  const result = await getTenantAuth(tenant).api.signUpEmail({
    body: { name: input.name, email: input.email, password: input.password },
  })
  await db
    .update(users)
    .set({ role, emailVerified: true })
    .where(and(eq(users.id, result.user.id), eq(users.tenantId, tenant.id)))
  return result.user.id
}

/** Hard delete (cascades to all tenant data). Used to roll back a failed onboarding. */
export async function destroyTenant(tenantId: string) {
  await db.delete(tenants).where(eq(tenants.id, tenantId))
}
