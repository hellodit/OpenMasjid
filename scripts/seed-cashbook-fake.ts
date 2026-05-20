import 'dotenv/config'
import { and, eq, isNull, like } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../server/db/schema'
import {
  cashAccounts,
  transactionCategories,
  transactions,
  users,
} from '../server/db/schema'

const url = process.env.DATABASE_DIRECT_URL
if (!url) {
  console.error('DATABASE_DIRECT_URL is not set — aborting.')
  process.exit(1)
}

const client = postgres(url, { max: 1 })
const db = drizzle(client, { schema, casing: 'snake_case' })

const SEED_TAG = '[fake]'
const PERIOD_DAYS = 30

type AccountRow = { id: string; name: string; type: 'cash' | 'bank' | 'ewallet' }
type CategoryRow = { id: string; slug: string; type: 'income' | 'expense' }

const DEFAULT_ACCOUNTS: Array<Omit<AccountRow, 'id'> & { openingBalance: string; sortOrder: number }> = [
  { name: 'Kas Tunai',         type: 'cash',    openingBalance: '2500000', sortOrder: 1 },
  { name: 'Bank Syariah',      type: 'bank',    openingBalance: '15000000', sortOrder: 2 },
  { name: 'E-Wallet (Saweria)', type: 'ewallet', openingBalance: '500000', sortOrder: 3 },
]

const rng = (() => {
  let s = 0x42cabb01
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
})()
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]!
const randInt = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))
const choice = <T,>(...items: Array<[T, number]>): T => {
  const total = items.reduce((a, [, w]) => a + w, 0)
  let r = rng() * total
  for (const [v, w] of items) {
    r -= w
    if (r <= 0) return v
  }
  return items[items.length - 1]![0]
}

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10)

async function ensureAccounts(): Promise<AccountRow[]> {
  const existing = await db.query.cashAccounts.findMany({
    where: isNull(cashAccounts.deletedAt),
    columns: { id: true, name: true, type: true },
    orderBy: cashAccounts.sortOrder,
  })
  if (existing.length > 0) {
    console.log(`✓ Found ${existing.length} existing cash account(s) — reusing.`)
    return existing
  }
  console.log('• No cash accounts found — creating defaults.')
  const inserted = await db
    .insert(cashAccounts)
    .values(DEFAULT_ACCOUNTS)
    .returning({ id: cashAccounts.id, name: cashAccounts.name, type: cashAccounts.type })
  return inserted
}

async function loadCategories(): Promise<{ income: CategoryRow[]; expense: CategoryRow[] }> {
  const rows = await db.query.transactionCategories.findMany({
    where: and(eq(transactionCategories.isActive, true), isNull(transactionCategories.deletedAt)),
    columns: { id: true, slug: true, type: true },
  })
  const income = rows.filter((r) => r.type === 'income')
  const expense = rows.filter((r) => r.type === 'expense')
  if (income.length === 0 || expense.length === 0) {
    throw new Error(
      'transaction_categories tabel kosong / belum ada income+expense. Jalankan `npm run db:seed` dulu.',
    )
  }
  return { income, expense }
}

async function pickCreator(): Promise<string> {
  const envId = process.env.ADMIN_USER_ID
  if (envId) {
    const row = await db.query.users.findFirst({ where: eq(users.id, envId), columns: { id: true } })
    if (row) return row.id
    console.warn(`⚠ ADMIN_USER_ID=${envId} not in users table — falling back to first admin.`)
  }
  const admin = await db.query.users.findFirst({
    where: eq(users.role, 'admin'),
    columns: { id: true },
  })
  if (admin) return admin.id
  const anyUser = await db.query.users.findFirst({ columns: { id: true } })
  if (anyUser) return anyUser.id

  console.log('• Tabel users kosong — bikin dummy admin buat createdBy.')
  const [bootstrap] = await db
    .insert(users)
    .values({
      email: 'seed-bot@local.invalid',
      fullName: 'Seed Bot',
      role: 'admin',
    })
    .returning({ id: users.id })
  return bootstrap!.id
}

type TxInsert = typeof transactions.$inferInsert

function buildTransactions(
  accounts: AccountRow[],
  cats: { income: CategoryRow[]; expense: CategoryRow[] },
  createdBy: string,
): TxInsert[] {
  const out: TxInsert[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (PERIOD_DAYS - 1))

  const findCat = (slug: string, kind: 'income' | 'expense') => {
    const list = kind === 'income' ? cats.income : cats.expense
    return list.find((c) => c.slug === slug) ?? list[0]!
  }

  const cash = accounts.find((a) => a.type === 'cash') ?? accounts[0]!
  const bank = accounts.find((a) => a.type === 'bank') ?? accounts[accounts.length - 1]!
  const wallet = accounts.find((a) => a.type === 'ewallet') ?? cash

  // Weekly: infaq Jumat (every Friday in the window)
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 5) {
      const cat = findCat('infaq-jumat', 'income')
      out.push({
        type: 'income',
        transactionDate: toIsoDate(d),
        accountId: cash.id,
        categoryId: cat.id,
        amount: String(randInt(1_400_000, 3_200_000)),
        description: `${SEED_TAG} Infaq Jum'at pekan ${toIsoDate(d)}`,
        referenceNumber: `JUM-${toIsoDate(d).replaceAll('-', '')}`,
        createdBy,
      })
    }
  }

  // Daily-ish: kotak amal (random ~60% days, mostly cash, sometimes wallet)
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    if (rng() < 0.6) {
      const cat = findCat('kotak-amal', 'income')
      const acc = rng() < 0.85 ? cash : wallet
      out.push({
        type: 'income',
        transactionDate: toIsoDate(d),
        accountId: acc.id,
        categoryId: cat.id,
        amount: String(randInt(75_000, 480_000)),
        description: `${SEED_TAG} Kotak amal harian`,
        createdBy,
      })
    }
  }

  // Sporadic donations / zakat / hibah (8–12 events, mostly bank transfers in)
  const donationCount = randInt(8, 12)
  const donationSlugs = ['donasi-renovasi', 'donasi-pembangunan', 'zakat-maal', 'zakat-fitrah', 'hibah']
  for (let i = 0; i < donationCount; i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + randInt(0, PERIOD_DAYS - 1))
    const slug = pick(donationSlugs)
    const cat = findCat(slug, 'income')
    out.push({
      type: 'income',
      transactionDate: toIsoDate(day),
      accountId: bank.id,
      categoryId: cat.id,
      amount: String(randInt(500_000, 5_000_000)),
      description: `${SEED_TAG} Donasi ${slug.replace(/-/g, ' ')} dari jamaah`,
      referenceNumber: `TRF-${randInt(100000, 999999)}`,
      createdBy,
    })
  }

  // Monthly utilities (once each)
  const utilities: Array<[string, [number, number], string]> = [
    ['op-listrik',  [650_000, 1_100_000], 'Tagihan listrik PLN'],
    ['op-air',      [180_000, 320_000],   'Tagihan air PDAM'],
    ['op-internet', [350_000, 500_000],   'Internet IndiHome'],
  ]
  for (const [slug, [lo, hi], desc] of utilities) {
    const day = new Date(start)
    day.setDate(day.getDate() + randInt(2, 10))
    const cat = findCat(slug, 'expense')
    out.push({
      type: 'expense',
      transactionDate: toIsoDate(day),
      accountId: bank.id,
      categoryId: cat.id,
      amount: String(randInt(lo, hi)),
      description: `${SEED_TAG} ${desc}`,
      createdBy,
    })
  }

  // Weekly kebersihan
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 7)) {
    const cat = findCat('op-kebersihan', 'expense')
    out.push({
      type: 'expense',
      transactionDate: toIsoDate(d),
      accountId: cash.id,
      categoryId: cat.id,
      amount: String(randInt(120_000, 220_000)),
      description: `${SEED_TAG} Honor petugas kebersihan mingguan`,
      createdBy,
    })
  }

  // Monthly honor imam/marbot/muadzin
  const honors: Array<[string, [number, number], string]> = [
    ['honor-imam',    [1_200_000, 1_800_000], 'Honor Imam'],
    ['honor-marbot',  [1_000_000, 1_400_000], 'Honor Marbot'],
    ['honor-muadzin', [800_000,   1_200_000], 'Honor Muadzin'],
  ]
  for (const [slug, [lo, hi], desc] of honors) {
    const day = new Date(today)
    day.setDate(day.getDate() - randInt(2, 8))
    const cat = findCat(slug, 'expense')
    out.push({
      type: 'expense',
      transactionDate: toIsoDate(day),
      accountId: bank.id,
      categoryId: cat.id,
      amount: String(randInt(lo, hi)),
      description: `${SEED_TAG} ${desc} bulan ini`,
      createdBy,
    })
  }

  // Kajian expenses (~3-4 events)
  const kajianCount = randInt(3, 4)
  for (let i = 0; i < kajianCount; i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + randInt(0, PERIOD_DAYS - 1))
    const slug = choice<'keg-kajian' | 'keg-bukber'>(['keg-kajian', 4], ['keg-bukber', 1])
    const cat = findCat(slug, 'expense')
    out.push({
      type: 'expense',
      transactionDate: toIsoDate(day),
      accountId: cash.id,
      categoryId: cat.id,
      amount: String(randInt(200_000, 850_000)),
      description: `${SEED_TAG} Konsumsi & ustadz untuk ${slug.replace('keg-', '')}`,
      createdBy,
    })
  }

  // Sosial / perawatan kecil (2–3 events)
  for (let i = 0; i < randInt(2, 3); i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + randInt(0, PERIOD_DAYS - 1))
    const slug = choice<'sosial' | 'perawatan'>(['sosial', 3], ['perawatan', 2])
    const cat = findCat(slug, 'expense')
    out.push({
      type: 'expense',
      transactionDate: toIsoDate(day),
      accountId: bank.id,
      categoryId: cat.id,
      amount: String(randInt(300_000, 1_500_000)),
      description: `${SEED_TAG} ${slug === 'sosial' ? 'Santunan dhuafa' : 'Perawatan karpet & AC'}`,
      createdBy,
    })
  }

  // 1–2 transfers cash → bank (setoran)
  for (let i = 0; i < randInt(1, 2); i++) {
    const day = new Date(start)
    day.setDate(day.getDate() + randInt(10, PERIOD_DAYS - 2))
    out.push({
      type: 'transfer',
      transactionDate: toIsoDate(day),
      accountId: cash.id,
      destinationAccountId: bank.id,
      categoryId: null,
      amount: String(randInt(2_000_000, 4_500_000)),
      description: `${SEED_TAG} Setor kas tunai ke bank`,
      referenceNumber: `SETOR-${randInt(1000, 9999)}`,
      createdBy,
    })
  }

  return out
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const clean = process.argv.includes('--clean')

  if (clean) {
    const deleted = await db
      .delete(transactions)
      .where(like(transactions.description, `${SEED_TAG}%`))
      .returning({ id: transactions.id })
    console.log(`✓ Cleaned ${deleted.length} previously-seeded fake transaction(s). Done.`)
    return
  }

  console.log(`Generating ${PERIOD_DAYS} hari fake cashbook data…`)
  const accounts = await ensureAccounts()
  const cats = await loadCategories()
  const createdBy = await pickCreator()

  const rows = buildTransactions(accounts, cats, createdBy)
  rows.sort((a, b) => String(a.transactionDate).localeCompare(String(b.transactionDate)))

  const income = rows.filter((r) => r.type === 'income').reduce((a, r) => a + Number(r.amount), 0)
  const expense = rows.filter((r) => r.type === 'expense').reduce((a, r) => a + Number(r.amount), 0)
  const transfer = rows.filter((r) => r.type === 'transfer').length
  console.log(`  • ${rows.length} transaksi total`)
  console.log(`  • Income  : Rp ${income.toLocaleString('id-ID')}`)
  console.log(`  • Expense : Rp ${expense.toLocaleString('id-ID')}`)
  console.log(`  • Transfer: ${transfer} kali`)

  if (dryRun) {
    console.log('— dry run, tidak insert ke DB.')
    return
  }

  const inserted = await db.insert(transactions).values(rows).returning({ id: transactions.id })
  console.log(`✓ Inserted ${inserted.length} transactions.`)
  console.log(`  Tip: cleanup dengan \`tsx scripts/seed-cashbook-fake.ts --clean\``)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => client.end({ timeout: 5 }))
