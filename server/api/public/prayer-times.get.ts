import { z } from 'zod'
import { isoDate } from '#shared/schemas/common'

const querySchema = z.object({ date: isoDate.optional() })

/** Prayer times computed with `adhan` from the mosque coordinates & settings. */
export default defineEventHandler(async (event) => {
  const { date } = readZodQuery(event, querySchema)
  setResponseHeader(event, 'cache-control', 'public, max-age=300')
  return getPrayerSchedule(date)
})
