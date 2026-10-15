/* eslint-disable @typescript-eslint/no-explicit-any -- black-box test over untyped JSON responses */
/**
 * Tenant isolation test suite (run against a live dev/staging server).
 *
 *   bun run dev                 # in another terminal
 *   bun run test:isolation      # BASE_URL=http://localhost:3000
 *
 * Creates two throwaway mosques A and B through the public onboarding API,
 * fills them with data, then proves that A can never read, change or
 * reference B's data — via the HTTP API, swapped session cookies, and directly
 * against Postgres as the restricted app role (RLS). Cleans up afterwards.
 */
import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import postgres from 'postgres'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const APP_DB_URL = process.env.DATABASE_URL
const OWNER_DB_URL = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL
const suffix = randomBytes(3).toString('hex')

let passed = 0
const failures: string[] = []

function check(name: string, ok: boolean, detail = '') {
  if (ok) passed++
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
  console.log(`${ok ? '✓' : '✗'} ${name}${!ok && detail ? ` (${detail})` : ''}`)
}

class Client {
  cookies = new Map<string, string>()
  constructor(public slug: string) {}

  get api() {
    return `${BASE}/api/t/${this.slug}`
  }

  cookieHeader() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ')
  }

  store(res: Response) {
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';')
      const i = pair!.indexOf('=')
      this.cookies.set(pair!.slice(0, i), pair!.slice(i + 1))
    }
  }

  async req(method: string, url: string, body?: unknown) {
    const res = await fetch(url.startsWith('http') ? url : `${this.api}${url}`, {
      method,
      headers: {
        'content-type': 'application/json',
        'origin': BASE,
        ...(this.cookies.size ? { cookie: this.cookieHeader() } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'manual',
    })
    this.store(res)
    const text = await res.text()
    let json: any = null
    try {
      json = text ? JSON.parse(text) : null
    }
    catch {
      json = text
    }
    return { status: res.status, json }
  }
}

async function onboard(label: string) {
  const slug = `iso-${label}-${suffix}`
  const c = new Client(slug)
  const res = await c.req('POST', `${BASE}/api/onboarding`, {
    mosque: { name: `Masjid Uji ${label.toUpperCase()}`, slug, city: 'Testing', timezone: 'Asia/Jakarta' },
    owner: { name: `Owner ${label}`, email: `owner-${suffix}@isolation.test`, password: 'password123' },
  })
  if (res.status !== 201) throw new Error(`onboarding ${label} failed: ${res.status} ${JSON.stringify(res.json)}`)
  return c
}

async function fill(c: Client) {
  const categories = (await c.req('GET', '/admin/categories')).json
  const categoryId = categories[0].id
  const event = (await c.req('POST', '/admin/events', {
    title: `Kajian ${c.slug}`,
    categoryId,
    startDate: '2099-01-01',
    status: 'published',
    capacity: 10,
    speakers: [{ name: 'Ust. Uji' }],
  })).json
  const account = (await c.req('POST', '/admin/cashbook/accounts', { name: 'Kas Uji', type: 'cash', openingBalance: '1000' })).json
  const cashCategories = (await c.req('GET', '/admin/cashbook/categories?type=income')).json
  const transaction = (await c.req('POST', '/admin/cashbook/transactions', {
    type: 'income',
    transactionDate: '2099-01-01',
    accountId: account.id,
    categoryId: cashCategories[0].id,
    amount: '500',
    description: `Infaq ${c.slug}`,
  })).json
  const invite = (await c.req('POST', '/admin/team/invitations', { email: `staff-${suffix}@isolation.test`, role: 'viewer' })).json
  const team = (await c.req('GET', '/admin/team')).json
  return {
    categoryId,
    eventId: event.id as string,
    accountId: account.id as string,
    cashCategoryId: cashCategories[0].id as string,
    transactionId: transaction.id as string,
    invitationId: invite.invitation.id as string,
    inviteUrl: invite.url as string,
    ownerId: team.members[0].id as string,
  }
}

async function main() {
  console.log(`Isolation suite against ${BASE} (suffix ${suffix})\n`)
  const a = await onboard('a')
  const b = await onboard('b')
  check('onboarding creates two tenants with the SAME owner email (per-mosque accounts)', true)

  const A = await fill(a)
  const B = await fill(b)
  check('both tenants were filled', !!(A.eventId && B.eventId && A.transactionId && B.transactionId))

  // ── Sessions ────────────────────────────────────────────────────────────
  const aOnB = new Client(b.slug)
  aOnB.cookies = new Map(a.cookies)
  check('A cookies are not a session on B', (await aOnB.req('GET', '/admin/events')).status === 401)

  const swapped = new Client(b.slug)
  for (const [k, v] of a.cookies) swapped.cookies.set(k.replace(a.slug, b.slug), v)
  const swappedRes = await swapped.req('GET', '/admin/events')
  check('A session token renamed to B cookie is rejected', swappedRes.status === 401, `got ${swappedRes.status}`)

  const ctxOnB = (await aOnB.req('GET', '/context')).json
  check('B context sees no user for A cookies', ctxOnB?.user === null)

  // ── Reads by id ─────────────────────────────────────────────────────────
  const reads: Array<[string, string]> = [
    ['event', `/admin/events/${B.eventId}`],
    ['transaction', `/admin/cashbook/transactions/${B.transactionId}`],
    ['cash account', `/admin/cashbook/accounts/${B.accountId}`],
    ['cash category', `/admin/cashbook/categories/${B.cashCategoryId}`],
  ]
  for (const [name, url] of reads) {
    const r = await a.req('GET', url)
    check(`A cannot read B ${name} by id (404)`, r.status === 404, `got ${r.status}`)
  }

  // ── Writes by id ────────────────────────────────────────────────────────
  const writes: Array<[string, string, string, unknown]> = [
    ['update event', 'PUT', `/admin/events/${B.eventId}`, { title: 'hacked', categoryId: A.categoryId, startDate: '2099-01-01' }],
    ['delete event', 'DELETE', `/admin/events/${B.eventId}`, undefined],
    ['update transaction', 'PUT', `/admin/cashbook/transactions/${B.transactionId}`, { description: 'hacked' }],
    ['delete transaction', 'DELETE', `/admin/cashbook/transactions/${B.transactionId}`, undefined],
    ['update account', 'PUT', `/admin/cashbook/accounts/${B.accountId}`, { name: 'hacked' }],
    ['update event category', 'PUT', `/admin/categories/${B.categoryId}`, { name: 'hacked' }],
    ['revoke invitation', 'DELETE', `/admin/team/invitations/${B.invitationId}`, undefined],
    ['change team member', 'PUT', `/admin/team/${B.ownerId}`, { isActive: false }],
  ]
  for (const [name, method, url, body] of writes) {
    const r = await a.req(method, url, body)
    check(`A cannot ${name} of B (404/400)`, r.status === 404 || r.status === 400, `got ${r.status}`)
  }

  // ── References to B ids inside A ────────────────────────────────────────
  const refTx = await a.req('POST', '/admin/cashbook/transactions', {
    type: 'income', transactionDate: '2099-01-02', accountId: B.accountId, categoryId: A.cashCategoryId, amount: '1', description: 'x',
  })
  check('A cannot book a transaction on B account', refTx.status === 400, `got ${refTx.status}`)
  const refCat = await a.req('POST', '/admin/cashbook/transactions', {
    type: 'income', transactionDate: '2099-01-02', accountId: A.accountId, categoryId: B.cashCategoryId, amount: '1', description: 'x',
  })
  check('A cannot use B cash category', refCat.status === 400, `got ${refCat.status}`)
  const refEvent = await a.req('POST', '/admin/events', { title: 'Ref test', categoryId: B.categoryId, startDate: '2099-01-01' })
  check('A cannot create an event in B category', refEvent.status === 400, `got ${refEvent.status}`)

  // ── Lists never leak ────────────────────────────────────────────────────
  const listChecks: Array<[string, string, (j: any) => string[]]> = [
    ['events', '/admin/events?pageSize=100', (j) => j.data.map((e: any) => e.id)],
    ['transactions', '/admin/cashbook/transactions?pageSize=100', (j) => j.data.map((t: any) => t.id)],
    ['accounts', '/admin/cashbook/accounts?includeArchived=1', (j) => j.map((x: any) => x.id)],
    ['public events', '/public/events?limit=50', (j) => j.map((e: any) => e.id)],
    ['team', '/admin/team', (j) => j.members.map((m: any) => m.id)],
  ]
  const bIds = new Set(Object.values(B))
  for (const [name, url, ids] of listChecks) {
    const r = await a.req('GET', url)
    const leaked = r.status === 200 ? ids(r.json).filter((id) => bIds.has(id)) : ['<request failed>']
    check(`A ${name} list contains no B rows`, leaked.length === 0, leaked.join(','))
  }
  const dash = (await a.req('GET', '/admin/dashboard')).json
  check('A dashboard counts only A events', dash.stats.activeEvents === 1, `activeEvents=${dash.stats.activeEvents}`)

  // ── Invitation links are tenant-bound ───────────────────────────────────
  const token = new URL(B.inviteUrl).searchParams.get('token')
  const crossInvite = await a.req('GET', `/public/invitations/${token}`)
  check('B invitation token is invalid on A', crossInvite.status === 404, `got ${crossInvite.status}`)

  // ── Database (RLS as the app role) ──────────────────────────────────────
  if (APP_DB_URL) {
    const sql = postgres(APP_DB_URL, { max: 1, prepare: false })
    const tenantIds = await sql<{ id: string, slug: string }[]>`select id, slug from tenants where slug in (${a.slug}, ${b.slug})`
    const aId = tenantIds.find((t) => t.slug === a.slug)!.id
    const noCtx = await sql`select count(*)::int as n from events`
    check('RLS: no tenant context → 0 event rows', noCtx[0]!.n === 0, `n=${noCtx[0]!.n}`)
    const scoped = await sql.begin(async (tx) => {
      await tx`select set_config('app.tenant_id', ${aId}, true)`
      return tx`select id from events where id = ${B.eventId}`
    })
    check('RLS: tenant A context cannot see B event', scoped.length === 0)
    const insert = await sql.begin(async (tx) => {
      await tx`select set_config('app.tenant_id', ${aId}, true)`
      const bId = tenantIds.find((t) => t.slug === b.slug)!.id
      return tx`insert into categories (tenant_id, slug, name) values (${bId}, ${`x-${suffix}`}, 'x')`.then(() => 'inserted', (e: Error) => e.message)
    }).catch((e: Error) => e.message)
    check('RLS: cannot insert rows for another tenant', String(insert).includes('row-level security'), String(insert))
    // Composite FK: even inside tenant A, a row may not reference B's account.
    const fk = await sql.begin(async (tx) => {
      await tx`select set_config('app.tenant_id', ${aId}, true)`
      const [owner] = await tx`select created_by from transactions limit 1`
      return tx`insert into transactions (type, transaction_date, account_id, category_id, amount, description, created_by)
                values ('income', '2099-01-03', ${B.accountId}, ${A.cashCategoryId}, 1, 'fk', ${owner!.created_by})`
        .then(() => 'inserted', (e: Error) => e.message)
    }).catch((e: Error) => e.message)
    check('DB: composite FK rejects referencing another tenant\'s account', String(fk).includes('foreign key'), String(fk))
    const role = await sql`select rolsuper, rolbypassrls from pg_roles where rolname = current_user`
    check('app DB role is not superuser / BYPASSRLS', !role[0]!.rolsuper && !role[0]!.rolbypassrls)
    await sql.end()
  }
  else {
    console.log('• DATABASE_URL not set — skipping direct RLS checks')
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────
  if (OWNER_DB_URL) {
    const owner = postgres(OWNER_DB_URL, { max: 1, prepare: false })
    await owner`delete from tenants where slug in (${a.slug}, ${b.slug})`
    await owner.end()
  }

  console.log(`\n${passed} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log(failures.map((f) => `  ✗ ${f}`).join('\n'))
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
