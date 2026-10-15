// Money helpers for numeric(14,2) values carried as strings.
// Integer cents (bigint) avoid floating point drift.

/** Sum decimal strings without float drift (2 decimals). */
export function sumMoney(values: Array<string | number | null | undefined>): string {
  let cents = 0n
  for (const v of values) {
    if (v === null || v === undefined || v === '') continue
    cents += toCents(String(v))
  }
  return fromCents(cents)
}

export function subMoney(a: string, b: string): string {
  return fromCents(toCents(a) - toCents(b))
}

function toCents(v: string): bigint {
  const neg = v.startsWith('-')
  const [int = '0', frac = ''] = v.replace('-', '').split('.')
  const cents = BigInt(int) * 100n + BigInt((frac + '00').slice(0, 2))
  return neg ? -cents : cents
}

function fromCents(c: bigint): string {
  const neg = c < 0n
  const abs = neg ? -c : c
  const s = `${abs / 100n}.${String(abs % 100n).padStart(2, '0')}`
  return neg ? `-${s}` : s
}
