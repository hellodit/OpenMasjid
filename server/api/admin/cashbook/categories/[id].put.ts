import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull, ne, sql } from 'drizzle-orm'
import { z } from 'zod'
import slugify from 'slugify'
import { requireAdmin } from '~~/server/utils/auth'
import { readZodBody } from '~~/server/utils/validate'
import { db } from '~~/server/utils/db'
import { transactionCategories } from '~~/server/db/schema'

const bodySchema = z.object({
  parentId: z.string().uuid().nullish(),
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  icon: z.string().trim().max(80).nullish(),
  colorToken: z.string().trim().max(40).nullish(),
  description: z.string().trim().max(500).nullish(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const data = await readZodBody(event, bodySchema)

  const current = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)),
  })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })

  if (data.parentId !== undefined) {
    if (data.parentId === id)
      throw createError({ statusCode: 400, statusMessage: 'Kategori tidak boleh jadi parent dirinya sendiri' })
    if (data.parentId) {
      const parent = await db.query.transactionCategories.findFirst({
        where: and(eq(transactionCategories.id, data.parentId), isNull(transactionCategories.deletedAt)),
      })
      if (!parent) throw createError({ statusCode: 400, statusMessage: 'Parent kategori tidak ditemukan' })
      if (parent.parentId)
        throw createError({ statusCode: 400, statusMessage: 'Maksimal 2 level hierarki' })
      if (parent.type !== current.type)
        throw createError({ statusCode: 400, statusMessage: 'Tipe parent harus sama' })

      const hasChildren = await db.query.transactionCategories.findFirst({
        where: and(eq(transactionCategories.parentId, id), isNull(transactionCategories.deletedAt)),
        columns: { id: true },
      })
      if (hasChildren)
        throw createError({
          statusCode: 400,
          statusMessage: 'Kategori ini sudah punya sub-kategori, tidak bisa dipindah ke bawah parent lain',
        })
    }
  }

  if (data.slug !== undefined || data.name !== undefined) {
    const newSlug = data.slug ?? (data.name ? slugify(data.name, { lower: true, strict: true }) : current.slug)
    if (newSlug !== current.slug) {
      const existing = await db.query.transactionCategories.findFirst({
        where: and(
          eq(transactionCategories.slug, newSlug),
          isNull(transactionCategories.deletedAt),
          ne(transactionCategories.id, id),
        ),
        columns: { id: true },
      })
      if (existing) throw createError({ statusCode: 409, statusMessage: 'Slug kategori sudah digunakan' })
    }
    data.slug = newSlug
  }

  const [row] = await db
    .update(transactionCategories)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(transactionCategories.id, id))
    .returning()
  return row
})
