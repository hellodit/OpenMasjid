import { createError, defineEventHandler } from 'h3'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import slugify from 'slugify'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodBody } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import { transactionCategories } from '~~/server/db/schema'

const bodySchema = z.object({
  parentId: z.string().uuid().nullish(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).optional(),
  type: z.enum(['income', 'expense']),
  icon: z.string().trim().max(80).nullish(),
  colorToken: z.string().trim().max(40).nullish(),
  description: z.string().trim().max(500).nullish(),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readZodBody(event, bodySchema)

  if (data.parentId) {
    const parent = await db.query.transactionCategories.findFirst({
      where: and(
        eq(transactionCategories.id, data.parentId),
        isNull(transactionCategories.deletedAt),
      ),
    })
    if (!parent) throw createError({ statusCode: 400, statusMessage: 'Parent kategori tidak ditemukan' })
    if (parent.parentId)
      throw createError({ statusCode: 400, statusMessage: 'Maksimal 2 level hierarki (parent sudah punya parent)' })
    if (parent.type !== data.type)
      throw createError({ statusCode: 400, statusMessage: 'Tipe kategori harus sama dengan parent' })
  }

  const slug = data.slug ?? slugify(data.name, { lower: true, strict: true })

  const existing = await db.query.transactionCategories.findFirst({
    where: and(
      eq(transactionCategories.slug, slug),
      isNull(transactionCategories.deletedAt),
    ),
    columns: { id: true },
  })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Slug kategori sudah digunakan' })

  const [row] = await db
    .insert(transactionCategories)
    .values({
      parentId: data.parentId ?? null,
      name: data.name,
      slug,
      type: data.type,
      icon: data.icon ?? null,
      colorToken: data.colorToken ?? null,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
    })
    .returning()
  return row
})
