import { createError, getQuery, readBody, type H3Event } from 'h3'
import type { ZodTypeAny, z } from 'zod'

function toError(issue: z.ZodIssue): string {
  return issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message
}

export async function readZodBody<S extends ZodTypeAny>(
  event: H3Event,
  schema: S,
): Promise<z.infer<S>> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: { errors: result.error.issues.map(toError) },
    })
  }
  return result.data
}

export function readZodQuery<S extends ZodTypeAny>(
  event: H3Event,
  schema: S,
): z.infer<S> {
  const query = getQuery(event)
  const result = schema.safeParse(query)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query parameters',
      data: { errors: result.error.issues.map(toError) },
    })
  }
  return result.data
}
