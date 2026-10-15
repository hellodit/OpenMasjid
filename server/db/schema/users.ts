import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { userRole } from './_enums'
import { timestamps } from './_columns'

/**
 * Application users. Also the Better Auth `user` model
 * (see server/utils/auth.ts — `name` is mapped to `fullName`).
 */
import { tenantIdColumn } from './tenants'
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    fullName: text('full_name').notNull(),
    image: text('image'),
    phone: text('phone'),
    role: userRole('role').notNull().default('member'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    // Accounts are per mosque: the same email may exist in several tenants.
    uniqueIndex('users_tenant_email_unique').on(t.tenantId, sql`lower(${t.email})`),
    unique('users_tenant_id_id_unique').on(t.tenantId, t.id),
    index('users_tenant_role_idx').on(t.tenantId, t.role),
  ],
)
