import { sql } from 'drizzle-orm'
import { date, index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { dutyRole, dutyService } from './_enums'
import { timestamps } from './_columns'
import { users } from './users'
import { tenantIdColumn, tenantIsolationPolicy } from './tenants'

/**
 * Duty roster (jadwal petugas): who leads which prayer/service on which date.
 * People on duty are often not app users, so they are stored by name.
 */
export const dutyAssignments = pgTable(
  'duty_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    date: date('date').notNull(),
    service: dutyService('service').notNull(),
    role: dutyRole('role').notNull(),
    personName: text('person_name').notNull(),
    /** Staff-only; never exposed on public endpoints. */
    phone: text('phone'),
    /** Khutbah / talk title. */
    topic: text('topic'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    tenantIsolationPolicy('duty_assignments', t.tenantId),
    // One person per (date, service, role); `other` may repeat.
    uniqueIndex('duty_assignments_slot_unique')
      .on(t.tenantId, t.date, t.service, t.role)
      .where(sql`${t.deletedAt} IS NULL AND ${t.role} <> 'other'`),
    index('duty_assignments_tenant_date_idx').on(t.tenantId, t.date),
  ],
)
