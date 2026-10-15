/**
 * Fake events + jamaah + registrations for local development.
 *   bun run db:seed:events          # insert
 *   bun run db:seed:events --clean  # remove rows created by this script
 * Fake rows are marked with the `[fake]` tag / `@fake.openmasjid.test` emails.
 */
import 'dotenv/config'
import { and, eq, inArray, isNull, like, sql } from 'drizzle-orm'
import { categories, events, registrants, tenants, users } from '../server/db/schema'
import type { DbOrTx } from '../server/utils/db'

if (process.env.DATABASE_DIRECT_URL) process.env.DATABASE_URL = process.env.DATABASE_DIRECT_URL
const { db: rootDb, withTenant } = await import('../server/utils/db')

const tenantSlug = process.env.SEED_TENANT_SLUG ?? 'al-hikmah'
const tenant = await rootDb.query.tenants.findFirst({ where: eq(tenants.slug, tenantSlug) })
if (!tenant) {
  console.error(`Tenant /${tenantSlug} not found — run \`bun run db:seed\` first.`)
  process.exit(1)
}
/** Tenant-scoped transaction handle (set before seed/clean run). */
let db: DbOrTx
const { saveEvent } = await import('../server/utils/events')
const { dateInTimeZone } = await import('../shared/utils/prayer')

const FAKE_DOMAIN = '@fake.openmasjid.test'

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

async function clean() {
  const fakeEvents = await db.select({ id: events.id }).from(events).where(sql`'[fake]' = ANY(${events.tags})`)
  const ids = fakeEvents.map((e) => e.id)
  if (ids.length) {
    await db.delete(registrants).where(inArray(registrants.eventId, ids))
    await db.delete(events).where(inArray(events.id, ids))
  }
  const fakeUsers = await db.select({ id: users.id }).from(users).where(and(eq(users.tenantId, tenant!.id), like(users.email, `%${FAKE_DOMAIN}`)))
  if (fakeUsers.length) {
    await db.delete(registrants).where(inArray(registrants.userId, fakeUsers.map((u) => u.id)))
    await db.delete(users).where(inArray(users.id, fakeUsers.map((u) => u.id)))
  }
  console.log(`✓ removed ${ids.length} events and ${fakeUsers.length} users`)
}

async function seed() {
  const admin = await db.query.users.findFirst({ where: and(eq(users.tenantId, tenant!.id), eq(users.role, 'admin'), isNull(users.deletedAt)) })
  if (!admin) throw new Error('Run `bun run db:seed` first (needs an admin user).')
  const cats = await db.query.categories.findMany({ where: isNull(categories.deletedAt) })
  const cat = (slug: string) => cats.find((c) => c.slug === slug)?.id ?? cats[0]!.id
  const today = dateInTimeZone('Asia/Jakarta')

  const names = ['Hidayat Wibowo', 'Sumarni Lestari', 'Rifki Nugroho', 'Sutopo Hadi', 'Aisyah Rahmani',
    'Bagus Pratama', 'Khairunnisa', 'Iskandar Maulana', 'Faris Akbar', 'Halimah Yusuf']
  const jamaah = await db
    .insert(users)
    .values(names.map((n, i) => ({
      fullName: n,
      email: `${n.toLowerCase().replace(/[^a-z]+/g, '.')}${FAKE_DOMAIN}`,
      phone: `+62 812-0000-${String(1000 + i)}`,
      role: 'jamaah' as const,
    })))
    .onConflictDoNothing()
    .returning({ id: users.id })

  const specs = [
    { title: 'Kajian Tafsir Al-Mulk', arabicTitle: 'تفسير سورة الملك', cat: 'kajian', day: 0, time: ['19:30', '21:00'], cap: 200, pinned: true,
      speaker: ['Ust. Ahmad Mahfudz, Lc.', 'Imam Tetap Masjid'] },
    { title: 'Tahsin Tilawah Pemula', arabicTitle: 'تحسين التلاوة', cat: 'tahsin', day: 1, time: ['16:00', '17:30'], cap: 4,
      speaker: ['Ustadzah Hafidzah Khairina', 'Hafidzah 30 Juz'] },
    { title: 'Pendaftaran Santri TPA Angkatan 14', arabicTitle: null, cat: 'tpa', day: 3, time: ['08:00', '16:00'], cap: 80,
      speaker: ['Panitia TPA', 'Koordinator Pendidikan'] },
    { title: 'Penyaluran Zakat Maal Triwulan', arabicTitle: 'توزيع الزكاة', cat: 'zakat', day: 5, time: ['09:00', '12:00'], cap: 150,
      speaker: ['Tim Amil Zakat', 'Amil'] },
    { title: 'Tabligh Akbar Tahun Baru Hijriyah', arabicTitle: 'مرحبا ١٤٤٨ هـ', cat: 'muharram', day: 30, time: ['20:00', '22:00'], cap: 1000,
      speaker: ['Ust. Dr. Yusuf Hanafi, M.A.', 'Pengajar Pondok Pesantren'], draft: true },
    { title: 'Kelas Bahasa Arab Dasar', arabicTitle: 'اللغة العربية', cat: 'kajian', day: -7, time: ['19:00', '20:30'], cap: 30,
      speaker: ['Ust. Faris Abdullah, M.Pd.', 'Alumni Universitas Madinah'] },
  ]

  for (const [i, s] of specs.entries()) {
    const id = await saveEvent(db, {
      title: s.title,
      arabicTitle: s.arabicTitle,
      categoryId: cat(s.cat),
      description: `Deskripsi contoh untuk ${s.title}. Terbuka untuk seluruh jamaah.`,
      tags: ['[fake]'],
      startDate: addDays(today, s.day),
      endDate: null,
      startTime: s.time[0]!,
      endTime: s.time[1]!,
      locationName: 'Ruang Utama Masjid',
      locationDetail: 'Lt. 1',
      addressFull: null,
      capacity: s.cap,
      bannerUrl: null,
      livestreamUrl: null,
      isLivestream: false,
      isPinned: !!s.pinned,
      requiresRegistration: true,
      status: s.draft ? 'draft' : 'published',
      speakers: [{ name: s.speaker[0]!, role: s.speaker[1]! }],
      agenda: [
        { startTime: s.time[0]!, endTime: null, title: 'Pembukaan & Tilawah', person: 'MC' },
        { startTime: null, endTime: null, title: 'Materi utama', person: s.speaker[0]! },
        { startTime: null, endTime: s.time[1]!, title: 'Tanya jawab & doa penutup', person: null },
      ],
    }, admin.id)

    if (s.draft) continue
    const take = jamaah.slice(0, Math.min(jamaah.length, s.cap, 3 + i))
    await db.insert(registrants).values(take.map((u, j) => ({
      eventId: id,
      userId: u.id,
      registeredAt: new Date(Date.now() - (j + i) * 86_400_000 / 2),
      attendedAt: s.day <= 0 && j % 2 === 0 ? new Date() : null,
      checkedInBy: s.day <= 0 && j % 2 === 0 ? admin.id : null,
      source: 'web' as const,
    })))
  }
  console.log(`✓ inserted ${specs.length} events, ${jamaah.length} jamaah`)
}

const run = process.argv.includes('--clean') ? clean : seed
withTenant(tenant.id, async (tx) => {
  db = tx
  await run()
})
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => process.exit())
