import { dutyRangeQuery } from '#shared/schemas/duties'

/** Public duty roster (portal + TV). Phone numbers and notes stay staff-only. */
export default defineTenantHandler('public', async (event, { db, tenant }) => {
  const q = readZodQuery(event, dutyRangeQuery)
  const today = dateInTimeZone(tenant.timezone)
  const { from, to } = dutyRange(today, q.from, q.to)
  const items = (await listDuties(db, from, to)).map((d) => ({
    id: d.id,
    date: d.date,
    service: d.service,
    role: d.role,
    personName: d.personName,
    topic: d.topic,
  }))
  return { today, from, to, items }
})
