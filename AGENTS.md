# AGENTS.md — OpenMasjid

Panduan kerja untuk AI agent (Claude Code, Codex, Cursor, dll.) dan kontributor manusia.
Baca file ini sebelum mengubah kode. Bahasa UI & pesan error: **Bahasa Indonesia**.
Identifier kode, komentar, dan commit: bahasa Inggris.

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

## 2. Struktur direktori

```
app/                      # Frontend (Vue)
  app.vue                 # <UApp> wrapper (toast, tooltip, dll.)
  app.config.ts           # Warna Nuxt UI: primary=masjid, secondary=gilt, neutral=stone
  assets/css/main.css     # Tailwind v4 + Nuxt UI + @theme token (cms-*, tv-*, masjid-*, gilt-*)
  assets/css/admin.css    # Pola/ornamen CMS (cms-pattern-*, cms-banner-<slug>, cms-eyebrow…)
  assets/css/display.css  # Ornamen layar TV
  middleware/auth.global.ts  # Guard /admin/** (role admin|viewer)
  composables/useAuth.ts  # Session, signIn, signOut, isAdmin, isStaff
  utils/auth-client.ts    # Better Auth client (better-auth/vue)
  utils/format.ts         # formatRupiah, formatDate, initials, timeAgo, … (auto-import)
  pages/                  # / (portal), /display (TV), /transparency, /auth/*, /admin/*
  components/admin|display/
server/
  api/auth/[...all].ts    # Better Auth handler
  api/public/**           # Endpoint publik (tanpa login)
  api/admin/**            # Endpoint CMS (wajib requireStaff/requireAdmin)
  db/schema/*.ts          # Tabel Drizzle (+ relations.ts, _enums.ts, _columns.ts)
  db/migrations/          # SQL hasil drizzle-kit (JANGAN diedit manual setelah di-commit)
  utils/                  # auto-import Nitro: db, auth, validate, balance, period, mosque, events, cashbook
shared/                   # Dipakai app & server (import: #shared/...)
  schemas/*.ts            # Zod: common, auth, cashbook, events, mosque
  utils/prayer.ts         # adhan → jadwal sholat, label hijriyah
  utils/events.ts         # status turunan event/pendaftar
  types/auth.ts           # UserRole, STAFF_ROLES
scripts/                  # seed, seed-cashbook-fake, seed-events-fake, health-check, scheduler
```

---

## 3. Database & migrasi (Drizzle)

- Skema: `server/db/schema/*.ts`, diekspor lewat `server/db/schema/index.ts` (termasuk `relations.ts`).
- Alur perubahan skema:
  1. Ubah file skema.
  2. `bun run db:generate --name <deskripsi_singkat>` → SQL baru di `server/db/migrations/`.
  3. **Review SQL-nya** (perhatikan prompt rename, DROP, perubahan index).
  4. `bun run db:migrate` (pakai `DATABASE_DIRECT_URL`).
  Jangan pakai `db:push` untuk database bersama/produksi.
- Konvensi tabel:
  - PK `uuid` `defaultRandom()`.
  - Soft delete: spread `...timestamps` dari `_columns.ts` (`created_at`, `updated_at` auto `$onUpdate`, `deleted_at`).
    Semua query baca **wajib** memfilter `isNull(table.deletedAt)`.
  - Audit: `created_by` / `updated_by` → `users.id` (`onDelete: 'set null'`), isi dari `requireAdmin()`.
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
- `mosque_profile` adalah singleton (`MOSQUE_PROFILE_SINGLETON_ID`), juga menyimpan pengaturan jadwal sholat
  (`prayer_method`, `asr_madhab`, `prayer_adjustments`, `iqamah_offsets`).

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

- Instance: `server/utils/auth.ts` (`auth`). Membaca env `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
  langsung dari `process.env` supaya juga jalan di script CLI.
- Model `user` = tabel `users` (field `name` dipetakan ke `fullName`); tabel `sessions`, `accounts`,
  `verifications`. ID uuid (`advanced.database.generateId: 'uuid'`).
- Field tambahan: `role` (`admin|viewer|jamaah`, `input: false` — user tidak bisa set sendiri),
  `phone`, `isActive`. Hook `session.create.before` menolak user nonaktif/terhapus.
- Server guard (wajib di setiap handler `server/api/admin/**`):
  - `requireStaff(event)` → baca (admin + viewer)
  - `requireAdmin(event)` → tulis (admin saja)
  - `requireAuth(event, roles?)` / `getAuthUser(event)` untuk kasus lain.
  Role dibaca ulang dari DB per request (cookie cache bisa basi).
- Client: `useAuth()`; middleware global melindungi `/admin/**` dan memaksa role admin/viewer.
  Sembunyikan aksi tulis dari viewer (`isAdmin`), tapi keamanan tetap di server.
- Reset password: `sendResetPassword` saat ini hanya `console.info` URL-nya (**TODO: mailer**).
- Admin pertama dibuat oleh `bun run db:seed` dari `SEED_ADMIN_EMAIL/PASSWORD/NAME`.
- Tidak ada lagi `DEV_BYPASS_AUTH`. Jangan menambah bypass auth.

---

## 6. Aturan domain penting

- **Buku Kas**
  - Saldo akun = saldo awal + pemasukan + transfer masuk − pengeluaran − transfer keluar (transaksi tidak terhapus).
  - Total saldo menghitung **semua** akun yang belum dihapus, termasuk yang diarsipkan.
  - Akun hanya boleh diarsipkan/dihapus jika saldonya 0 (409 jika tidak).
  - Edit transaksi lama tetap boleh walau akun/kategorinya sudah diarsipkan; validasi "aktif" hanya
    untuk referensi yang **diubah**. Tipe transaksi tidak bisa diubah.
  - Bentuk transfer vs income/expense juga dijaga oleh CHECK `transactions_transfer_shape`.
  - Periode laporan ("hari ini/bulan ini") dihitung di **timezone masjid** (`getMosqueTimezone()`), bukan UTC.
  - Export CSV menetralkan formula injection.
- **Kegiatan**: status tersimpan hanya `draft|published|archived`; `ongoing` & `full` diturunkan
  (`deriveEventStatus`). PUT event mengganti seluruh data termasuk speakers & agenda dalam satu transaksi.
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
bun run db:seed                # kategori, profil masjid, kategori kas, admin pertama
bun run db:seed:cashbook       # transaksi kas palsu (--clean untuk hapus)
bun run db:seed:events         # kegiatan + jamaah + pendaftar palsu (--clean untuk hapus)
bun run db:studio
```

Postgres lokal cukup: `DATABASE_URL` dan `DATABASE_DIRECT_URL` boleh sama (lihat `.env.example`).

---

## 9. Checklist sebelum commit

- [ ] `bun run lint` dan `bun run typecheck` bersih.
- [ ] Endpoint admin baru memanggil `requireStaff`/`requireAdmin`.
- [ ] Input divalidasi skema Zod dari `shared/schemas`.
- [ ] Query baca memfilter `deleted_at IS NULL`.
- [ ] Perubahan skema disertai migrasi hasil `db:generate` yang sudah direview.
- [ ] Teks UI berbahasa Indonesia; tidak ada data mock.
- [ ] Update file ini jika menambah konvensi baru.
