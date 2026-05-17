import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  let dbOk = false
  let dbError: string | undefined

  try {
    const rows = (await db.execute(sql`select 1 as ok`)) as Array<{ ok: number }>
    dbOk = rows[0]?.ok === 1
  } catch (err) {
    dbError = (err as Error).message
  }

  const ok = dbOk
  setResponseStatus(event, ok ? 200 : 503)
  return {
    ok,
    ms: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
    checks: {
      database: { ok: dbOk, ...(dbError ? { error: dbError } : {}) },
    },
  }
})
