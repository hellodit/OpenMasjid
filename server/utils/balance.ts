import { and, eq, isNull, sql, type SQL } from 'drizzle-orm'
import type { DbOrTx } from './db'
import { cashAccounts, transactions } from '../db/schema'

// Drizzle renders columns UNQUALIFIED in single-table selects (`"id"`), which
// inside the correlated subquery would silently resolve to `t.id`. Always
// reference the outer row with an explicit table-qualified identifier.
const outerId = sql.raw('"cash_accounts"."id"')

/**
 * Current balance of a cash account:
 * opening + income + transfers in − expenses − transfers out.
 */
const balanceExpr: SQL<string> = sql<string>`(
  "cash_accounts"."opening_balance"
  + COALESCE((
      SELECT SUM(CASE
        WHEN t.type = 'income' AND t.account_id = ${outerId} THEN t.amount
        WHEN t.type = 'transfer' AND t.destination_account_id = ${outerId} THEN t.amount
        WHEN t.type IN ('expense', 'transfer') AND t.account_id = ${outerId} THEN -t.amount
        ELSE 0 END)
      FROM ${transactions} t
      WHERE t.deleted_at IS NULL
        AND (t.account_id = ${outerId} OR t.destination_account_id = ${outerId})
    ), 0)
)::text`

const accountColumns = {
  id: cashAccounts.id,
  name: cashAccounts.name,
  type: cashAccounts.type,
  accountNumber: cashAccounts.accountNumber,
  holderName: cashAccounts.holderName,
  openingBalance: cashAccounts.openingBalance,
  sortOrder: cashAccounts.sortOrder,
  isActive: cashAccounts.isActive,
  createdAt: cashAccounts.createdAt,
  updatedAt: cashAccounts.updatedAt,
  balance: balanceExpr,
}

export async function listAccountsWithBalance(db: DbOrTx, opts?: { includeArchived?: boolean }) {
  return db
    .select(accountColumns)
    .from(cashAccounts)
    .where(
      and(
        isNull(cashAccounts.deletedAt),
        opts?.includeArchived ? undefined : eq(cashAccounts.isActive, true),
      ),
    )
    .orderBy(cashAccounts.sortOrder, cashAccounts.name)
}

export async function getAccountWithBalance(db: DbOrTx, id: string) {
  const rows = await db
    .select(accountColumns)
    .from(cashAccounts)
    .where(and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)))
    .limit(1)
  return rows[0] ?? null
}

/**
 * Sum of balances across ALL non-deleted accounts, archived included —
 * archiving an account must never make money disappear from the totals.
 */
export async function getTotalBalance(db: DbOrTx): Promise<string> {
  const accounts = await listAccountsWithBalance(db, { includeArchived: true })
  return sumMoney(accounts.map((a) => a.balance))
}

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
