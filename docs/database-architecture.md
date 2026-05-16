# Rancangan Arsitektur Database — OpenMasjid

> Dokumen ini menjelaskan rancangan skema database untuk aplikasi **OpenMasjid** (CMS Masjid + portal jamaah + TV display). Skema diturunkan dari halaman & komponen yang sudah ada pada Nuxt app (lihat [app/pages/admin](../app/pages/admin/) dan [app/composables/useAdminMock.ts](../app/composables/useAdminMock.ts)).
>
> Versi ini dirancang untuk **single-mosque**: satu deployment melayani satu masjid. Profil masjid disimpan sebagai baris singleton di tabel `mosque_profile`.

---

## 1. Ringkasan & Asumsi Teknis

| Item | Pilihan | Alasan |
|------|---------|--------|
| RDBMS | **PostgreSQL 15+** | Dukungan tipe `timestamptz`, `jsonb`, `enum`, `generated columns`, full-text search, `uuid_generate_v4()`. |
| Tipe Primary Key | `UUID v7` (atau `bigserial` untuk tabel volume tinggi seperti audit log) | UUID aman untuk dipakai pada URL publik (`/events/{id}`). |
| Timezone | Semua waktu tersimpan **UTC** (`timestamptz`); konversi ke `Asia/Jakarta` dilakukan di aplikasi. Field `time` murni (mis. waktu sholat) disimpan sebagai `time without time zone`. |
| Soft delete | Kolom `deleted_at timestamptz NULL` untuk entitas user-facing (event, registrant, kategori, media). Tabel referensi (kategori sistem, prayer settings) cukup pakai flag `is_active`. |
| Audit | Semua tabel memiliki `created_at`, `updated_at`, `created_by`, `updated_by`. |
| Naming | `snake_case`, tabel bentuk **jamak** (`events`, `registrants`), kolom FK `<entity>_id`. |
| Singleton | `mosque_profile`, `prayer_settings`, `display_settings` dipastikan satu-baris via constraint `CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)` atau kolom `singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton)`. |

---

## 2. Peta Domain

```
┌────────────────────────────────────────────────────────────────────┐
│                        IDENTITAS & AKSES                           │
│  users                                                             │
├────────────────────────────────────────────────────────────────────┤
│                       PROFIL MASJID                                │
│  mosque_profile ── mosque_contacts ── mosque_social_links          │
├────────────────────────────────────────────────────────────────────┤
│                       JADWAL SHOLAT                                │
│  prayer_settings ── prayer_adjustments ── prayer_overrides         │
├────────────────────────────────────────────────────────────────────┤
│                     KEGIATAN / EVENT                               │
│  categories ── events ── event_speakers                            │
│             └─ event_tags ─ tags                                   │
│             └─ registrants                                         │
├────────────────────────────────────────────────────────────────────┤
│                  PENGUMUMAN & TV DISPLAY                           │
│  announcements ── display_settings                                 │
├────────────────────────────────────────────────────────────────────┤
│                         MEDIA / ASET                               │
│  media_assets                                                      │
└────────────────────────────────────────────────────────────────────┘
```

ER-diagram tingkat tinggi (relasi inti):

```
categories 1───* events
events 1───* event_speakers
events 1───* registrants
events *───* tags (via event_tags)
events 1───* media_assets (banner)
```

---

## 3. Identitas & Akses

### `mosque_profile` (singleton, 1 row)
Profil masjid. Hanya satu baris — dipastikan via constraint.

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | fixed singleton UUID |
| `slug` | `text` UNIQUE | dipakai pada URL publik bila perlu |
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

**Constraint singleton**: `CHECK (id = '00000000-0000-0000-0000-000000000001')`.

### `mosque_contacts`
Multi-kontak (telepon DKM, email zakat, dsb).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `kind` | `enum('phone','email','website','whatsapp')` |
| `value` | `text` |
| `label` | `text` NULL ("Sekretariat", "Imam") |
| `is_primary` | `boolean` |

### `mosque_social_links`

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `platform` | `enum('instagram','youtube','facebook','tiktok','x','threads')` |
| `handle_or_url` | `text` |

### `users`
Semua akun di aplikasi — internal DKM (`owner`/`admin`/`editor`/`viewer`) **maupun** jamaah biasa (`jamaah`). Autentikasi (login, password reset, session) ditangani oleh **Supabase Auth** — token & session tidak disimpan di tabel aplikasi.

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | sama dengan `auth.users.id` di Supabase |
| `email` | `citext` UNIQUE | unik global |
| `full_name` | `text` NOT NULL | |
| `phone` | `text` NULL | |
| `role` | `enum('owner','admin','editor','viewer','jamaah')` NOT NULL DEFAULT `'jamaah'` | peran user — lihat [matriks di bawah](#role--hak-akses) |
| `avatar_asset_id` | `uuid` FK NULL | |
| `invited_by` | `uuid` FK → users NULL | siapa yang mengundang (NULL = self-register) |
| `last_login_at` | `timestamptz` NULL | |
| `is_active` | `boolean` DEFAULT true | nonaktifkan tanpa hapus |
| `created_at`, `updated_at`, `deleted_at` | | |

**Index**:
- `UNIQUE(email)` — lookup login langsung pakai email.
- `INDEX(role)` — cari semua admin / list jamaah.

> Mendukung halaman [auth/login.vue](../app/pages/auth/login.vue) & [auth/forgot-password.vue](../app/pages/auth/forgot-password.vue).

#### Role & Hak Akses

Lima peran, dari yang paling tinggi ke paling rendah:

| Role | Deskripsi | Hak Akses |
|------|-----------|-----------|
| `owner` | Pemilik / Ketua DKM. Hanya boleh ada **1 baris** dengan role ini. | Semua hak `admin` + kelola `users` (undang, ubah role, nonaktifkan, hapus). Mengubah `mosque_profile` dasar (nama, alamat, logo). |
| `admin` | Pengurus inti DKM. | CRUD: `events`, `categories`, `tags`, `registrants`, `announcements`, `prayer_settings`, `prayer_adjustments`, `prayer_overrides`, `display_settings`, `media_assets`, `mosque_contacts`, `mosque_social_links`. |
| `editor` | Operator harian (mis. sekretariat, marbot). | CRUD `events`, check-in `registrants`, `announcements`, upload `media_assets`. **Tidak boleh** ubah pengaturan masjid, jadwal sholat, atau display. |
| `viewer` | Anggota DKM yang hanya pantau statistik. | Read-only seluruh halaman admin. Tidak ada write. |
| `jamaah` | Jamaah biasa yang ingin daftar event masjid. | Login, lihat & daftar event publik, lihat riwayat kehadiran pribadi, ubah profil sendiri. Tidak punya akses CMS. |

**Constraint**:
- `CHECK` di aplikasi: minimal 1 user `is_active = true` dengan `role = 'owner'` setiap saat.
- Hanya `owner` yang boleh mengubah `users.role` user lain.
- User tidak boleh mengubah `role` dirinya sendiri.
- Default registrasi publik membuat user dengan `role = 'jamaah'`. Promosi ke role admin harus eksplisit oleh `owner`.

---

## 4. Kegiatan / Event

### `categories`
Taksonomi kegiatan masjid. Seed bawaan: `kajian`, `tahsin`, `tpa`, `zakat`, `muharram`, `umum` (sesuai `CategoryId` di `useAdminMock.ts`).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `slug` | `text` UNIQUE ("kajian") |
| `name` | `text` ("Kajian Rutin") |
| `icon` | `text` (nama icon Lucide) |
| `color_token` | `text` NULL (CSS token: `cms-green-700`) |
| `sort_order` | `int` |
| `is_active` | `boolean` |

### `events`

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | |
| `category_id` | `uuid` FK → categories | |
| `title` | `text` NOT NULL | |
| `arabic_title` | `text` NULL | "تفسير سورة الملك" |
| `slug` | `text` UNIQUE | dipakai di URL publik |
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
- `INDEX(start_date)` — list event tanggal X.
- `INDEX(status, start_date)` — daftar publik.
- `INDEX(category_id)`.
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

### `tags` & `event_tags`

```
tags(id, slug UNIQUE, label)
event_tags(event_id, tag_id, PRIMARY KEY(event_id, tag_id))
```

### `registrants`
Catatan kehadiran jamaah di sebuah event. Wajib login — data identitas (nama, email, phone) diambil dari [`users`](#users) melalui `user_id`. Satu baris = satu jamaah pada satu event.

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `id` | `uuid` PK | |
| `event_id` | `uuid` FK → events NOT NULL | |
| `user_id` | `uuid` FK → users NOT NULL | identitas jamaah |
| `registered_at` | `timestamptz` NOT NULL DEFAULT now() | waktu daftar |
| `attended_at` | `timestamptz` NULL | NULL = belum hadir; NOT NULL = sudah check-in |
| `checked_in_by` | `uuid` FK → users NULL | siapa yang melakukan check-in (`editor`/`admin`) |
| `source` | `enum('web','qr','admin')` DEFAULT `'web'` | jalur pendaftaran |
| `created_at`, `updated_at`, `deleted_at` | | |

**Index**:
- `UNIQUE(event_id, user_id) WHERE deleted_at IS NULL` — satu jamaah hanya bisa daftar event yang sama sekali.
- `INDEX(event_id) WHERE attended_at IS NOT NULL` — daftar yang sudah hadir per event.
- `INDEX(user_id, registered_at DESC)` — riwayat event yang diikuti jamaah.

> Mendukung halaman [admin/registrants.vue](../app/pages/admin/registrants.vue).

---

## 5. Jadwal Sholat

### `prayer_settings` (singleton, 1 row)

| Kolom | Tipe | Catatan |
|-------|------|---------|
| `singleton` | `boolean` PRIMARY KEY DEFAULT true | `CHECK (singleton)` |
| `auto_calculation` | `boolean` DEFAULT true | toggle "Otomatis" |
| `method` | `enum('kemenag','mwl','isna','egypt','makkah','karachi','custom')` | |
| `madzhab_asr` | `enum('syafii','hanafi')` DEFAULT `'syafii'` | |
| `fajr_angle` | `numeric(4,2)` DEFAULT 20.0 | derajat |
| `isha_angle` | `numeric(4,2)` DEFAULT 18.0 | |
| `timezone` | `text` | umumnya copy dari `mosque_profile.timezone` |
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
Penyesuaian per sholat (menit offset adzan & iqamat). 6 baris: subuh, terbit, dzuhur, ashar, maghrib, isya.

| Kolom | Tipe |
|-------|------|
| `prayer` | `enum('subuh','terbit','dzuhur','ashar','maghrib','isya')` PRIMARY KEY |
| `adzan_offset_min` | `smallint` DEFAULT 0 |
| `iqamah_offset_min` | `smallint` NULL |

### `prayer_overrides`
Override manual jadwal pada tanggal tertentu (lebaran, sholat khusus). Sub-bagian "Override Manual" di settings.

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `for_date` | `date` |
| `prayer` | `enum('subuh','terbit','dzuhur','ashar','maghrib','isya')` |
| `adzan_at` | `time` |
| `iqamah_at` | `time` NULL |
| `note` | `text` |

**Index**: `UNIQUE(for_date, prayer)`.

---

## 6. Pengumuman & TV Display

### `announcements`
Marquee di TV ([app/components/display/AnnouncementMarquee.vue](../app/components/display/AnnouncementMarquee.vue)).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
| `body` | `text` |
| `priority` | `smallint` DEFAULT 0 | semakin besar semakin atas |
| `active_from` | `timestamptz` |
| `active_until` | `timestamptz` NULL |
| `is_active` | `boolean` DEFAULT true |

**Index**: `INDEX(active_from, active_until)`.

### `display_settings` (singleton, 1 row)
Konfigurasi tampilan layar TV.

| Kolom | Tipe |
|-------|------|
| `singleton` | `boolean` PRIMARY KEY DEFAULT true | `CHECK (singleton)` |
| `theme` | `enum('khatam','classic','minimal')` DEFAULT `'khatam'` |
| `show_announcements` | `boolean` DEFAULT true |
| `show_next_prayer_card` | `boolean` DEFAULT true |
| `show_hijri_date` | `boolean` DEFAULT true |
| `idle_screen_seconds` | `int` DEFAULT 30 |
| `extra_config` | `jsonb` | sisa setting bebas |

---

## 7. Media & Aset

### `media_assets`
Sentralisasi file upload (logo, banner masjid, banner event, foto pembicara).

| Kolom | Tipe |
|-------|------|
| `id` | `uuid` PK |
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
| List event terbit, paginasi tanggal | `events` | `(status, start_date DESC)` |
| Detail event + jumlah pendaftar | `events`, `registrants` | `registrants(event_id)` — `COUNT(*)` untuk total daftar, `COUNT(*) FILTER (WHERE attended_at IS NOT NULL)` untuk yang hadir |
| Riwayat kehadiran jamaah | `registrants` | `(user_id, registered_at DESC)` join ke `events` |
| Dashboard "Kegiatan Hari Ini" | `events` | `(start_date)` partial `WHERE deleted_at IS NULL AND status='published'` |
| TV display data (sholat hari ini, marquee, event hari ini) | `prayer_settings`, `prayer_adjustments`, `prayer_overrides`, `announcements`, `events` | Mostly cached di Redis 1–5 menit, fall back ke DB. |

> **Materialized view** opsional `mv_event_capacity` (event_id, registered_count, attended_count) di-refresh tiap N detik untuk halaman list yang sering diakses.

---

## 9. Enum & Constraint Penting

```sql
-- contoh deklarasi enum tipe-aman
CREATE TYPE event_status     AS ENUM ('draft','published','ongoing','full','archived');
CREATE TYPE registrant_source AS ENUM ('web','qr','admin');
CREATE TYPE prayer_name      AS ENUM ('subuh','terbit','dzuhur','ashar','maghrib','isya');
CREATE TYPE user_role        AS ENUM ('owner','admin','editor','viewer','jamaah');
```

Constraint check yang wajib:
- `events`: `CHECK (end_date IS NULL OR end_date >= start_date)`, `CHECK (capacity IS NULL OR capacity > 0)`.
- `registrants`: `CHECK (attended_at IS NULL OR attended_at >= registered_at)`.
- `prayer_settings`: `CHECK (fajr_angle BETWEEN 12 AND 25)`, `CHECK (isha_angle BETWEEN 12 AND 25)`.
- `mosque_profile`, `prayer_settings`, `display_settings`: singleton check (lihat masing-masing tabel).

---

## 10. Keamanan & Privasi

- **PII** (`users.email`, `users.phone`, `users.full_name`) hanya boleh diakses oleh user itu sendiri atau user dengan `role IN ('owner','admin','editor')`. Endpoint publik (mis. daftar event) tidak boleh mengembalikan PII pendaftar.
- **Auth**: login/password reset/session ditangani Supabase Auth. Aplikasi cukup memetakan `auth.users.id` ke baris `users` internal.
- **Backup**: harian (full) + WAL streaming. Retensi 30 hari.
- **GDPR/UU PDP**: saat user "lupakan saya" — anonymize baris `users` (`full_name='Anonim'`, `email=NULL`, `phone=NULL`, `is_active=false`); baris `registrants` terkait tetap untuk arsip kehadiran tetapi sudah tidak punya PII via FK.

---

## 11. Strategi Migrasi & Seeding

1. **Migration tool**: rekomendasi [drizzle-kit](https://orm.drizzle.team/) atau [Prisma Migrate]; seeder Node script idiomatis dengan Nuxt server.
2. **Seed wajib** saat onboarding:
   - 1 baris `mosque_profile` + 1 `users` (`role = 'owner'`).
   - 6 baris `categories` default.
   - 1 baris `prayer_settings` + 6 baris `prayer_adjustments`.
   - 1 baris `display_settings`.
3. **Skema versioning**: 1 file migrasi per perubahan, nama `YYYYMMDDhhmm_<judul>.sql`.

---

## 12. Pertanyaan Terbuka

Hal-hal yang sebaiknya dikonfirmasi sebelum implementasi:

1. **Sumber waktu sholat**: pakai API eksternal (Kemenag, Aladhan) atau kalkulasi sendiri (`adhan-js`)?
2. **TV display**: real-time via WebSocket/Server-Sent Events, atau polling tiap 30 detik?
3. **Multi-bahasa konten** (Arab/Indonesia/Inggris): perlu kolom `*_translations` terpisah atau cukup ikut field `arabic_title`/`arabic_name`?
4. **Recurring events**: cukup simpan `recurrence_rule` (RRULE iCal) dan generate instance on-the-fly, atau materialize ke baris `event_instances`?

---

*Dokumen ini hidup — perbarui setiap kali ada perubahan skema bersamaan dengan file migrasi terkait.*
