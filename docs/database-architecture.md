# Rancangan Arsitektur Database — OpenMasjid

> Dokumen ini menjelaskan rancangan skema database untuk aplikasi **OpenMasjid** (CMS Masjid + portal jamaah + TV display). Skema diturunkan dari halaman & komponen yang sudah ada pada Nuxt app (lihat [app/pages/admin](../app/pages/admin/) dan [app/composables/useAdminMock.ts](../app/composables/useAdminMock.ts)).

---

## 1. Ringkasan & Asumsi Teknis

| Item | Pilihan | Alasan |
|------|---------|--------|
| RDBMS | **PostgreSQL 15+** | Dukungan tipe `timestamptz`, `jsonb`, `enum`, `generated columns`, full-text search, `uuid_generate_v4()`. |
| Tipe Primary Key | `UUID v7` (atau `bigserial` untuk tabel volume tinggi seperti audit log) | UUID aman untuk dipakai pada URL publik (`/events/{id}`) dan multi-tenant. |
| Timezone | Semua waktu tersimpan **UTC** (`timestamptz`); konversi ke `Asia/Jakarta` dilakukan di aplikasi. Field `time` murni (mis. waktu sholat) disimpan sebagai `time without time zone` per masjid. |
| Soft delete | Kolom `deleted_at timestamptz NULL` untuk entitas user-facing (event, registrant, kategori, media). Tabel referensi (kategori sistem, prayer settings) cukup pakai flag `is_active`. |
| Audit | Semua tabel memiliki `created_at`, `updated_at`, `created_by`, `updated_by`. Perubahan penting dicatat di [activity_logs](#7-audit--observability). |
| Multi-tenant | Skema dirancang **multi-masjid sejak awal** (single deployment dapat melayani banyak masjid). Hampir semua tabel domain memiliki `tenant_id`. Row-level security (RLS) PostgreSQL dipakai untuk isolasi. |
| Naming | `snake_case`, tabel bentuk **jamak** (`events`, `registrants`), kolom FK `<entity>_id`. |

> Jika produk hanya akan dipakai untuk satu masjid, kolom `tenant_id` tetap dipertahankan agar migrasi ke multi-tenant tidak breaking. Default value cukup di-set pada DKM masjid pertama.

---

## 2. Peta Domain

```
┌────────────────────────────────────────────────────────────────────┐
│                        IDENTITAS & AKSES                           │
│  tenants ── users (1 user = 1 tenant) ── auth_sessions             │
├────────────────────────────────────────────────────────────────────┤
│                       PROFIL MASJID                                │
│  tenants ── tenant_contacts ── tenant_social_links ── media_assets │
├────────────────────────────────────────────────────────────────────┤
│                       JADWAL SHOLAT                                │
│  prayer_settings ── prayer_adjustments ── prayer_overrides         │
├────────────────────────────────────────────────────────────────────┤
│                     KEGIATAN / EVENT                               │
│  categories ── events ── event_speakers ── event_schedule_items    │
│             └─ event_tags ─ tags                                   │
│             └─ registrants                                         │
├────────────────────────────────────────────────────────────────────┤
│                     DONASI / KAMPANYE                              │
│  donation_campaigns ── donations                                   │
├────────────────────────────────────────────────────────────────────┤
│                  PENGUMUMAN & TV DISPLAY                           │
│  announcements ── display_settings                                 │
├────────────────────────────────────────────────────────────────────┤
│                          AUDIT                                     │
│  activity_logs ── auth_sessions                                    │
└────────────────────────────────────────────────────────────────────┘
```

ER-diagram tingkat tinggi (relasi inti):

```
tenants 1───* users           (setiap user terikat pada 1 tenant)
tenants 1───* categories
tenants 1───1 prayer_settings 1───* prayer_adjustments
tenants 1───1 display_settings
tenants 1───* announcements

categories 1───* events
events 1───* event_speakers
events 1───* event_schedule_items
events 1───* registrants
events *───* tags (via event_tags)
events 1───* media_assets (banner)

tenants 1───* donation_campaigns 1───* donations
```

---

## 3. Identitas & Akses

### `tenants`
Entitas root (tenant). Setiap masjid memiliki sub-domain / slug sendiri.

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | |
| `slug` | `text` UNIQUE | dipakai pada URL publik (`/m/al-hikmah`) |
| `name` | `text` NOT NULL | "Masjid Al-Hikmah" |
| `arabic_name` | `text` | "مَسْجِد الْحِكْمَة" |
| `tagline` | `text` | maks 240 char (cek di aplikasi) |
| `year_founded` | `smallint` | 1987 |
| `capacity` | `int` | estimasi kapasitas jamaah sholat |
| `address_line` | `text` | |
| `city` | `text` | |
| `province` | `text` | |
| `postal_code` | `text` | |
| `country_code` | `char(2)` DEFAULT `'ID'` | ISO-3166-1 |
| `latitude` | `numeric(9,6)` | untuk perhitungan waktu sholat |
| `longitude` | `numeric(9,6)` | |
| `timezone` | `text` NOT NULL | mis. `Asia/Jakarta` |
| `logo_asset_id` | `uuid` FK → `media_assets.id` NULL | |
| `banner_asset_id` | `uuid` FK → `media_assets.id` NULL | |
| `is_public_profile` | `boolean` DEFAULT true | flag "Profil publik aktif" |
| `is_visible_on_tv` | `boolean` DEFAULT true | |
| `is_registration_open`| `boolean` DEFAULT true | "Pendaftaran jamaah baru" |
| `is_maintenance` | `boolean` DEFAULT false | "Mode pemeliharaan" |
| `created_at`, `updated_at`, `deleted_at` | `timestamptz` | |

**Index**: `UNIQUE(slug)`, `INDEX(city)`, `INDEX(is_public_profile) WHERE deleted_at IS NULL`.

### `tenant_contacts`
Dipisah dari `tenants` agar bisa multi (telepon DKM, email zakat, dsb).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK |
| `kind` | `enum('phone','email','website','whatsapp')` |
| `value` | `text` |
| `label` | `text` NULL ("Sekretariat", "Imam") |
| `is_primary` | `boolean` |

### `tenant_social_links`

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK |
| `platform` | `enum('instagram','youtube','facebook','tiktok','x','threads')` |
| `handle_or_url` | `text` |

### `users`
Akun internal (admin DKM, operator, kontributor). **Setiap user terikat pada tepat satu `tenant`** — satu user hanya bisa mengelola satu masjid. Bila orang yang sama mengurus dua masjid, dibuat dua akun terpisah.

> **Bukan** jamaah pendaftar event (pendaftar disimpan di [`registrants`](#registrants) tanpa wajib akun).

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` FK → tenants NOT NULL | scope user; semua akses dibatasi tenant ini |
| `email` | `citext` | |
| `password_hash` | `text` | bcrypt/argon2 |
| `full_name` | `text` | |
| `phone` | `text` | |
| `role` | `enum('owner','admin','editor','viewer')` NOT NULL | peran user di dalam tenant |
| `avatar_asset_id` | `uuid` FK NULL | |
| `invited_by` | `uuid` FK → users NULL | siapa yang mengundang |
| `email_verified_at` | `timestamptz` NULL | |
| `last_login_at` | `timestamptz` NULL | |
| `is_active` | `boolean` DEFAULT true | |
| `created_at`, `updated_at`, `deleted_at` | | |

**Index**:
- `UNIQUE(tenant_id, email)` — email unik di dalam tenant; orang yang sama bisa pakai email berbeda untuk tenant lain.
- `INDEX(tenant_id, role)` — cari semua admin tenant tertentu.
- `INDEX(email)` — lookup login (lihat catatan di bawah).

> **Catatan login**: karena `email` tidak unik global, halaman [auth/login.vue](../app/pages/auth/login.vue) harus mengidentifikasi tenant terlebih dulu — misal lewat sub-domain (`alhikmah.openmasjid.id`) atau form pemilih masjid sebelum login.

### `auth_sessions`
Untuk login (cookie session) + reset password token.

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `user_id` | `uuid` FK |
| `kind` | `enum('session','password_reset','email_verify')` |
| `token_hash` | `text` UNIQUE | simpan hash, bukan plaintext |
| `ip` | `inet` |
| `user_agent` | `text` |
| `expires_at` | `timestamptz` |
| `revoked_at` | `timestamptz` NULL |

> Mendukung halaman [auth/login.vue](../app/pages/auth/login.vue) & [auth/forgot-password.vue](../app/pages/auth/forgot-password.vue).

---

## 4. Kegiatan / Event

### `categories`
Per masjid, agar tiap masjid bisa atur kategorinya sendiri. Seed bawaan: `kajian`, `tahsin`, `tpa`, `zakat`, `muharram`, `umum` (sesuai `CategoryId` di `useAdminMock.ts`).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK |
| `slug` | `text` ("kajian") |
| `name` | `text` ("Kajian Rutin") |
| `icon` | `text` (nama icon Lucide) |
| `color_token` | `text` NULL (CSS token: `cms-green-700`) |
| `sort_order` | `int` |
| `is_active` | `boolean` |

**Index**: `UNIQUE(tenant_id, slug)`.

### `events`

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` FK | |
| `category_id` | `uuid` FK → categories | |
| `title` | `text` NOT NULL | |
| `arabic_title` | `text` NULL | "تفسير سورة الملك" |
| `slug` | `text` | unik per masjid; dipakai di URL publik |
| `description_md` | `text` | markdown |
| `language` | `enum('id','ar','en','mix')` DEFAULT `'id'` | |
| `start_date` | `date` NOT NULL | |
| `end_date` | `date` NULL | |
| `start_time` | `time` NULL | NULL jika "Ba'da X" |
| `end_time` | `time` NULL | |
| `time_anchor` | `enum('fix','subuh','dhuhur','ashar','maghrib','isya')` DEFAULT `'fix'` | "Patokan Waktu" |
| `time_anchor_offset_min` | `smallint` DEFAULT 0 | jeda dari adzan |
| `location_name` | `text` | "Ruang Utama Masjid" |
| `location_detail` | `text` | "Lt. 1, Mihrab Selatan" |
| `address_full` | `text` | |
| `capacity` | `int` NULL | |
| `recurrence_rule` | `text` NULL | iCal RRULE; NULL = tidak berulang |
| `banner_asset_id` | `uuid` FK → media_assets NULL | |
| `requires_registration` | `boolean` DEFAULT true | |
| `livestream_url` | `text` NULL | aktif jika `is_livestream` |
| `is_livestream` | `boolean` DEFAULT false | |
| `is_pinned` | `boolean` DEFAULT false | |
| `status` | `enum('draft','published','ongoing','full','archived')` DEFAULT `'draft'` | derive `ongoing`/`full` di app/view; status persistent = `draft`/`published`/`archived` |
| `published_at` | `timestamptz` NULL | |
| `created_at`, `updated_at`, `deleted_at` | | |

**Index**:
- `INDEX(tenant_id, start_date)` — list event tanggal X.
- `INDEX(tenant_id, status, start_date)` — daftar publik.
- `INDEX(category_id)`.
- `UNIQUE(tenant_id, slug)`.
- Full-text: `GIN(to_tsvector('simple', title || ' ' || description_md))`.

> Status `full` lebih baik dihitung di-view (`SELECT … CASE WHEN registered_count >= capacity THEN 'full'`) ketimbang disimpan agar tidak inkonsisten.

### `event_speakers`
Satu event bisa punya >1 pembicara.

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `event_id` | `uuid` FK |
| `name` | `text` ("Ust. Ahmad Mahfudz, Lc.") |
| `role` | `text` ("Imam Tetap Masjid Al-Hikmah") |
| `bio` | `text` |
| `avatar_asset_id` | `uuid` FK NULL |
| `sort_order` | `int` |

### `event_schedule_items`
Rundown acara (lihat `SCHEDULE` di mock).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `event_id` | `uuid` FK |
| `start_time` | `time` |
| `end_time` | `time` NULL |
| `title` | `text` ("Tausiyah Utama") |
| `actor` | `text` ("Ust. Ahmad Mahfudz, Lc.") |
| `sort_order` | `int` |

### `tags` & `event_tags`

```
tags(id, tenant_id, slug UNIQUE per masjid, label)
event_tags(event_id, tag_id, PRIMARY KEY(event_id, tag_id))
```

### `registrants`
Pendaftar event. Tidak wajib login (cukup email + nama + phone).

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | |
| `event_id` | `uuid` FK | |
| `full_name` | `text` NOT NULL | |
| `email` | `citext` | |
| `phone` | `text` | format E.164 |
| `notes` | `text` | catatan dari pendaftar |
| `status` | `enum('pending','confirmed','attended','cancelled','waitlist')` DEFAULT `'pending'` | |
| `registered_at` | `timestamptz` NOT NULL DEFAULT now() | |
| `confirmed_at` | `timestamptz` NULL | |
| `attended_at` | `timestamptz` NULL | |
| `checked_in_by` | `uuid` FK → users NULL | siapa yang check-in |
| `source` | `enum('web','qr','tv','admin','import')` DEFAULT `'web'` | |
| `created_at`, `updated_at`, `deleted_at` | | |

**Index**:
- `INDEX(event_id, status)` — hitung kapasitas terpakai.
- `UNIQUE(event_id, email) WHERE email IS NOT NULL` — cegah double register.
- `INDEX(email)`, `INDEX(phone)` — cari riwayat jamaah.

> Mendukung halaman [admin/registrants.vue](../app/pages/admin/registrants.vue).

---

## 5. Jadwal Sholat

### `prayer_settings` (1 row per masjid)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `tenant_id` | `uuid` PK FK | one-to-one |
| `auto_calculation` | `boolean` DEFAULT true | toggle "Otomatis" |
| `method` | `enum('kemenag','mwl','isna','egypt','makkah','karachi','custom')` | |
| `madzhab_asr` | `enum('syafii','hanafi')` DEFAULT `'syafii'` | |
| `fajr_angle` | `numeric(4,2)` DEFAULT 20.0 | derajat |
| `isha_angle` | `numeric(4,2)` DEFAULT 18.0 | |
| `timezone` | `text` | umumnya copy dari `tenants.timezone` |
| `imsak_minutes` | `smallint` DEFAULT 10 | |
| `jumat_khutbah_time` | `time` | |
| `time_format` | `enum('24h','12h')` DEFAULT `'24h'` | |
| `label_language` | `enum('id_ar','id','ar')` DEFAULT `'id_ar'` | |
| `countdown_mode` | `enum('next','all','none')` DEFAULT `'next'` | |
| `show_imsak_in_ramadan` | `boolean` DEFAULT true | |
| `show_tarawih` | `boolean` DEFAULT true | |
| `auto_play_adzan` | `boolean` DEFAULT false | |
| `last_synced_at` | `timestamptz` NULL | "Diperbarui 12 menit yang lalu" |
| `sync_source` | `text` NULL | "Kemenag RI" |

### `prayer_adjustments`
Penyesuaian per sholat (menit offset adzan & iqamat). 6 baris per masjid: subuh, terbit, dzuhur, ashar, maghrib, isya.

| Kolom | Tipe |
|-------|------|
| `tenant_id` | `uuid` FK |
| `prayer` | `enum('subuh','terbit','dzuhur','ashar','maghrib','isya')` |
| `adzan_offset_min` | `smallint` DEFAULT 0 |
| `iqamah_offset_min` | `smallint` NULL |
| **PK** | `(tenant_id, prayer)` |

### `prayer_overrides`
Override manual jadwal pada tanggal tertentu (lebaran, sholat khusus). Sub-bagian "Override Manual" di settings.

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK |
| `for_date` | `date` |
| `prayer` | `enum('subuh','terbit','dzuhur','ashar','maghrib','isya')` |
| `adzan_at` | `time` |
| `iqamah_at` | `time` NULL |
| `note` | `text` |

**Index**: `UNIQUE(tenant_id, for_date, prayer)`.

---

## 6. Donasi, Pengumuman & TV Display

### `donation_campaigns`
Kartu di dashboard "Donasi Aktif" ([app/components/admin/dashboard/DonationBar.vue](../app/components/admin/dashboard/DonationBar.vue)).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK |
| `title` | `text` ("Renovasi Atap Selatan") |
| `description_md` | `text` |
| `target_amount` | `numeric(14,2)` | dalam IDR |
| `currency` | `char(3)` DEFAULT `'IDR'` |
| `starts_at` | `date` |
| `ends_at` | `date` NULL |
| `cover_asset_id` | `uuid` FK NULL |
| `status` | `enum('draft','active','closed')` |
| `created_at`, `updated_at`, `deleted_at` | | |

### `donations`
Catatan donasi masuk. Bisa manual/integrasi payment gateway.

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `campaign_id` | `uuid` FK |
| `donor_name` | `text` NULL | NULL = "Hamba Allah" |
| `donor_email` | `citext` NULL |
| `donor_phone` | `text` NULL |
| `amount` | `numeric(14,2)` |
| `currency` | `char(3)` |
| `payment_method` | `enum('cash','transfer','qris','ewallet','card','other')` |
| `payment_ref` | `text` NULL | nomor referensi gateway |
| `is_anonymous` | `boolean` DEFAULT false |
| `received_at` | `timestamptz` NOT NULL |
| `recorded_by` | `uuid` FK → users NULL |
| `note` | `text` NULL |
| `created_at` | | |

**Index**: `INDEX(campaign_id, received_at DESC)`, `INDEX(payment_ref)`.

Aggregat (total terkumpul, % progress) dihitung via view:
```sql
CREATE VIEW donation_campaign_stats AS
SELECT c.id, c.target_amount,
       COALESCE(SUM(d.amount), 0) AS collected_amount,
       ROUND(COALESCE(SUM(d.amount), 0) / NULLIF(c.target_amount, 0) * 100, 1) AS pct
FROM donation_campaigns c
LEFT JOIN donations d ON d.campaign_id = c.id
GROUP BY c.id;
```

### `announcements`
Marquee di TV ([app/components/display/AnnouncementMarquee.vue](../app/components/display/AnnouncementMarquee.vue)).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK |
| `body` | `text` |
| `priority` | `smallint` DEFAULT 0 | semakin besar semakin atas |
| `active_from` | `timestamptz` |
| `active_until` | `timestamptz` NULL |
| `is_active` | `boolean` DEFAULT true |

**Index**: `INDEX(tenant_id, active_from, active_until)`.

### `display_settings` (1 row per masjid)
Konfigurasi tampilan layar TV.

| Kolom | Tipe |
|-------|------|
| `tenant_id` | `uuid` PK FK |
| `theme` | `enum('khatam','classic','minimal')` DEFAULT `'khatam'` |
| `show_announcements` | `boolean` DEFAULT true |
| `show_next_prayer_card` | `boolean` DEFAULT true |
| `show_hijri_date` | `boolean` DEFAULT true |
| `idle_screen_seconds` | `int` DEFAULT 30 |
| `extra_config` | `jsonb` | sisa setting bebas |

---

## 7. Audit & Observability

### `activity_logs`
Mengisi panel "Aktivitas Terkini" ([app/components/admin/dashboard/ActivityFeed.vue](../app/components/admin/dashboard/ActivityFeed.vue)).

| Kolom | Tipe |
|-------|------|
| `id` | `bigserial` PK |
| `tenant_id` | `uuid` FK NULL |
| `actor_user_id` | `uuid` FK NULL |
| `action` | `text` ("event.published", "registrant.checked_in") |
| `target_kind` | `text` ("event", "registrant") |
| `target_id` | `uuid` NULL |
| `metadata` | `jsonb` | snapshot perubahan / detail |
| `ip` | `inet` |
| `created_at` | `timestamptz` DEFAULT now() |

**Index**: `INDEX(tenant_id, created_at DESC)`, `INDEX(target_kind, target_id)`. Partisi bulanan jika volume besar.

### `media_assets`
Sentralisasi file upload (logo, banner masjid, banner event, foto pembicara).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `tenant_id` | `uuid` FK NULL | NULL untuk aset global |
| `kind` | `enum('logo','banner','poster','avatar','document')` |
| `mime_type` | `text` |
| `byte_size` | `bigint` |
| `width` | `int` NULL |
| `height` | `int` NULL |
| `storage_provider` | `enum('local','s3','r2','gcs')` |
| `storage_key` | `text` | path / object key |
| `original_filename` | `text` |
| `checksum_sha256` | `text` |
| `uploaded_by` | `uuid` FK → users NULL |
| `created_at` | | |

---

## 8. Strategi Index & Performa

Berikut query "kritis" yang sering dipanggil dan index pendukungnya:

| Query | Tabel | Index |
|-------|-------|-------|
| List event terbit per masjid, paginasi tanggal | `events` | `(tenant_id, status, start_date DESC)` |
| Detail event + jumlah pendaftar | `events`, `registrants` | `registrants(event_id, status)` — `COUNT(*) FILTER (WHERE status <> 'cancelled')` |
| Search registrants berdasarkan nama/email | `registrants` | `INDEX(event_id)` + `INDEX(email)` + `GIN(to_tsvector(full_name))` opsional |
| Dashboard "Kegiatan Hari Ini" | `events` | `(tenant_id, start_date)` partial `WHERE deleted_at IS NULL AND status='published'` |
| TV display data (sholat hari ini, marquee, event hari ini) | `prayer_settings`, `prayer_adjustments`, `prayer_overrides`, `announcements`, `events` | Mostly cached di Redis 1–5 menit, fall back ke DB. |

> **Materialized view** opsional `mv_event_capacity` (event_id, registered_count, attended_count) di-refresh tiap N detik untuk halaman list yang sering diakses.

---

## 9. Enum & Constraint Penting

```sql
-- contoh deklarasi enum tipe-aman
CREATE TYPE event_status     AS ENUM ('draft','published','ongoing','full','archived');
CREATE TYPE registrant_status AS ENUM ('pending','confirmed','attended','cancelled','waitlist');
CREATE TYPE prayer_name      AS ENUM ('subuh','terbit','dzuhur','ashar','maghrib','isya');
CREATE TYPE user_role        AS ENUM ('owner','admin','editor','viewer');
```

Constraint check yang wajib:
- `events`: `CHECK (end_date IS NULL OR end_date >= start_date)`, `CHECK (capacity IS NULL OR capacity > 0)`.
- `registrants`: `CHECK ((email IS NOT NULL) OR (phone IS NOT NULL))` — minimal salah satu kontak.
- `donations`: `CHECK (amount > 0)`.
- `prayer_settings`: `CHECK (fajr_angle BETWEEN 12 AND 25)`, `CHECK (isha_angle BETWEEN 12 AND 25)`.

---

## 10. Keamanan & Privasi

- **PII** (`registrants.email`, `registrants.phone`, `donations.donor_*`) tidak ditampilkan ke endpoint publik. Hanya bisa diakses user dengan `users.role IN ('owner','admin','editor')` dan `users.tenant_id` sama dengan tenant resource.
- **Row-Level Security (RLS)**: aktifkan untuk tabel ber-`tenant_id`. Saat login, backend mengambil `tenant_id` dari baris `users` lalu menetapkan `SET app.current_tenant = '<uuid>'` per koneksi; policy menyaring `tenant_id = current_setting('app.current_tenant')::uuid`. Karena 1 user = 1 tenant, tidak perlu pemilih tenant runtime.
- **Password reset & session**: token disimpan sebagai hash (`sha256`), bukan plaintext.
- **Backup**: harian (full) + WAL streaming. Retensi 30 hari.
- **GDPR/UU PDP**: cascade soft-delete saat user "lupakan saya" — set `full_name='Anonim'`, `email=NULL`, `phone=NULL` pada `registrants` lama yang dimiliki user tsb.

---

## 11. Strategi Migrasi & Seeding

1. **Migration tool**: rekomendasi [drizzle-kit](https://orm.drizzle.team/) atau [Prisma Migrate]; seeder Node script idiomatis dengan Nuxt server.
2. **Seed wajib** saat onboarding masjid pertama:
   - 1 baris `tenants` + 1 `users` (`tenant_id` = tenant tsb, `role = 'owner'`).
   - 6 baris `categories` default.
   - 1 baris `prayer_settings` + 6 baris `prayer_adjustments`.
   - 1 baris `display_settings`.
3. **Skema versioning**: 1 file migrasi per perubahan, nama `YYYYMMDDhhmm_<judul>.sql`.

---

## 12. Pertanyaan Terbuka

Hal-hal yang sebaiknya dikonfirmasi sebelum implementasi:

1. **Single- vs multi-tenant?** Skema ini siap multi; jika single, RLS bisa di-skip.
2. **Sumber waktu sholat**: pakai API eksternal (Kemenag, Aladhan) atau kalkulasi sendiri (`adhan-js`)?
3. **Payment gateway donasi**: integrasi Midtrans/Xendit atau cukup manual entry?
4. **TV display**: real-time via WebSocket/Server-Sent Events, atau polling tiap 30 detik?
5. **Multi-bahasa konten** (Arab/Indonesia/Inggris): perlu kolom `*_translations` terpisah atau cukup ikut field `arabic_title`/`arabic_name`?
6. **Recurring events**: cukup simpan `recurrence_rule` (RRULE iCal) dan generate instance on-the-fly, atau materialize ke baris `event_instances`?

---

*Dokumen ini hidup — perbarui setiap kali ada perubahan skema bersamaan dengan file migrasi terkait.*
