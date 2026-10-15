# AGENTS.md — OpenMasjid

Panduan kerja untuk AI agent (Claude Code, Codex, Cursor, dll.) dan kontributor manusia.
Baca file ini sebelum mengubah kode.

**Bahasa:**
- **Bahasa Inggris** untuk semua yang berupa kode: path URL & route (`/register`, `/admin/team`),
  nama file, identifier, nilai enum & key data (`member`, `fajr`, `dhuhr`), id/anchor HTML, komentar,
  log script, dan pesan commit.
- **Bahasa Indonesia** hanya untuk teks yang dilihat pengguna: label UI, pesan error/validasi, toast,
  serta data contoh/seed (nama kategori, slug konten).

---

## 1. Stack (wajib — jangan diganti tanpa diskusi)

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Framework | **Nuxt 4** (`app/`, `server/`, `shared/`) | Ikuti konvensi direktori Nuxt 4 |
| UI | **Nuxt UI v4** (`@nuxt/ui`) + Tailwind CSS v4 | Semua kontrol interaktif pakai komponen `U*` |
| ORM & migrasi | **Drizzle ORM** (`drizzle-orm` 0.45.x stable) + **drizzle-kit** | Relasi via `relations()` |
| Validasi | **Zod v4** + **drizzle-zod** | Skema di `shared/schemas/*`, dipakai server & form |
| Auth | **Better Auth** (drizzle adapter, cookie session) | Mount di `/api/auth/*` |
| Database | PostgreSQL 15+ (Supabase hanya sebagai host Postgres) | Tidak memakai Supabase Auth / supabase-js |
| Jadwal sholat | `adhan` | Dihitung di `shared/utils/prayer.ts` |
| Package manager | **Bun** | `bun install`, `bun run <script>` |

Versi di-pin persis di `package.json`. `typescript` (5.9) dan `vue-tsc` (3.1) sengaja di-pin
supaya `nuxi typecheck` berjalan — TypeScript 6/7 belum didukung vue-tsc.

> Drizzle 1.0 (RQB v2 / `defineRelations`) masih RC. Saat sudah stabil, migrasi relasi
> dari `server/db/schema/relations.ts` ke `defineRelations` dan cek kompatibilitas adapter Better Auth.

---

## 1a. Multi-tenancy (WAJIB dibaca)

OpenMasjid melayani **banyak masjid (tenant)** dari satu deployment dan satu database
(shared schema + kolom `tenant_id` + Row Level Security). Desain lengkap:
[docs/multi-tenant-architecture.md](docs/multi-tenant-architecture.md).

- **Routing berbasis path.** Halaman masjid: `/<slug>/…` (`app/pages/[tenant]/**`). API masjid:
  `/api/t/<slug>/…` (`server/api/t/[tenant]/**`). Global: `/` (landing + direktori), `/register`
  (onboarding), `/api/tenants`, `/api/onboarding`, `/api/health`.
- **Tenant hanya dari URL.** `server/middleware/00.tenant.ts` me-resolve slug → `event.context.tenant`
  (cache 60 detik, `invalidateTenant(slug)` setelah ubah nama/zona waktu). JANGAN pernah menerima
  `tenantId` dari body/query.
- **Setiap handler tenant memakai `defineTenantHandler(access, (event, { tenant, user, db }) => …)`**
  (`server/utils/auth.ts`) dengan `access` = `public` | `staff` (admin+viewer, baca) | `admin` (tulis) |
  `owner` (pemilik masjid: kelola pengurus). Badan handler berjalan di dalam `withTenant()` —
  transaksi yang mengeset `app.tenant_id`. **Gunakan `db` dari context, bukan `db` global.**
- **RLS** aktif + `FORCE` di semua tabel data masjid (policy `<table>_tenant_isolation`, fail-closed:
  tanpa `app.tenant_id` → 0 baris). Kolom `tenant_id` default ke `app.tenant_id`, jadi insert di dalam
  `withTenant` otomatis terlabel. App wajib konek dengan role `openmasjid_app`
  (`server/db/sql/app-role.sql`) — superuser/BYPASSRLS melewati RLS.
- **Direktori publik:** `GET /api/tenants?q=&limit=` (cari nama/kota/slug, hasil prefix nama di atas).
  Hanya kolom global `slug`, `name`, `city` dari `tenants`. `tenants.name`/`city` disalin dari
  `mosque_profile` saat pengaturan disimpan (`settings/mosque.put.ts`) — jangan ekspos kolom lain.
- **Pengecualian RLS:** tabel auth (`users`, `sessions`, `accounts`, `verifications`) dan `tenants`
  tidak memakai RLS (Better Auth mengaksesnya di luar transaksi tenant). Query ke `users` di handler
  **wajib** filter `eq(users.tenantId, tenant.id)` atau lewat join dari tabel yang ter-RLS.
- **Composite FK** `(tenant_id, x_id) → parent(tenant_id, id)` untuk semua relasi antar tabel tenant
  (pengecekan FK di Postgres tidak tunduk pada RLS). Tabel induk punya `unique(tenant_id, id)`.
  Tabel tenant baru: `tenantId: tenantIdColumn()`, `tenantIsolationPolicy('<table>', t.tenantId)`,
  composite FK, unique per tenant, index diawali `tenant_id`, lalu tambahkan ke
  migrasi custom (seperti `0001_force_rls.sql`) untuk `FORCE ROW LEVEL SECURITY`.
- **Akun per masjid.** Email unik per `(tenant_id, lower(email))`. Tiap masjid punya instance Better Auth
  sendiri (`getTenantAuth(tenant)`: basePath `/api/t/<slug>/auth`, cookie prefix `om_<slug>`, adapter
  yang men-scope model `user` ke tenant). `getAuthUser()` menolak sesi yang user-nya beda tenant.
- **Peran:** `admin`, `viewer`, `member` (jamaah); **pemilik** = `tenants.owner_user_id` (seorang admin).
  Pengurus baru masuk lewat undangan (`tenant_invitations`, token sekali pakai, hash sha256).
- **Frontend:** `useApiBase()` → `` `/api/t/${slug}` `` (tipe template literal agar `useFetch` tetap
  ter-infer), `useTenantPath()` → `tp('/admin/…')`, `useTenantContext()` (tenant + user dari
  `/api/t/<slug>/context`, tanpa token sesi), `getAuthClient(slug)`.
- **Uji isolasi:** `bun run test:isolation` (server harus jalan). Wajib hijau sebelum merge perubahan
  yang menyentuh API/skema tenant; tambahkan kasus baru untuk endpoint baru.

---

## 2. Struktur direktori

```
app/                      # Frontend (Vue)
  app.vue                 # <UApp> wrapper (toast, tooltip, dll.)
  app.config.ts           # Warna Nuxt UI: primary=masjid, secondary=gilt, neutral=stone
  assets/css/main.css     # Tailwind v4 + Nuxt UI + @theme token (cms-*, tv-*, masjid-*, gilt-*)
  assets/css/admin.css    # Pola/ornamen CMS (cms-pattern-*, cms-banner-<slug>, cms-eyebrow…)
  assets/css/display.css  # Ornamen layar TV
  middleware/auth.global.ts  # 404 masjid tak dikenal; guard /[tenant]/admin/** (admin|viewer), team (owner)
  composables/useTenant.ts   # useTenantSlug, useApiBase, useTenantPath, useTenantContext
  composables/useAuth.ts  # user, isStaff, isAdmin, isOwner, signIn, signOut (per masjid)
  utils/auth-client.ts    # getAuthClient(slug) — Better Auth client per masjid
  utils/format.ts         # formatRupiah, formatDate, initials, timeAgo, … (auto-import)
  pages/index.vue          # landing: hero search masjid (→ /<slug>) + direktori
  pages/register.vue       # onboarding masjid baru
  components/platform/     # komponen halaman global (MosqueSearch)
  pages/[tenant]/          # portal, display (TV), transparency, auth/*, admin/** per masjid
  components/admin|display/
server/
  middleware/00.tenant.ts # /api/t/<slug>/… → event.context.tenant
  api/tenants.get.ts, api/onboarding/**   # global
  api/t/[tenant]/auth/[...all].ts         # Better Auth per masjid
  api/t/[tenant]/public/**                # publik (defineTenantHandler('public'))
  api/t/[tenant]/admin/**                 # CMS (staff/admin/owner)
  db/schema/*.ts          # Tabel Drizzle (+ relations.ts, _enums.ts, _columns.ts)
  db/migrations/          # SQL hasil drizzle-kit (JANGAN diedit manual setelah di-commit)
  utils/                  # auto-import Nitro: db (withTenant), auth (getTenantAuth, defineTenantHandler),
                          # tenant, tenant-provisioning, team, rate-limit, validate, balance, period,
                          # mosque, events, cashbook — util data menerima `db` (tx tenant) sebagai argumen pertama
shared/                   # Dipakai app & server (import: #shared/...)
  schemas/*.ts            # Zod: common, auth, cashbook, events, mosque, tenants
  utils/prayer.ts         # adhan → jadwal sholat, label hijriyah
  utils/events.ts         # status turunan event/pendaftar
  types/auth.ts           # UserRole, STAFF_ROLES
scripts/                  # seed, seed-*-fake (SEED_TENANT_SLUG), test-isolation, health-check, scheduler
```

---

## 3. Database & migrasi (Drizzle)

- Skema: `server/db/schema/*.ts`, diekspor lewat `server/db/schema/index.ts` (termasuk `relations.ts`).
- Alur perubahan skema:
  1. Ubah file skema.
  2. `bun run db:generate --name <deskripsi_singkat>` → SQL baru di `server/db/migrations/`.
  3. **Review SQL-nya** (perhatikan prompt rename, DROP, perubahan index).
  4. `bun run db:migrate` (pakai `DATABASE_DIRECT_URL`, role owner).
  drizzle-kit tidak selalu mengurutkan constraint dengan benar (mis. composite FK sebelum
  `UNIQUE(tenant_id, id)` yang dirujuknya) — urutkan ulang SQL **sebelum** di-commit.
  SQL yang tidak bisa diekspresikan drizzle (mis. `FORCE ROW LEVEL SECURITY`): `drizzle-kit generate --custom --name …`
  (lihat `0001_force_rls.sql`). Aplikasi masih baru: baseline migrasi adalah `0000_init.sql`.
  Jangan pakai `db:push` untuk database bersama/produksi.
- Konvensi tabel:
  - PK `uuid` `defaultRandom()`.
  - Soft delete: spread `...timestamps` dari `_columns.ts` (`created_at`, `updated_at` auto `$onUpdate`, `deleted_at`).
    Semua query baca **wajib** memfilter `isNull(table.deletedAt)`.
  - Audit: `created_by` / `updated_by` → `users.id` (`onDelete: 'set null'`), isi dari `user.id` di `defineTenantHandler('admin', …)`.
  - Unique yang menghormati soft delete pakai **partial unique index** `.where(sql\`deleted_at IS NULL\`)`;
    `onConflictDoNothing` untuk index ini wajib menyertakan `where` yang sama.
  - Uang: `numeric(14,2)` sebagai **string**. Jumlahkan dengan `sumMoney`/`subMoney` (`server/utils/balance.ts`), bukan float.
  - Tanggal kalender: kolom `date` (string `YYYY-MM-DD`); jam: `time`.
- Relasi: setiap FK punya pasangan di `relations.ts`. Jika dua FK menunjuk tabel yang sama, beri
  `relationName` di kedua sisi. Gunakan `db.query.<table>.findMany({ with: {...} })` untuk data bertingkat.
- **Jebakan Drizzle**: pada `select` satu tabel, kolom dirender TANPA nama tabel (`"id"`). Di dalam
  subquery berkorelasi, referensi ke baris luar harus pakai identifier lengkap
  (`sql.raw('"cash_accounts"."id"')`) — lihat `balanceExpr`. Bug ini dulu membuat saldo tidak pernah
  menghitung transaksi.
- `mosque_profile`: satu baris per tenant (unique `tenant_id`), juga menyimpan pengaturan jadwal sholat
  (`prayer_method`, `asr_madhab`, `prayer_adjustments`, `iqamah_offsets`). Nama masjid disinkronkan
  ke `tenants.name` (direktori).

---

## 4. Validasi (Zod)

- Semua input API divalidasi dengan skema dari `shared/schemas/*` lewat
  `readZodBody(event, schema)` / `readZodQuery(event, schema)` (`server/utils/validate.ts`).
- Skema dasar diturunkan dari tabel Drizzle dengan `createInsertSchema` (drizzle-zod), lalu
  di-`pick`/`extend`/`refine` untuk kontrak API. Pesan error berbahasa Indonesia.
- Form di frontend memakai skema yang **sama**: `<UForm :schema="xxxSchema" :state="state" @submit>`.
- Helper: `isoDate`, `timeOfDay`, `money`, `positiveMoney`, `nullableText(max)` (string kosong → `null`),
  `queryBool`, `pagination`, `periodQuery` di `shared/schemas/common.ts`.
- ID dari route: `requireRouterId(event)`. Pencarian `ILIKE` wajib `escapeLike(q)`.

---

## 5. Auth & otorisasi (Better Auth)

- Instance **per masjid**: `getTenantAuth(tenant)` di `server/utils/auth.ts` (lihat §1a). Membaca env
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` langsung dari `process.env` supaya juga jalan di script CLI.
- Model `user` = tabel `users` (field `name` → `fullName`); tabel `sessions`, `accounts`,
  `verifications`. ID uuid (`advanced.database.generateId: 'uuid'`). Field tambahan: `tenantId`
  (diisi adapter), `role` (`input: false`), `phone`, `isActive`. Hook `session.create.before` menolak
  user nonaktif/terhapus/beda tenant.
- Server guard: `defineTenantHandler('staff' | 'admin' | 'owner' | 'public', …)`. Role & status
  dibaca ulang dari DB per request (cookie cache bisa basi). Menonaktifkan pengurus menghapus sesinya.
- Client: `useAuth()` / `useTenantContext()`; middleware global melindungi `/[tenant]/admin/**`.
  Sembunyikan aksi tulis dari viewer (`isAdmin`) dan menu pengurus dari non-owner (`isOwner`),
  tapi keamanan tetap di server.
- Masjid baru + pemiliknya: `POST /api/onboarding` (UI `/register`), memakai `provisionTenant()` +
  `createStaffUser()` (`server/utils/tenant-provisioning.ts`). Seed lokal: `bun run db:seed`.
- Reset password & undangan: belum ada mailer — tautan di-log di server dan undangan ditampilkan
  sekali ke pemilik (**TODO: mailer**). Endpoint di luar Better Auth memakai `rateLimit()`.
- Tidak ada bypass auth. Jangan menambahkannya.

---

## 6. Aturan domain penting

- **Buku Kas**
  - Saldo akun = saldo awal + pemasukan + transfer masuk − pengeluaran − transfer keluar (transaksi tidak terhapus).
  - Total saldo menghitung **semua** akun yang belum dihapus, termasuk yang diarsipkan.
  - Akun hanya boleh diarsipkan/dihapus jika saldonya 0 (409 jika tidak).
  - Edit transaksi lama tetap boleh walau akun/kategorinya sudah diarsipkan; validasi "aktif" hanya
    untuk referensi yang **diubah**. Tipe transaksi tidak bisa diubah.
  - Bentuk transfer vs income/expense juga dijaga oleh CHECK `transactions_transfer_shape`.
  - Periode laporan ("hari ini/bulan ini") dihitung di **timezone masjid** (`tenant.timezone`), bukan UTC.
  - Export CSV menetralkan formula injection.
- **Kegiatan**: status tersimpan hanya `draft|published|archived`; `ongoing` & `full` diturunkan
  (`deriveEventStatus`). PUT event mengganti seluruh data termasuk speakers & agenda dalam satu transaksi.
- **Isolasi**: data satu masjid tidak boleh terlihat/terubah/terujuk oleh masjid lain — termasuk lewat id
  dari URL/body. Akses id milik masjid lain harus menghasilkan 404 (bukan 403).
- **Pendaftar**: status turunan `confirmed|attended|cancelled` dari `attended_at`/`cancelled_at`.
- **Jadwal sholat**: `computePrayerTimes(date, settings)`; metode `kemenag` = sudut 20°/18° + ihtiyat 2 menit.
  Tanggal selalu tanggal lokal masjid.

---

## 7. Frontend (Nuxt UI)

- Pakai komponen Nuxt UI untuk input, tombol, modal, tabel, badge, toast (`useToast()`), dropdown.
  Ikon: `i-lucide-*` (prop Nuxt UI) atau `<Icon name="lucide:*">`.
- Token desain: `*-cms-*` (CMS krem/hijau), `*-tv-*` (layar TV gelap), palet `masjid-*` (= primary) dan
  `gilt-*` (= secondary). Jangan menamai token baru dengan nama yang bentrok dengan utilitas Nuxt UI
  (`muted`, `dimmed`, `toned`, `elevated`, `accented`, `inverted`, `default`).
- Data: `useFetch('/api/...')` (tipe otomatis dari handler), `$fetch` untuk mutasi. Cookie terkirim otomatis.
- Mode warna dinonaktifkan (`ui.colorMode: false`); desain CMS terang, TV gelap.
- Jangan membuat data palsu di UI. Fitur tanpa backend → sembunyikan, jangan dipalsukan.

---

## 8. Perintah

```bash
bun install
bun run dev                 # http://localhost:3000
bun run lint                # eslint (harus 0 error)
bun run typecheck           # nuxi typecheck (harus 0 error)
bun run build

bun run db:generate --name x   # buat migrasi dari perubahan skema
bun run db:migrate             # terapkan migrasi
bun run db:seed                # satu masjid (SEED_TENANT_SLUG) + data default + pemilik
bun run test:isolation         # uji isolasi lintas masjid (butuh server jalan)
bun run db:seed:cashbook       # transaksi kas palsu (--clean untuk hapus)
bun run db:seed:events         # kegiatan + jamaah + pendaftar palsu (--clean untuk hapus)
bun run db:seed:tenants        # beberapa masjid fiktif untuk direktori/pencarian (--clean)
bun run db:studio
```

Script data palsu (`db:seed:events`, `db:seed:cashbook`) sengaja konek sebagai role aplikasi agar
RLS membatasinya ke satu masjid. Script yang konek sebagai owner (`db:seed`, provisioning) **wajib**
memfilter `tenant_id` secara eksplisit — RLS tidak berlaku untuk owner/superuser.

Postgres lokal: jalankan `server/db/sql/app-role.sql` sekali, lalu `DATABASE_URL` memakai role
`openmasjid_app` dan `DATABASE_DIRECT_URL` memakai role owner (lihat `.env.example`).

---

## 9. Checklist sebelum commit

- [ ] `bun run lint` dan `bun run typecheck` bersih.
- [ ] Endpoint tenant baru memakai `defineTenantHandler` dengan level akses yang tepat dan `db` dari context.
- [ ] Tabel tenant baru: `tenant_id`, policy RLS + FORCE, composite FK, unique per tenant.
- [ ] Query ke `users` difilter `tenant_id`.
- [ ] `bun run test:isolation` hijau (tambahkan kasus untuk endpoint baru).
- [ ] Input divalidasi skema Zod dari `shared/schemas`.
- [ ] Query baca memfilter `deleted_at IS NULL`.
- [ ] Perubahan skema disertai migrasi hasil `db:generate` yang sudah direview.
- [ ] Teks UI berbahasa Indonesia; tidak ada data mock.
- [ ] Update file ini jika menambah konvensi baru.
