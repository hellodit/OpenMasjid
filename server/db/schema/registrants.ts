import { sql } from 'drizzle-orm'
import {
  check,
  foreignKey,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { events } from './events'
import { users } from './users'
import { registrantSource } from './_enums'
import { timestamps } from './_columns'

import { tenantIdColumn, tenantIsolationPolicy } from './tenants'
export const registrants = pgTable(
  'registrants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    eventId: uuid('event_id').notNull(),
    userId: uuid('user_id').notNull(),
    registeredAt: timestamp('registered_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    attendedAt: timestamp('attended_at', { withTimezone: true }),
    checkedInBy: uuid('checked_in_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    source: registrantSource('source').notNull().default('web'),
    ...timestamps,
  },
  (t) => [
    tenantIsolationPolicy('registrants', t.tenantId),
    foreignKey({
      name: 'registrants_event_fk',
      columns: [t.tenantId, t.eventId],
      foreignColumns: [events.tenantId, events.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'registrants_user_fk',
      columns: [t.tenantId, t.userId],
      foreignColumns: [users.tenantId, users.id],
    }).onDelete('restrict'),
    uniqueIndex('registrants_event_user_active_unique')
      .on(t.eventId, t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
    index('registrants_event_attended_idx')
      .on(t.eventId)
      .where(sql`${t.attendedAt} IS NOT NULL`),
    index('registrants_user_history_idx').on(t.userId, t.registeredAt),
    check(
      'registrants_attended_after_registered',
      sql`${t.attendedAt} IS NULL OR ${t.attendedAt} >= ${t.registeredAt}`,
    ),
  ],
)
