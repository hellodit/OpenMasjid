import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { userRole } from './_enums'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    phone: text('phone'),
    role: userRole('role').notNull().default('jamaah'),
    avatarAssetId: uuid('avatar_asset_id'),
    invitedBy: uuid('invited_by').references((): AnyPgColumn => users.id, {
      onDelete: 'set null',
    }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('users_email_unique').on(t.email),
    index('users_role_idx').on(t.role),
  ],
)
