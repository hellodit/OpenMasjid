import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

type Probe = { name: string; ok: boolean; ms: number; detail?: string }

export async function runHealthCheck(): Promise<boolean> {
  const startedAt = Date.now()
  const stamp = new Date().toISOString()
  const probes: Probe[] = []

  await pingPostgres(probes)

  const ok = probes.every((p) => p.ok)
  const totalMs = Date.now() - startedAt
  const summary = probes
    .map((p) => `${p.name}=${p.ok ? 'ok' : 'FAIL'} (${p.ms}ms${p.detail ? ' — ' + p.detail : ''})`)
    .join('  ')
  console.log(`[health ${stamp}] ${ok ? 'OK ' : 'FAIL'} ${totalMs}ms  ${summary}`)
  return ok
}

async function pingPostgres(out: Probe[]): Promise<void> {
  const url = process.env.DATABASE_URL
  const t0 = Date.now()
  if (!url) {
    out.push({ name: 'postgres', ok: false, ms: 0, detail: 'DATABASE_URL not set' })
    return
  }
  let client: ReturnType<typeof postgres> | undefined
  try {
    client = postgres(url, { prepare: false, max: 1, idle_timeout: 5 })
    const rows = await client`select 1 as ok`
    out.push({ name: 'postgres', ok: rows[0]?.ok === 1, ms: Date.now() - t0 })
  } catch (err) {
    out.push({ name: 'postgres', ok: false, ms: Date.now() - t0, detail: (err as Error).message })
  } finally {
    await client?.end({ timeout: 5 })
  }
}

const isDirect = fileURLToPath(import.meta.url) === (process.argv[1] ?? '')
if (isDirect) {
  runHealthCheck()
    .then((ok) => process.exit(ok ? 0 : 1))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
