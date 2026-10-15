# OpenMasjid

> Platform digital terpadu untuk DKM (Dewan Kemakmuran Masjid) — satu aplikasi untuk mengelola profil masjid, jadwal sholat, kegiatan kajian, pendaftaran jamaah, hingga tampilan layar TV di ruang utama.

> ## 🎯 Dibuat dengan Metode **Vibe Coding**
>
> ### ✨ Aplikasi ini dibangun menggunakan metode **VIBE CODING** ✨
>
> Pendekatan pengembangan modern yang memanfaatkan **AI sebagai partner coding** untuk membangun aplikasi production-grade dengan lebih cepat dan efisien.
>
> ### 👉 Pelajari selengkapnya di: **[mahirvibecoding.com](https://mahirvibecoding.com/)** 🚀
>
> ---

> ⚠️ **Status: Dalam Pengembangan (Not Production Ready)**
>
> Project ini masih dalam tahap pengembangan aktif dan **belum siap digunakan di lingkungan produksi**. Fitur, schema database, dan API masih dapat berubah sewaktu-waktu tanpa pemberitahuan.
>
> Untuk info lebih lengkap, kolaborasi, atau pertanyaan, hubungi **[@codingtengahmalam](https://instagram.com/codingtengahmalam)** di Instagram atau [Threads](https://threads.net/@codingtengahmalam).

OpenMasjid menggabungkan tiga permukaan utama dalam satu codebase:

1. **Portal Jamaah** — halaman publik berisi profil masjid, jadwal sholat, dan daftar kegiatan yang dapat diikuti.
2. **CMS Admin (DKM)** — dashboard pengelolaan kegiatan, pendaftar, kategori, dan pengaturan masjid.
3. **TV Display** — tampilan layar besar untuk ruang sholat yang menampilkan jam, jadwal sholat, hitung mundur waktu sholat berikutnya, dan running text pengumuman.

Dibangun dengan **Nuxt 4 + Nuxt UI v4**, **PostgreSQL** via **Drizzle ORM**, validasi **Zod**, dan autentikasi **Better Auth**. Panduan teknis lengkap untuk kontributor & AI agent ada di [AGENTS.md](AGENTS.md).

---

## Fitur Utama

### Portal Jamaah (Public)
- Profil masjid: nama, alamat, jam operasional, kapasitas, jadwal Jumat.
- Jadwal sholat harian dihitung dengan [`adhan`](https://github.com/batoulapps/adhan-js) dari koordinat & metode masjid (default Kemenag RI), dengan **next prayer countdown**.
- Tanggal Hijriyah otomatis (kalender Umm al-Qura via `Intl`) berdampingan dengan tanggal Masehi.
- Daftar kegiatan publik dengan filter kategori (Kajian, Tahsin, TPA, Zakat, Muharram, Umum).
- Status pendaftaran real-time: *Pendaftaran dibuka · Sedang berjalan · Kuota penuh · Akan datang*.

### CMS Admin
- **Dashboard** — statistik kegiatan aktif, jamaah terdaftar, tingkat kehadiran, plus chart pendaftaran 7 hari terakhir.
- **Manajemen Kegiatan** — list/grid view, filter kategori, search, halaman detail, form buat/edit dengan upload banner, tag, dan pemateri.
- **Pendaftar (Registrants)** — daftar kehadiran jamaah per kegiatan (terhubung ke akun `users`), dengan status hadir/belum dan tombol check-in untuk operator.
- **Kategori** — kelola taksonomi kegiatan masjid.
- **Pengaturan Masjid** — profil masjid, logo, koordinat & arah kiblat, metode perhitungan waktu sholat, koreksi menit per waktu sholat, preview tampilan TV.
- **Manajemen Pengguna** — 3 peran: `admin` (pengurus DKM), `viewer` (read-only DKM), `jamaah` (jamaah terdaftar).
- **Auth** — login, lupa & reset password (Better Auth, sesi cookie). `/admin` hanya untuk role `admin` & `viewer`.
- **Buku Kas** — akun kas, kategori, transaksi (pemasukan/pengeluaran/transfer), laporan & ekspor CSV, halaman transparansi publik.

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
| UI | Nuxt UI v4 (Tailwind CSS v4) + Lucide icons |
| Validasi | Zod v4 + drizzle-zod (skema dipakai bersama server & form) |
| ORM & Migrasi | Drizzle ORM + drizzle-kit (dengan relations) |
| Database | PostgreSQL 15+ (mis. Supabase) |
| Auth | Better Auth (email & password, sesi cookie, role) |
| Waktu Sholat | `adhan` |
| QR Code | `qrcode` |
| Package Manager | Bun |

---

## Screenshot

> Galeri singkat dari tiga permukaan OpenMasjid. Klik gambar untuk versi penuh — file aslinya tersimpan di [docs/screenshot/](docs/screenshot/).

<table>
  <tr>
    <td width="50%" align="center">
      <a href="docs/screenshot/tv-display.png">
        <img src="docs/screenshot/tv-display.png" alt="TV Display" />
      </a>
      <br />
      <sub><b>📺 TV Display</b><br />Layar besar — jam, jadwal sholat, & pengumuman</sub>
    </td>
    <td width="50%" align="center">
      <a href="docs/screenshot/admin-dashboard.png">
        <img src="docs/screenshot/admin-dashboard.png" alt="Dashboard Admin" />
      </a>
      <br />
      <sub><b>📊 Dashboard Admin</b><br />Ringkasan kegiatan, jamaah, kas, & kehadiran</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <a href="docs/screenshot/admin-events.png">
        <img src="docs/screenshot/admin-events.png" alt="Daftar Kegiatan" />
      </a>
      <br />
      <sub><b>📅 Daftar Kegiatan</b><br />List kegiatan dengan filter, pencarian, & statistik</sub>
    </td>
    <td width="50%" align="center">
      <a href="docs/screenshot/admin-categories.png">
        <img src="docs/screenshot/admin-categories.png" alt="Kategori Kegiatan" />
      </a>
      <br />
      <sub><b>🏷️ Kategori Kegiatan</b><br />Kajian, Tahsin, TPA, Zakat, Hari Besar Islam</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <a href="docs/screenshot/admin-registrants.png">
        <img src="docs/screenshot/admin-registrants.png" alt="Pendaftar" />
      </a>
      <br />
      <sub><b>👥 Pendaftar</b><br />Daftar jamaah & status kehadiran per kegiatan</sub>
    </td>
    <td width="50%" align="center">
      <a href="docs/screenshot/portal-jamaah.png">
        <img src="docs/screenshot/portal-jamaah.png" alt="Portal Jamaah" />
      </a>
      <br />
      <sub><b>🕌 Portal Jamaah</b><br />Halaman publik profil & kegiatan masjid</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <a href="docs/screenshot/admin-cashbook.png">
        <img src="docs/screenshot/admin-cashbook.png" alt="Buku Kas" />
      </a>
      <br />
      <sub><b>💰 Buku Kas</b><br />Saldo, pemasukan, pengeluaran & transaksi terbaru</sub>
    </td>
    <td width="50%" align="center">
      <a href="docs/screenshot/admin-settings.png">
        <img src="docs/screenshot/admin-settings.png" alt="Pengaturan Masjid" />
      </a>
      <br />
      <sub><b>⚙️ Pengaturan</b><br />Profil masjid & perhitungan jadwal sholat</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <a href="docs/screenshot/transparency.png">
        <img src="docs/screenshot/transparency.png" alt="Transparansi Keuangan" />
      </a>
      <br />
      <sub><b>🔍 Transparansi</b><br />Ringkasan keuangan publik untuk jamaah</sub>
    </td>
    <td width="50%"></td>
  </tr>
</table>

---

## Struktur Halaman

| Rute | Mode | Deskripsi |
|------|------|-----------|
| `/` | Public | Portal jamaah — profil & kegiatan |
| `/display` | Public TV | Tampilan layar besar |
| `/auth/login` | Auth | Login pengurus |
| `/auth/forgot-password` | Auth | Minta tautan reset password |
| `/auth/reset-password` | Auth | Buat password baru |
| `/transparency` | Public | Ringkasan keuangan untuk jamaah |
| `/admin` | Admin | Dashboard utama |
| `/admin/events` | Admin | Daftar kegiatan |
| `/admin/events/new` | Admin | Tambah kegiatan |
| `/admin/events/[id]` | Admin | Detail kegiatan |
| `/admin/registrants` | Admin | Daftar pendaftar |
| `/admin/categories` | Admin | Kategori kegiatan |
| `/admin/settings` | Admin | Pengaturan masjid & jadwal sholat |
| `/admin/cashbook/**` | Admin | Buku kas: ringkasan, transaksi, akun, kategori, laporan |

---

## Menjalankan Project

1. Install dependencies:
   ```bash
   bun install
   ```
2. Salin `.env.example` menjadi `.env` lalu isi `DATABASE_URL`, `DATABASE_DIRECT_URL`,
   `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL`, dan `SEED_ADMIN_*`.
3. Siapkan database:
   ```bash
   bun run db:migrate   # terapkan migrasi
   bun run db:seed      # data awal + akun admin pertama
   # opsional, data contoh:
   bun run db:seed:events
   bun run db:seed:cashbook
   ```
4. Jalankan dev server:
   ```bash
   bun run dev
   ```
   Aplikasi tersedia di `http://localhost:3000`; masuk ke CMS di `/auth/login` dengan akun `SEED_ADMIN_*`.

Pemeriksaan kualitas & build production:

```bash
bun run lint
bun run typecheck
bun run build && bun run preview
```

> **Upgrade dari versi Supabase Auth**: akun lama di tabel `users` tidak punya password di Better Auth.
> Jalankan `bun run db:migrate`, lalu buat ulang admin lewat `bun run db:seed` atau minta user memakai
> "Lupa password". Trigger `auth.users → public.users` lama boleh dihapus dari database Supabase.

---

## Lisensi

Project internal — TBD.
