import { z } from 'zod'
import { tenantSlug } from '#shared/schemas/tenants'
import { eq } from 'drizzle-orm'
import { tenants } from '~~/server/db/schema'

const querySchema = z.object({ slug: z.string().trim().toLowerCase().max(64) })

export default defineEventHandler(async (event) => {
  rateLimit(event, 'slug-check', 60, 60_000)
  const { slug } = readZodQuery(event, querySchema)
  const parsed = tenantSlug.safeParse(slug)
  if (!parsed.success) return { available: false, reason: parsed.error.issues[0]?.message }
  const hit = await db.query.tenants.findFirst({ where: eq(tenants.slug, parsed.data), columns: { id: true } })
  return { available: !hit, reason: hit ? 'Alamat sudah dipakai masjid lain' : undefined }
})
