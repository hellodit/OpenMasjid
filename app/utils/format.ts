const RUPIAH = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Rp 0'
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return 'Rp 0'
  return RUPIAH.format(n).replace(/^Rp\s?/, 'Rp ')
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const datePart = iso.split('T')[0] ?? iso
  const parts = datePart.split('-').map(Number)
  const [y, m, d] = parts
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function firstOfMonthIso(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

export function accountTypeLabel(t: string): string {
  if (t === 'cash') return 'Tunai'
  if (t === 'bank') return 'Bank'
  if (t === 'ewallet') return 'E-Wallet'
  return t
}

export function accountTypeIcon(t: string): string {
  if (t === 'cash') return 'lucide:wallet'
  if (t === 'bank') return 'lucide:landmark'
  if (t === 'ewallet') return 'lucide:smartphone'
  return 'lucide:circle'
}

export function transactionTypeLabel(t: string): string {
  if (t === 'income') return 'Pemasukan'
  if (t === 'expense') return 'Pengeluaran'
  if (t === 'transfer') return 'Transfer'
  return t
}

/** Initials for avatars, skipping honorifics ("Bapak Hidayat" → "H"). */
export function initials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .filter(w => w && !['Bapak', 'Ibu', 'Sdr.', 'Sdri.', 'Ust.', 'Ustadzah', 'H.', 'Hj.'].includes(w))
    .map(w => w[0]!.toUpperCase())
    .slice(0, max)
    .join('')
}

/** `"19:30:00"` → `"19:30"`. */
export function formatTime(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : ''
}

/** `"19:30:00", "21:00:00"` → `"19:30 — 21:00"`. */
export function formatTimeRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start) return ''
  return end ? `${formatTime(start)} — ${formatTime(end)}` : formatTime(start)
}

/** Banner gradient class for an event category slug (see admin.css). */
export function bannerClass(categorySlug: string | null | undefined): string {
  const known = ['kajian', 'tahsin', 'tpa', 'zakat', 'muharram', 'umum']
  return `cms-banner-${categorySlug && known.includes(categorySlug) ? categorySlug : 'umum'}`
}

/** "2 jam lalu", "3 hari lalu". */
export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
  const diff = (new Date(value).getTime() - Date.now()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return 'baru saja'
}

/** Day parts for date tiles: { d: '12', m: 'Mei', day: 'Selasa' }. */
export function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d))
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('id-ID', { ...o, timeZone: 'UTC' }).format(date)
  return { d: String(d), m: fmt({ month: 'short' }), day: fmt({ weekday: 'long' }) }
}
