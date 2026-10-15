import { sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { timestamps } from './_columns'

/** Event categories (Kajian, Tahsin, TPA, ...). */
import { tenantIdColumn, tenantIsolationPolicy } from './tenants'
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    colorToken: text('color_token'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    tenantIsolationPolicy('categories', t.tenantId),
    uniqueIndex('categories_tenant_slug_unique')
      .on(t.tenantId, t.slug)
      .where(sql`${t.deletedAt} IS NULL`),
    unique('categories_tenant_id_id_unique').on(t.tenantId, t.id),
  ],
)
