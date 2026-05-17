import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { categories } from './categories'
import { eventStatus } from './_enums'

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    startTime: time('start_time'),
    endTime: time('end_time'),
    locationName: text('location_name'),
    locationDetail: text('location_detail'),
    addressFull: text('address_full'),
    capacity: integer('capacity'),
    livestreamUrl: text('livestream_url'),
    isLivestream: boolean('is_livestream').notNull().default(false),
    isPinned: boolean('is_pinned').notNull().default(false),
    status: eventStatus('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('events_slug_unique').on(t.slug),
    index('events_status_start_date_idx').on(t.status, t.startDate),
    index('events_category_idx').on(t.categoryId),
    index('events_start_date_idx').on(t.startDate),
    check(
      'events_end_after_start',
      sql`${t.endDate} IS NULL OR ${t.endDate} >= ${t.startDate}`,
    ),
    check(
      'events_capacity_positive',
      sql`${t.capacity} IS NULL OR ${t.capacity} > 0`,
    ),
  ],
)
