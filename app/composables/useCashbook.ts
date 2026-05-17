import type { Ref } from 'vue'

export type TxType = 'income' | 'expense' | 'transfer'
export type AccountType = 'cash' | 'bank' | 'ewallet'
export type CategoryType = 'income' | 'expense'

export interface CashAccount {
  id: string
  name: string
  type: AccountType
  accountNumber: string | null
  holderName: string | null
  openingBalance: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  balance: string
}

export interface TransactionCategory {
  id: string
  parentId: string | null
  slug: string
  name: string
  type: CategoryType
  icon: string | null
  colorToken: string | null
  description: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryNode extends TransactionCategory {
  children: CategoryNode[]
}

export interface TransactionListItem {
  id: string
  type: TxType
  transactionDate: string
  amount: string
  description: string
  referenceNumber: string | null
  attachmentUrl: string | null
  createdAt: string
  account: { id: string; name: string; type: AccountType } | null
  destinationAccount: { id: string; name: string; type: AccountType } | null
  category: {
    id: string
    name: string
    colorToken: string | null
    icon: string | null
  } | null
  createdBy: { id: string; fullName: string } | null
}

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

export interface CashbookSummary {
  range: { from: string; to: string }
  totals: {
    income: string
    expense: string
    transfer: string
    netCashFlow: string
    incomeCount: number
    expenseCount: number
    transferCount: number
  }
  accounts: CashAccount[]
  totalBalance: string
}

function useAuthFetch() {
  const { authHeaders } = useAuthSession()
  return <T>(url: string, opts: Parameters<typeof $fetch<T>>[1] = {}) =>
    $fetch<T>(url, { ...opts, headers: { ...authHeaders(), ...(opts.headers ?? {}) } })
}

export function useCashAccounts(opts: { includeArchived?: boolean } = {}) {
  const { authHeaders } = useAuthSession()
  return useFetch<CashAccount[]>('/api/admin/cashbook/accounts', {
    query: { includeArchived: opts.includeArchived ? '1' : '0' },
    headers: authHeaders(),
  })
}

export function useTransactionCategories(opts: {
  includeArchived?: boolean
  type?: CategoryType
} = {}) {
  const { authHeaders } = useAuthSession()
  return useFetch<TransactionCategory[]>('/api/admin/cashbook/categories', {
    query: {
      includeArchived: opts.includeArchived ? '1' : '0',
      ...(opts.type ? { type: opts.type } : {}),
    },
    headers: authHeaders(),
  })
}

export function categoriesAsTree(rows: TransactionCategory[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>()
  for (const row of rows) byId.set(row.id, { ...row, children: [] })
  const roots: CategoryNode[] = []
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

export function useTransactions(filters: Ref<TransactionFilters>) {
  const { authHeaders } = useAuthSession()
  return useFetch<{
    data: TransactionListItem[]
    pagination: { page: number; pageSize: number; total: number; totalPages: number }
  }>('/api/admin/cashbook/transactions', {
    query: filters,
    headers: authHeaders(),
    watch: [filters],
  })
}

export function useCashbookSummary(params: Ref<{ period?: string; date?: string; from?: string; to?: string }>) {
  const { authHeaders } = useAuthSession()
  return useFetch<CashbookSummary>('/api/admin/cashbook/reports/summary', {
    query: params,
    headers: authHeaders(),
    watch: [params],
  })
}

export function usePublicCashbookSummary(params: Ref<{ period?: 'month' | 'year'; date?: string }>) {
  return useFetch<{
    range: { from: string; to: string }
    totalBalance: string
    totalIncome: string
    totalExpense: string
    netCashFlow: string
    topCategories: Array<{ categoryName: string | null; colorToken: string | null; type: TxType; total: string }>
    accountCount: number
  }>('/api/public/cashbook/summary', {
    query: params,
    watch: [params],
  })
}

export function useCashbookApi() {
  const fetcher = useAuthFetch()
  return {
    createAccount: (body: Partial<CashAccount>) =>
      fetcher<CashAccount>('/api/admin/cashbook/accounts', { method: 'POST', body }),
    updateAccount: (id: string, body: Partial<CashAccount>) =>
      fetcher<CashAccount>(`/api/admin/cashbook/accounts/${id}`, { method: 'PUT', body }),
    deleteAccount: (id: string) =>
      fetcher(`/api/admin/cashbook/accounts/${id}`, { method: 'DELETE' }),

    createCategory: (body: Partial<TransactionCategory> & { type: CategoryType; name: string }) =>
      fetcher<TransactionCategory>('/api/admin/cashbook/categories', { method: 'POST', body }),
    updateCategory: (id: string, body: Partial<TransactionCategory>) =>
      fetcher<TransactionCategory>(`/api/admin/cashbook/categories/${id}`, { method: 'PUT', body }),
    deleteCategory: (id: string) =>
      fetcher(`/api/admin/cashbook/categories/${id}`, { method: 'DELETE' }),
    reorderCategories: (items: { id: string; sortOrder: number }[]) =>
      fetcher('/api/admin/cashbook/categories/reorder', { method: 'POST', body: { items } }),

    createTransaction: (body: Record<string, unknown>) =>
      fetcher<TransactionListItem>('/api/admin/cashbook/transactions', { method: 'POST', body }),
    updateTransaction: (id: string, body: Record<string, unknown>) =>
      fetcher(`/api/admin/cashbook/transactions/${id}`, { method: 'PUT', body }),
    deleteTransaction: (id: string) =>
      fetcher(`/api/admin/cashbook/transactions/${id}`, { method: 'DELETE' }),
  }
}
