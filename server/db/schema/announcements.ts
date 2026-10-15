import { sql } from 'drizzle-orm'
import { boolean, check, date, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { announcementStatus } from './_enums'
import { timestamps } from './_columns'
import { users } from './users'
import { tenantIdColumn, tenantIsolationPolicy } from './tenants'

/**
 * Mosque announcements (portal + TV display). Visible to the public when
 * published and today (mosque-local) is within [starts_on, ends_on].
 */
export const announcements = pgTable(
  'announcements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    title: text('title').notNull(),
    body: text('body'),
    status: announcementStatus('status').notNull().default('draft'),
    isPinned: boolean('is_pinned').notNull().default(false),
    showOnDisplay: boolean('show_on_display').notNull().default(true),
    startsOn: date('starts_on'),
    endsOn: date('ends_on'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    tenantIsolationPolicy('announcements', t.tenantId),
    index('announcements_tenant_status_idx').on(t.tenantId, t.status, t.startsOn),
    check('announcements_ends_after_starts', sql`${t.endsOn} IS NULL OR ${t.startsOn} IS NULL OR ${t.endsOn} >= ${t.startsOn}`),
  ],
)
