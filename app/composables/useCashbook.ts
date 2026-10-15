import type { Ref } from 'vue'
import type { InternalApi } from 'nitropack/types'
import type { z } from 'zod'
import type {
  accountCreateSchema,
  accountUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  transactionCreateSchema,
  transactionUpdateSchema,
} from '#shared/schemas/cashbook'

export type TxType = 'income' | 'expense' | 'transfer'
export type AccountType = 'cash' | 'bank' | 'ewallet'
export type CategoryType = 'income' | 'expense'

// Response types are inferred from the server handlers (serialized JSON shape).
export type CashAccount = InternalApi['/api/admin/cashbook/accounts']['get'][number]
export type TransactionCategory = InternalApi['/api/admin/cashbook/categories']['get'][number]
export type TransactionListItem = InternalApi['/api/admin/cashbook/transactions']['get']['data'][number]
export type TransactionDetail = InternalApi['/api/admin/cashbook/transactions/:id']['get']

export type CategoryNode = TransactionCategory & { children: CategoryNode[] }

export interface TransactionFilters {
  from?: string
  to?: string
  type?: TxType
  accountId?: string
  categoryId?: string
  q?: string
  page?: number
  pageSize?: number
}

export function useCashAccounts(opts: { includeArchived?: boolean } = {}) {
  return useFetch('/api/admin/cashbook/accounts', {
    query: { includeArchived: opts.includeArchived ? '1' : '0' },
  })
}

export function useTransactionCategories(opts: {
  includeArchived?: boolean
  type?: CategoryType
} = {}) {
  return useFetch('/api/admin/cashbook/categories', {
    query: {
      includeArchived: opts.includeArchived ? '1' : '0',
      ...(opts.type ? { type: opts.type } : {}),
    },
  })
}

/** Groups flat category rows into parent → children (max 2 levels). */
export function categoriesAsTree<T extends { id: string; parentId: string | null }>(
  rows: T[],
): Array<T & { children: Array<T & { children: never[] }> }> {
  type Node = T & { children: Node[] }
  const byId = new Map<string, Node>()
  for (const row of rows) byId.set(row.id, { ...row, children: [] })
  const roots: Node[] = []
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots as Array<T & { children: Array<T & { children: never[] }> }>
}

export function useTransactions(filters: Ref<TransactionFilters>) {
  return useFetch('/api/admin/cashbook/transactions', {
    query: filters,
    watch: [filters],
  })
}

export function useCashbookSummary(params: Ref<{ period?: 'day' | 'week' | 'month' | 'year'; date?: string; from?: string; to?: string }>) {
  return useFetch('/api/admin/cashbook/reports/summary', {
    query: params,
    watch: [params],
  })
}

export function usePublicCashbookSummary(params: Ref<{ period?: 'month' | 'year'; date?: string }>) {
  return useFetch('/api/public/cashbook/summary', {
    query: params,
    watch: [params],
  })
}

/** Extracts the server's `statusMessage` (or zod issue list) from a $fetch error. */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const err = e as { data?: { statusMessage?: string; message?: string; data?: { errors?: string[] } } }
  return err?.data?.data?.errors?.join(', ') ?? err?.data?.statusMessage ?? err?.data?.message ?? fallback
}

export function useCashbookApi() {
  // Session cookie is sent automatically (same origin).
  return {
    createAccount: (body: z.input<typeof accountCreateSchema>) =>
      $fetch('/api/admin/cashbook/accounts', { method: 'POST', body }),
    updateAccount: (id: string, body: z.input<typeof accountUpdateSchema>) =>
      $fetch(`/api/admin/cashbook/accounts/${id}`, { method: 'PUT', body }),
    deleteAccount: (id: string) =>
      $fetch(`/api/admin/cashbook/accounts/${id}`, { method: 'DELETE' }),

    createCategory: (body: z.input<typeof categoryCreateSchema>) =>
      $fetch('/api/admin/cashbook/categories', { method: 'POST', body }),
    updateCategory: (id: string, body: z.input<typeof categoryUpdateSchema>) =>
      $fetch(`/api/admin/cashbook/categories/${id}`, { method: 'PUT', body }),
    deleteCategory: (id: string) =>
      $fetch(`/api/admin/cashbook/categories/${id}`, { method: 'DELETE' }),

    createTransaction: (body: z.input<typeof transactionCreateSchema>) =>
      $fetch('/api/admin/cashbook/transactions', { method: 'POST', body }),
    updateTransaction: (id: string, body: z.input<typeof transactionUpdateSchema>) =>
      $fetch(`/api/admin/cashbook/transactions/${id}`, { method: 'PUT', body }),
    deleteTransaction: (id: string) =>
      $fetch(`/api/admin/cashbook/transactions/${id}`, { method: 'DELETE' }),
  }
}
