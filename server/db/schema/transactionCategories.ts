import { sql } from 'drizzle-orm'
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { transactionCategoryType } from './_enums'
import { timestamps } from './_columns'
import { users } from './users'

import { tenantIdColumn, tenantIsolationPolicy } from './tenants'
export const transactionCategories = pgTable(
  'transaction_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    parentId: uuid('parent_id'),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    type: transactionCategoryType('type').notNull(),
    icon: text('icon'),
    colorToken: text('color_token'),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    tenantIsolationPolicy('transaction_categories', t.tenantId),
    uniqueIndex('transaction_categories_tenant_slug_unique')
      .on(t.tenantId, t.slug)
      .where(sql`${t.deletedAt} IS NULL`),
    unique('transaction_categories_tenant_id_id_unique').on(t.tenantId, t.id),
    foreignKey({
      name: 'transaction_categories_parent_fk',
      columns: [t.tenantId, t.parentId],
      foreignColumns: [t.tenantId, t.id],
    }).onDelete('restrict'),
    index('transaction_categories_parent_idx').on(t.parentId),
    index('transaction_categories_type_active_idx').on(t.type, t.isActive),
  ],
)
