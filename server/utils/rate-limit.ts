import { appendResponseHeader, createError, getRequestIP, type H3Event } from 'h3'

const hits = new Map<string, { count: number, resetAt: number }>()

/**
 * Small in-memory fixed-window limiter (per server instance) for endpoints
 * outside Better Auth's own rate limiting (onboarding, invitations).
 */
export function rateLimit(event: H3Event, bucket: string, limit: number, windowMs: number) {
  const key = `${bucket}:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.resetAt <= now) {
    if (hits.size > 10_000) hits.clear()
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return
  }
  entry.count++
  if (entry.count > limit)
    throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Coba lagi nanti.' })
}

/** Copy Set-Cookie headers from a Better Auth `asResponse` call onto the H3 response. */
export function forwardSetCookies(event: H3Event, res: Response) {
  for (const cookie of res.headers.getSetCookie()) appendResponseHeader(event, 'set-cookie', cookie)
}
