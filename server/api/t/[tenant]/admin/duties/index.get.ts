import { dutyRangeQuery } from '#shared/schemas/duties'

export default defineTenantHandler('staff', async (event, { db, tenant }) => {
  const q = readZodQuery(event, dutyRangeQuery)
  const { from, to } = dutyRange(dateInTimeZone(tenant.timezone), q.from, q.to)
  const items = (await listDuties(db, from, to)).map(({ tenantId: _t, deletedAt: _d, ...d }) => d)
  return { from, to, items }
})
