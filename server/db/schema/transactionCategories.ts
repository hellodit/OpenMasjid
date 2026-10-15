import { sql } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { transactionCategoryType } from './_enums'
import { timestamps } from './_columns'
import { users } from './users'

export const transactionCategories = pgTable(
  'transaction_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentId: uuid('parent_id').references(
      (): AnyPgColumn => transactionCategories.id,
      { onDelete: 'restrict' },
    ),
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
    uniqueIndex('transaction_categories_slug_unique')
      .on(t.slug)
      .where(sql`${t.deletedAt} IS NULL`),
    index('transaction_categories_parent_idx').on(t.parentId),
    index('transaction_categories_type_active_idx').on(t.type, t.isActive),
  ],
)
