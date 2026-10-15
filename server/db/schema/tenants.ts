import { sql, type AnyColumn } from 'drizzle-orm'
import {
  type AnyPgColumn,
  check,
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { tenantStatus, userRole } from './_enums'
import { users } from './users'

/**
 * A tenant = one mosque. Global table (no RLS); resolved from the URL path
 * `/<slug>/…` and `/api/t/<slug>/…` by server/middleware/00.tenant.ts.
 */
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    /** Denormalized from mosque_profile.city for the public directory/search (tenants has no RLS). */
    city: text('city'),
    status: tenantStatus('status').notNull().default('active'),
    /** The owner is an `admin` user of this tenant with extra rights (team, danger zone). */
    ownerUserId: uuid('owner_user_id').references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('tenants_slug_unique').on(t.slug),
    index('tenants_name_lower_idx').on(sql`lower(${t.name})`),
    check('tenants_slug_format', sql`${t.slug} ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$'`),
  ],
)


/**
 * `tenant_id` column for tenant-scoped tables.
 *
 * The DEFAULT reads the transaction-local `app.tenant_id` set by `withTenant()`,
 * so inserts inside a tenant transaction are labelled automatically; the RLS
 * WITH CHECK policy rejects anything else. Declared as a function (hoisted)
 * because schema modules import each other.
 */
export function tenantIdColumn() {
  return uuid('tenant_id')
    .notNull()
    .default(sql`(current_setting('app.tenant_id', true))::uuid`)
    .references((): AnyPgColumn => tenants.id, { onDelete: 'cascade' })
}

/** Staff invitations (link-based; no mailer yet). */
export const tenantInvitations = pgTable(
  'tenant_invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    email: text('email').notNull(),
    role: userRole('role').notNull(),
    /** sha256 of the invite token; the raw token is only shown once. */
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    invitedBy: uuid('invited_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [
    tenantIsolationPolicy('tenant_invitations', t.tenantId),
    uniqueIndex('tenant_invitations_token_unique').on(t.tokenHash),
    index('tenant_invitations_tenant_idx').on(t.tenantId),
    check('tenant_invitations_role_staff', sql`${t.role} IN ('admin', 'viewer')`),
  ],
)

/**
 * Row Level Security policy for tenant-scoped tables. `app.tenant_id` is set
 * transaction-locally by `withTenant()`; when it is missing the comparison is
 * NULL → no rows (fail closed).
 */
export function tenantIsolationPolicy(table: string, tenantId: AnyColumn) {
  const predicate = sql`${tenantId} = (current_setting('app.tenant_id', true))::uuid`
  return pgPolicy(`${table}_tenant_isolation`, {
    as: 'permissive',
    for: 'all',
    using: predicate,
    withCheck: predicate,
  })
}
