/* global React */
const { useState, useMemo } = React;

/* ============================================================
   Icons — minimal stroke set (lucide-style, but original)
   ============================================================ */
const Icon = ({ d, size = 18, fill = "none", sw = 1.7, children, vb = "0 0 24 24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={vb}
       fill={fill} stroke="currentColor" strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  Mosque: (p) => <Icon {...p}><path d="M3 21h18"/><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M12 4V2"/><path d="M11 4h2"/><path d="M9 21v-5a3 3 0 1 1 6 0v5"/></Icon>,
  Star8: (p) => <Icon {...p} sw={1.4}><path d="M12 2 L14.5 7 L20 7 L20 12.5 L22 14 L20 15.5 L20 21 L14.5 21 L12 22 L9.5 21 L4 21 L4 15.5 L2 14 L4 12.5 L4 7 L9.5 7 Z"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  Users: (p) => <Icon {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="8" r="2.5"/><path d="M22 18c0-2.5-2-4-5-4"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  MapPin: (p) => <Icon {...p}><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.8a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.3a7 7 0 0 0-2.2 1.3l-2.3-.8-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .5 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.8a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.3a7 7 0 0 0 2.2-1.3l2.3.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.3z"/></Icon>,
  ChevronRight: (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ArrowLeft: (p) => <Icon {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></Icon>,
  Edit: (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></Icon>,
  Trash: (p) => <Icon {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>,
  Eye: (p) => <Icon {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Grid: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  List: (p) => <Icon {...p}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></Icon>,
  BookOpen: (p) => <Icon {...p}><path d="M2 5a2 2 0 0 1 2-2h6v17H4a2 2 0 0 1-2-2z"/><path d="M22 5a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 0 2-2z"/></Icon>,
  Quran: (p) => <Icon {...p}><path d="M4 4h13a3 3 0 0 1 3 3v13"/><path d="M4 4v16h13a3 3 0 0 0 3-3"/><path d="M8 8h8"/><path d="M8 12h6"/></Icon>,
  Heart: (p) => <Icon {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></Icon>,
  Moon: (p) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Icon>,
  Tag: (p) => <Icon {...p}><path d="M20 12 12 20l-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.2"/></Icon>,
  Image: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></Icon>,
  Upload: (p) => <Icon {...p}><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></Icon>,
  Check: (p) => <Icon {...p}><path d="m5 12 5 5 9-11"/></Icon>,
  X: (p) => <Icon {...p}><path d="M6 6l12 12"/><path d="M18 6 6 18"/></Icon>,
  Speaker: (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  Money: (p) => <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4"/><path d="M18 10v4"/></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></Icon>,
  TrendUp: (p) => <Icon {...p}><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></Icon>,
  Filter: (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>,
  Download: (p) => <Icon {...p}><path d="M12 4v12"/><path d="m6 10 6 6 6-6"/><path d="M4 20h16"/></Icon>,
  Share: (p) => <Icon {...p}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4"/><path d="m8 13 8 4"/></Icon>,
  Pin: (p) => <Icon {...p}><path d="M12 2v6"/><path d="M9 8h6l-1 6h-4z"/><path d="M12 14v8"/></Icon>,
  Phone: (p) => <Icon {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.6a2 2 0 0 1-.5 2L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5l2.6.5a2 2 0 0 1 1.7 2z"/></Icon>,
  Mail: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>,
};

/* ============================================================
   Mock data
   ============================================================ */

const CATEGORIES = [
  { id: "kajian",   name: "Kajian",       Icon: Icons.BookOpen, color: "kajian" },
  { id: "tahsin",   name: "Tahsin Quran", Icon: Icons.Quran,    color: "tahsin" },
  { id: "tpa",      name: "TPA / TPQ",    Icon: Icons.Users,    color: "tpa" },
  { id: "zakat",    name: "Zakat & Sosial", Icon: Icons.Heart,  color: "zakat" },
  { id: "muharram", name: "Hari Besar",   Icon: Icons.Moon,     color: "muharram" },
  { id: "umum",     name: "Lainnya",      Icon: Icons.Tag,      color: "umum" },
];

const EVENTS = [
  {
    id: "ev-001",
    title: "Kajian Tafsir Al-Mulk",
    speaker: "Ust. Ahmad Mahfudz, Lc.",
    role: "Imam Tetap Masjid Al-Hikmah",
    cat: "kajian",
    catName: "Kajian Rutin",
    date: "12 Mei 2026",
    day: "Selasa",
    d: "12", m: "Mei",
    time: "Ba'da Maghrib — 19:30",
    location: "Ruang Utama Masjid",
    address: "Lt. 1, Mihrab Selatan",
    capacity: 200, attended: 142,
    status: "published",
    desc: "Kajian rutin pekanan yang membahas tafsir Surah Al-Mulk dari kitab Tafsir Ibn Katsir. Terbuka untuk seluruh jamaah ikhwan dan akhwat. Disediakan ruang terpisah dan akses live streaming.",
    arabic: "تفسير سورة الملك",
    pinned: true,
  },
  {
    id: "ev-002",
    title: "Tahsin Tilawah Pemula",
    speaker: "Ustadzah Hafidzah Khairina",
    role: "Hafidzah 30 Juz",
    cat: "tahsin",
    catName: "Program Tahsin",
    date: "13 Mei 2026",
    day: "Rabu",
    d: "13", m: "Mei",
    time: "16:00 — 17:30",
    location: "Aula Akhwat",
    address: "Lt. 2, Sayap Timur",
    capacity: 40, attended: 38,
    status: "full",
    desc: "Kelas perdana untuk peserta baru. Materi: makharijul huruf dan sifat-sifat huruf hijaiyyah. Membawa mushaf masing-masing.",
    arabic: "تحسين التلاوة",
  },
  {
    id: "ev-003",
    title: "Buka Pendaftaran Santri TPA Angkatan 14",
    speaker: "Panitia TPA Al-Hikmah",
    role: "Koordinator Pendidikan",
    cat: "tpa",
    catName: "Pendidikan",
    date: "15 Mei 2026",
    day: "Jumat",
    d: "15", m: "Mei",
    time: "08:00 — 16:00",
    location: "Sekretariat",
    address: "Lt. Dasar, Lobby",
    capacity: 80, attended: 23,
    status: "published",
    desc: "Pendaftaran santri TPA angkatan ke-14 untuk usia 5-12 tahun. Kelas: Iqra, Quran Pemula, dan Quran Lanjutan.",
    arabic: "فصل تحفيظ القرآن",
  },
  {
    id: "ev-004",
    title: "Penyaluran Zakat Maal Triwulan",
    speaker: "Tim BAZNAS Kelurahan",
    role: "Amil Zakat",
    cat: "zakat",
    catName: "Sosial",
    date: "17 Mei 2026",
    day: "Ahad",
    d: "17", m: "Mei",
    time: "09:00 — 12:00",
    location: "Halaman Masjid",
    address: "Halaman Depan",
    capacity: 150, attended: 87,
    status: "published",
    desc: "Pembagian zakat maal kepada 80 mustahik terdaftar. Mohon hadir tepat waktu dengan membawa kartu identitas dan undangan resmi.",
    arabic: "توزيع الزكاة",
  },
  {
    id: "ev-005",
    title: "Tabligh Akbar Tahun Baru Hijriyah",
    speaker: "Ust. Dr. Yusuf Hanafi, M.A.",
    role: "Pengajar Pondok Pesantren",
    cat: "muharram",
    catName: "Hari Besar",
    date: "20 Jul 2026",
    day: "Senin",
    d: "20", m: "Jul",
    time: "Ba'da Isya — 20:00",
    location: "Plaza Utama",
    address: "Outdoor Stage",
    capacity: 1000, attended: 0,
    status: "draft",
    desc: "Menyambut tahun baru 1448 H dengan tausiyah, pawai obor anak-anak, dan ramah tamah jamaah lintas RW.",
    arabic: "مرحبا 1448 هـ",
  },
  {
    id: "ev-006",
    title: "Kelas Bahasa Arab Dasar",
    speaker: "Ust. Faris Abdullah, M.Pd.",
    role: "Lulusan Madinah University",
    cat: "kajian",
    catName: "Pendidikan",
    date: "21 Mei 2026",
    day: "Kamis",
    d: "21", m: "Mei",
    time: "19:00 — 20:30",
    location: "Ruang Kelas A",
    address: "Lt. 2",
    capacity: 30, attended: 18,
    status: "ongoing",
    desc: "Pekan ke-3 dari 12. Materi: pengenalan fi'il madhi dan dhamir muttasil. Modul disediakan.",
    arabic: "اللغة العربية",
  },
];

const ATTENDEES = [
  { name: "Bapak Hidayat", email: "hidayat@warga.id", when: "2 jam lalu" },
  { name: "Ibu Sumarni", email: "sumarni@warga.id", when: "5 jam lalu" },
  { name: "Sdr. Rifki Nugroho", email: "rifki.n@gmail.com", when: "1 hari" },
  { name: "Bapak Sutopo", email: "sutopo.h@gmail.com", when: "1 hari" },
  { name: "Ibu Aisyah", email: "aisyah@warga.id", when: "2 hari" },
];

const SCHEDULE = [
  { time: "19:00 — 19:15", what: "Pembukaan & Tilawah", who: "MC: Sdr. Rizki" },
  { time: "19:15 — 19:30", what: "Sambutan DKM", who: "Bapak H. Sulaiman" },
  { time: "19:30 — 20:30", what: "Tausiyah Utama", who: "Ust. Ahmad Mahfudz, Lc." },
  { time: "20:30 — 21:00", what: "Sesi Tanya Jawab", who: "Dipandu MC" },
  { time: "21:00", what: "Doa Penutup & Ramah Tamah", who: "Bersama" },
];

/* Export to global */
Object.assign(window, { Icons, CATEGORIES, EVENTS, ATTENDEES, SCHEDULE });
