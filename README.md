# OpenMasjid

> Platform digital terpadu untuk DKM (Dewan Kemakmuran Masjid) — satu aplikasi untuk mengelola profil masjid, jadwal sholat, kegiatan kajian, pendaftaran jamaah, hingga tampilan layar TV di ruang utama.

OpenMasjid menggabungkan tiga permukaan utama dalam satu codebase:

1. **Portal Jamaah** — halaman publik berisi profil masjid, jadwal sholat, dan daftar kegiatan yang dapat diikuti.
2. **CMS Admin (DKM)** — dashboard pengelolaan kegiatan, pendaftar, kategori, dan pengaturan masjid.
3. **TV Display** — tampilan layar besar untuk ruang sholat yang menampilkan jam, jadwal sholat, hitung mundur waktu sholat berikutnya, dan running text pengumuman.

Dibangun dengan **Nuxt 4 + Vue 3 + TailwindCSS**, didukung **PostgreSQL** (via Drizzle ORM) dan **Supabase** untuk auth & storage.

---

## Fitur Utama

### Portal Jamaah (Public)
- Profil masjid: nama, alamat, jam operasional, kapasitas, jadwal Jumat.
- Jadwal sholat harian berbasis library [`adhan`](https://github.com/batoulapps/adhan-js) dengan tampilan **next prayer countdown**.
- Tanggal Hijriyah otomatis (via `hijri-js`) berdampingan dengan tanggal Masehi.
- Daftar kegiatan publik dengan filter kategori (Kajian, Tahsin, TPA, Zakat, Muharram, Umum).
- Status pendaftaran real-time: *Pendaftaran dibuka · Sedang berjalan · Kuota penuh · Akan datang*.

### CMS Admin
- **Dashboard** — statistik kegiatan aktif, jamaah terdaftar, tingkat kehadiran, plus chart pendaftaran 7 hari terakhir.
- **Manajemen Kegiatan** — list/grid view, filter kategori, search, halaman detail, form buat/edit dengan upload banner, tag, dan pemateri.
- **Pendaftar (Registrants)** — daftar kehadiran jamaah per kegiatan (terhubung ke akun `users`), dengan status hadir/belum dan tombol check-in untuk operator.
- **Kategori** — kelola taksonomi kegiatan masjid.
- **Pengaturan Masjid** — profil masjid, logo, koordinat & arah kiblat, metode perhitungan waktu sholat, koreksi menit per waktu sholat, preview tampilan TV.
- **Manajemen Pengguna** — 4 peran: `owner` (pemilik DKM), `admin` (pengurus inti), `editor` (operator harian), `viewer` (read-only).
- **Auth** — halaman login & lupa password (Supabase Auth).

### TV Display (Mode Layar Besar)
- Jam besar real-time dengan detik & format 24 jam, tanggal Masehi + Hijriyah.
- Kartu **Next Prayer** dengan hitung mundur menuju adzan berikutnya.
- Tabel jadwal 5 waktu sholat (Subuh · Dzuhur · Ashar · Maghrib · Isya).
- **Marquee pengumuman** scrolling di bagian bawah layar.
- Info tambahan: suhu, kelembapan, arah kiblat.
- Layout responsif untuk rasio layar TV (16:9 / 16:10).

### Fondasi Teknis
- **Soft delete** pada entitas user-facing, **audit trail** lengkap (`created_at` / `updated_at` / `created_by` / `updated_by`).
- Schema database terdokumentasi di [docs/database-architecture.md](docs/database-architecture.md).

---

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Nuxt 4, Vue 3, TypeScript |
| Styling | TailwindCSS 6 |
| Ikon | `@nuxt/icon` + Lucide |
| Form & Validasi | VeeValidate + Zod |
| Waktu Sholat | `adhan`, `hijri-js`, `dayjs` |
| Database | PostgreSQL + Drizzle ORM |
| Auth & Storage | Supabase |
| QR Code | `qrcode` (untuk e-tiket kegiatan) |
| Package Manager | Bun |

---

## Screenshot

> Screenshot tersimpan di folder [docs/screenshots/](docs/screenshots/). Klik gambar untuk versi penuh.

### Portal Jamaah
Halaman publik profil & kegiatan masjid.

![Portal Jamaah](docs/screenshots/portal-jamaah.png)

### Dashboard Admin
Ringkasan kegiatan, jamaah, dan tingkat kehadiran.

![Dashboard Admin](docs/screenshots/admin-dashboard.png)

### Daftar Kegiatan (Admin)
List/grid kegiatan dengan filter kategori dan pencarian.

![Daftar Kegiatan](docs/screenshots/admin-events.png)

### Detail Kegiatan (Admin)
Detail kegiatan beserta daftar pendaftar.

![Detail Kegiatan](docs/screenshots/admin-event-detail.png)

### Form Buat / Edit Kegiatan
Form lengkap dengan upload banner, kategori, tag, pemateri, dan jadwal.

![Form Kegiatan](docs/screenshots/admin-event-form.png)

### Pendaftar (Registrants)
Tabel jamaah yang terdaftar di tiap kegiatan.

![Registrants](docs/screenshots/admin-registrants.png)

### Pengaturan Masjid
Profil masjid, logo, metode perhitungan sholat, dan preview TV.

![Settings](docs/screenshots/admin-settings.png)

### TV Display
Tampilan layar besar untuk ruang utama masjid.

![TV Display](docs/screenshots/tv-display.png)

### Auth — Login
Halaman login pengurus DKM.

![Login](docs/screenshots/auth-login.png)

---

## Struktur Halaman

| Rute | Mode | Deskripsi |
|------|------|-----------|
| `/` | Public | Portal jamaah — profil & kegiatan |
| `/display` | Public TV | Tampilan layar besar |
| `/auth/login` | Auth | Login pengurus |
| `/auth/forgot-password` | Auth | Reset password |
| `/admin` | Admin | Dashboard utama |
| `/admin/events` | Admin | Daftar kegiatan |
| `/admin/events/new` | Admin | Tambah kegiatan |
| `/admin/events/[id]` | Admin | Detail kegiatan |
| `/admin/registrants` | Admin | Daftar pendaftar |
| `/admin/categories` | Admin | Kategori kegiatan |
| `/admin/settings` | Admin | Pengaturan masjid |

---

## Menjalankan Project

Install dependencies dan jalankan dev server:

```bash
bun install
bun run dev
```

Aplikasi tersedia di `http://localhost:3000`.

Build untuk production:

```bash
bun run build
bun run preview
```

---

## Lisensi

Project internal — TBD.
