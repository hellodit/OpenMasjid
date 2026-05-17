import { defineEventHandler } from 'h3'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodBody } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import { transactionCategories } from '~~/server/db/schema'

const bodySchema = z.object({
  items: z
    .array(z.object({ id: z.string().uuid(), sortOrder: z.number().int().min(0).max(9999) }))
    .min(1),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { items } = await readZodBody(event, bodySchema)

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(transactionCategories)
        .set({ sortOrder: item.sortOrder, updatedAt: sql`now()` })
        .where(eq(transactionCategories.id, item.id))
    }
  })

  return { updated: items.length }
})
