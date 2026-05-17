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
