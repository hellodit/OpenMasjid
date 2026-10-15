import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { userRole } from './_enums'
import { timestamps } from './_columns'

/**
 * Application users. Also the Better Auth `user` model
 * (see server/utils/auth.ts — `name` is mapped to `fullName`).
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    fullName: text('full_name').notNull(),
    image: text('image'),
    avatarAssetId: uuid('avatar_asset_id'),
    phone: text('phone'),
    role: userRole('role').notNull().default('jamaah'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('users_email_unique').on(sql`lower(${t.email})`),
    index('users_role_idx').on(t.role),
  ],
)
