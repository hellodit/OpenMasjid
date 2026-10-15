import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema'
import { transactionListQuery } from '#shared/schemas/cashbook'

const accountCols = { id: true, name: true, type: true } as const

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const params = readZodQuery(event, transactionListQuery)

  const where = and(
    isNull(transactions.deletedAt),
    params.from ? gte(transactions.transactionDate, params.from) : undefined,
    params.to ? lte(transactions.transactionDate, params.to) : undefined,
    params.type ? eq(transactions.type, params.type) : undefined,
    params.accountId
      ? or(eq(transactions.accountId, params.accountId), eq(transactions.destinationAccountId, params.accountId))
      : undefined,
    params.categoryId ? eq(transactions.categoryId, params.categoryId) : undefined,
    params.q ? ilike(transactions.description, `%${escapeLike(params.q)}%`) : undefined,
  )

  const [rows, [count]] = await Promise.all([
    db.query.transactions.findMany({
      where,
      columns: {
        id: true,
        type: true,
        transactionDate: true,
        amount: true,
        description: true,
        referenceNumber: true,
        attachmentUrl: true,
        createdAt: true,
      },
      with: {
        account: { columns: accountCols },
        destinationAccount: { columns: accountCols },
        category: { columns: { id: true, name: true, colorToken: true, icon: true } },
        creator: { columns: { id: true, fullName: true } },
      },
      orderBy: [desc(transactions.transactionDate), desc(transactions.createdAt)],
      limit: params.pageSize,
      offset: (params.page - 1) * params.pageSize,
    }),
    db.select({ count: sql<number>`COUNT(*)::int` }).from(transactions).where(where),
  ])

  const total = count?.count ?? 0
  return {
    data: rows.map(({ creator, ...r }) => ({ ...r, createdBy: creator })),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
    },
  }
})
