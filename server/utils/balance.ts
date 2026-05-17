import { sql, type SQL } from 'drizzle-orm'
import { db } from './db'
import { cashAccounts, transactions } from '../db/schema'

const balanceExpr: SQL<string> = sql<string>`(
  ${cashAccounts.openingBalance}::numeric
  + COALESCE((
      SELECT SUM(t.amount)::numeric FROM ${transactions} t
      WHERE t.account_id = ${cashAccounts.id}
        AND t.type = 'income' AND t.deleted_at IS NULL
    ), 0)
  + COALESCE((
      SELECT SUM(t.amount)::numeric FROM ${transactions} t
      WHERE t.destination_account_id = ${cashAccounts.id}
        AND t.type = 'transfer' AND t.deleted_at IS NULL
    ), 0)
  - COALESCE((
      SELECT SUM(t.amount)::numeric FROM ${transactions} t
      WHERE t.account_id = ${cashAccounts.id}
        AND t.type = 'expense' AND t.deleted_at IS NULL
    ), 0)
  - COALESCE((
      SELECT SUM(t.amount)::numeric FROM ${transactions} t
      WHERE t.account_id = ${cashAccounts.id}
        AND t.type = 'transfer' AND t.deleted_at IS NULL
    ), 0)
)`

export async function listAccountsWithBalance(opts?: {
  includeArchived?: boolean
}) {
  const rows = await db
    .select({
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
    })
    .from(cashAccounts)
    .where(
      opts?.includeArchived
        ? sql`${cashAccounts.deletedAt} IS NULL`
        : sql`${cashAccounts.deletedAt} IS NULL AND ${cashAccounts.isActive} = TRUE`,
    )
    .orderBy(cashAccounts.sortOrder, cashAccounts.name)
  return rows
}

export async function getAccountWithBalance(id: string) {
  const rows = await db
    .select({
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
    })
    .from(cashAccounts)
    .where(sql`${cashAccounts.id} = ${id} AND ${cashAccounts.deletedAt} IS NULL`)
    .limit(1)
  return rows[0] ?? null
}
