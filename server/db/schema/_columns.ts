import { sql } from 'drizzle-orm'
import { timestamp } from 'drizzle-orm/pg-core'

/** created_at / updated_at / deleted_at — shared by every soft-deletable table. */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}
