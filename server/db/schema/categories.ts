import { sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { timestamps } from './_columns'

/** Event categories (Kajian, Tahsin, TPA, ...). */
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
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
    uniqueIndex('categories_slug_unique')
      .on(t.slug)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
)
