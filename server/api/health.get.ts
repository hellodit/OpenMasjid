import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  let dbOk = false
  try {
    const rows = (await db.execute(sql`select 1 as ok`)) as unknown as Array<{ ok: number }>
    dbOk = rows[0]?.ok === 1
  }
  catch (err) {
    // Do not leak connection details publicly; log server-side instead.
    console.error('[health] database check failed:', err)
  }

  setResponseStatus(event, dbOk ? 200 : 503)
  return {
    ok: dbOk,
    ms: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
    checks: { database: { ok: dbOk } },
  }
})
