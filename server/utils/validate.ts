import { createError, getQuery, readBody, type H3Event } from 'h3'
import type { z } from 'zod'

function toMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) =>
    issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
  )
}

/** Parse the JSON body with a zod schema; 400 with readable messages on failure. */
export async function readZodBody<S extends z.ZodType>(event: H3Event, schema: S): Promise<z.output<S>> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success) {
    const errors = toMessages(result.error)
    throw createError({ statusCode: 400, statusMessage: errors[0] ?? 'Validation failed', data: { errors } })
  }
  return result.data
}

export function readZodQuery<S extends z.ZodType>(event: H3Event, schema: S): z.output<S> {
  const result = schema.safeParse(getQuery(event))
  if (!result.success) {
    const errors = toMessages(result.error)
    throw createError({ statusCode: 400, statusMessage: errors[0] ?? 'Invalid query', data: { errors } })
  }
  return result.data
}

export function requireRouterId(event: H3Event, name = 'id'): string {
  const id = event.context.params?.[name]
  if (!id || !/^[0-9a-f-]{36}$/i.test(id))
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })
  return id
}

/** Escape `%`, `_` and `\` for use inside a LIKE/ILIKE pattern. */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`)
}
