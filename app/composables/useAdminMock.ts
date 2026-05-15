export type CategoryId = 'kajian' | 'tahsin' | 'tpa' | 'zakat' | 'muharram' | 'umum'
export type EventStatus = 'published' | 'draft' | 'ongoing' | 'full'

export interface Category {
  id: CategoryId
  name: string
  icon: string
}

export interface AdminEvent {
  id: string
  title: string
  speaker: string
  role: string
  cat: CategoryId
  catName: string
  date: string
  day: string
  d: string
  m: string
  time: string
  location: string
  address: string
  capacity: number
  attended: number
  status: EventStatus
  desc: string
  arabic: string
  pinned?: boolean
}

export interface Attendee {
  name: string
  email: string
  when: string
}

export interface ScheduleItem {
  time: string
  what: string
  who: string
}

export interface Registrant {
  name: string
  email: string
  phone: string
  event: string
  cat: CategoryId
  date: string
  status: 'confirmed' | 'pending' | 'attended' | 'cancelled'
  when: string
}

export const useAdminMock = () => {
  const CATEGORIES: Category[] = [
    { id: 'kajian',   name: 'Kajian',       icon: 'lucide:book-open' },
    { id: 'tahsin',   name: 'Tahsin Quran', icon: 'lucide:book-marked' },
    { id: 'tpa',      name: 'TPA / TPQ',    icon: 'lucide:users' },
    { id: 'zakat',    name: 'Zakat & Sosial', icon: 'lucide:heart' },
    { id: 'muharram', name: 'Hari Besar',   icon: 'lucide:moon' },
    { id: 'umum',     name: 'Lainnya',      icon: 'lucide:tag' },
  ]

  const EVENTS: AdminEvent[] = [
    {
      id: 'ev-001', title: 'Kajian Tafsir Al-Mulk', speaker: 'Ust. Ahmad Mahfudz, Lc.', role: 'Imam Tetap Masjid Al-Hikmah',
      cat: 'kajian', catName: 'Kajian Rutin', date: '12 Mei 2026', day: 'Selasa', d: '12', m: 'Mei',
      time: "Ba'da Maghrib — 19:30", location: 'Ruang Utama Masjid', address: 'Lt. 1, Mihrab Selatan',
      capacity: 200, attended: 142, status: 'published',
      desc: 'Kajian rutin pekanan yang membahas tafsir Surah Al-Mulk dari kitab Tafsir Ibn Katsir. Terbuka untuk seluruh jamaah ikhwan dan akhwat. Disediakan ruang terpisah dan akses live streaming.',
      arabic: 'تفسير سورة الملك', pinned: true,
    },
    {
      id: 'ev-002', title: 'Tahsin Tilawah Pemula', speaker: 'Ustadzah Hafidzah Khairina', role: 'Hafidzah 30 Juz',
      cat: 'tahsin', catName: 'Program Tahsin', date: '13 Mei 2026', day: 'Rabu', d: '13', m: 'Mei',
      time: '16:00 — 17:30', location: 'Aula Akhwat', address: 'Lt. 2, Sayap Timur',
      capacity: 40, attended: 38, status: 'full',
      desc: 'Kelas perdana untuk peserta baru. Materi: makharijul huruf dan sifat-sifat huruf hijaiyyah. Membawa mushaf masing-masing.',
      arabic: 'تحسين التلاوة',
    },
    {
      id: 'ev-003', title: 'Buka Pendaftaran Santri TPA Angkatan 14', speaker: 'Panitia TPA Al-Hikmah', role: 'Koordinator Pendidikan',
      cat: 'tpa', catName: 'Pendidikan', date: '15 Mei 2026', day: 'Jumat', d: '15', m: 'Mei',
      time: '08:00 — 16:00', location: 'Sekretariat', address: 'Lt. Dasar, Lobby',
      capacity: 80, attended: 23, status: 'published',
      desc: 'Pendaftaran santri TPA angkatan ke-14 untuk usia 5-12 tahun. Kelas: Iqra, Quran Pemula, dan Quran Lanjutan.',
      arabic: 'فصل تحفيظ القرآن',
    },
    {
      id: 'ev-004', title: 'Penyaluran Zakat Maal Triwulan', speaker: 'Tim BAZNAS Kelurahan', role: 'Amil Zakat',
      cat: 'zakat', catName: 'Sosial', date: '17 Mei 2026', day: 'Ahad', d: '17', m: 'Mei',
      time: '09:00 — 12:00', location: 'Halaman Masjid', address: 'Halaman Depan',
      capacity: 150, attended: 87, status: 'published',
      desc: 'Pembagian zakat maal kepada 80 mustahik terdaftar. Mohon hadir tepat waktu dengan membawa kartu identitas dan undangan resmi.',
      arabic: 'توزيع الزكاة',
    },
    {
      id: 'ev-005', title: 'Tabligh Akbar Tahun Baru Hijriyah', speaker: 'Ust. Dr. Yusuf Hanafi, M.A.', role: 'Pengajar Pondok Pesantren',
      cat: 'muharram', catName: 'Hari Besar', date: '20 Jul 2026', day: 'Senin', d: '20', m: 'Jul',
      time: "Ba'da Isya — 20:00", location: 'Plaza Utama', address: 'Outdoor Stage',
      capacity: 1000, attended: 0, status: 'draft',
      desc: 'Menyambut tahun baru 1448 H dengan tausiyah, pawai obor anak-anak, dan ramah tamah jamaah lintas RW.',
      arabic: 'مرحبا 1448 هـ',
    },
    {
      id: 'ev-006', title: 'Kelas Bahasa Arab Dasar', speaker: 'Ust. Faris Abdullah, M.Pd.', role: 'Lulusan Madinah University',
      cat: 'kajian', catName: 'Pendidikan', date: '21 Mei 2026', day: 'Kamis', d: '21', m: 'Mei',
      time: '19:00 — 20:30', location: 'Ruang Kelas A', address: 'Lt. 2',
      capacity: 30, attended: 18, status: 'ongoing',
      desc: "Pekan ke-3 dari 12. Materi: pengenalan fi'il madhi dan dhamir muttasil. Modul disediakan.",
      arabic: 'اللغة العربية',
    },
  ]

  const ATTENDEES: Attendee[] = [
    { name: 'Bapak Hidayat', email: 'hidayat@warga.id', when: '2 jam lalu' },
    { name: 'Ibu Sumarni',   email: 'sumarni@warga.id', when: '5 jam lalu' },
    { name: 'Sdr. Rifki Nugroho', email: 'rifki.n@gmail.com', when: '1 hari' },
    { name: 'Bapak Sutopo',  email: 'sutopo.h@gmail.com', when: '1 hari' },
    { name: 'Ibu Aisyah',    email: 'aisyah@warga.id', when: '2 hari' },
  ]

  const SCHEDULE: ScheduleItem[] = [
    { time: '19:00 — 19:15', what: 'Pembukaan & Tilawah', who: 'MC: Sdr. Rizki' },
    { time: '19:15 — 19:30', what: 'Sambutan DKM', who: 'Bapak H. Sulaiman' },
    { time: '19:30 — 20:30', what: 'Tausiyah Utama', who: 'Ust. Ahmad Mahfudz, Lc.' },
    { time: '20:30 — 21:00', what: 'Sesi Tanya Jawab', who: 'Dipandu MC' },
    { time: '21:00',         what: 'Doa Penutup & Ramah Tamah', who: 'Bersama' },
  ]

  const REGISTRANTS: Registrant[] = [
    { name: 'Bapak Hidayat Wibowo', email: 'hidayat.w@gmail.com', phone: '+62 812-1111-2222', event: 'Kajian Tafsir Al-Mulk',     cat: 'kajian',   date: '12 Mei 2026', status: 'confirmed', when: '2 jam lalu' },
    { name: 'Ibu Sumarni Lestari',  email: 'sumarni@warga.id',    phone: '+62 813-2222-3333', event: 'Tahsin Tilawah Pemula',     cat: 'tahsin',   date: '13 Mei 2026', status: 'attended',  when: '5 jam lalu' },
    { name: 'Sdr. Rifki Nugroho',   email: 'rifki.n@gmail.com',   phone: '+62 821-3333-4444', event: 'Kajian Tafsir Al-Mulk',     cat: 'kajian',   date: '12 Mei 2026', status: 'confirmed', when: '1 hari lalu' },
    { name: 'Bapak Sutopo Hadi',    email: 'sutopo.h@gmail.com',  phone: '+62 822-4444-5555', event: 'Buka Pendaftaran TPA',      cat: 'tpa',      date: '15 Mei 2026', status: 'pending',   when: '1 hari lalu' },
    { name: 'Ibu Aisyah Rahmani',   email: 'aisyah@warga.id',     phone: '+62 823-5555-6666', event: 'Penyaluran Zakat Maal',     cat: 'zakat',    date: '17 Mei 2026', status: 'confirmed', when: '2 hari lalu' },
    { name: 'Sdr. Bagus Pratama',   email: 'bagus.p@gmail.com',   phone: '+62 856-6666-7777', event: 'Kelas Bahasa Arab Dasar',   cat: 'kajian',   date: '21 Mei 2026', status: 'confirmed', when: '2 hari lalu' },
    { name: 'Ibu Khairunnisa',      email: 'nisa.k@gmail.com',    phone: '+62 857-7777-8888', event: 'Tahsin Tilawah Pemula',     cat: 'tahsin',   date: '13 Mei 2026', status: 'attended',  when: '3 hari lalu' },
    { name: 'Bapak Iskandar Maulana', email: 'iskandar.m@gmail.com', phone: '+62 858-8888-9999', event: 'Tabligh Akbar Hijriyah', cat: 'muharram', date: '20 Jul 2026', status: 'pending',   when: '3 hari lalu' },
    { name: 'Sdr. Faris Akbar',     email: 'faris.a@gmail.com',   phone: '+62 859-9999-0000', event: 'Kajian Tafsir Al-Mulk',     cat: 'kajian',   date: '12 Mei 2026', status: 'cancelled', when: '4 hari lalu' },
    { name: 'Ibu Halimah Yusuf',    email: 'halimah.y@warga.id',  phone: '+62 851-0000-1111', event: 'Penyaluran Zakat Maal',     cat: 'zakat',    date: '17 Mei 2026', status: 'confirmed', when: '5 hari lalu' },
  ]

  return { CATEGORIES, EVENTS, ATTENDEES, SCHEDULE, REGISTRANTS }
}

export const statusLabel: Record<EventStatus, string> = {
  published: 'Tayang',
  draft: 'Draf',
  ongoing: 'Berjalan',
  full: 'Penuh',
}

export const regStatusLabel: Record<Registrant['status'], string> = {
  confirmed: 'Terkonfirmasi',
  pending: 'Menunggu',
  attended: 'Hadir',
  cancelled: 'Dibatalkan',
}

export const bannerClass = (cat: CategoryId) => `cms-banner-${cat}`

export const initials = (name: string, max = 2) =>
  name.split(' ')
    .filter(w => !['Bapak', 'Ibu', 'Sdr.', 'Sdri.'].includes(w))
    .map(w => w[0])
    .slice(0, max)
    .join('')
