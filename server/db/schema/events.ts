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
import { users } from './users'
import { eventStatus } from './_enums'
import { timestamps } from './_columns'

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    arabicTitle: text('arabic_title'),
    slug: text('slug').notNull(),
    description: text('description'),
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    startTime: time('start_time'),
    endTime: time('end_time'),
    locationName: text('location_name'),
    locationDetail: text('location_detail'),
    addressFull: text('address_full'),
    capacity: integer('capacity'),
    bannerUrl: text('banner_url'),
    livestreamUrl: text('livestream_url'),
    isLivestream: boolean('is_livestream').notNull().default(false),
    isPinned: boolean('is_pinned').notNull().default(false),
    requiresRegistration: boolean('requires_registration').notNull().default(true),
    /** Persisted: draft / published / archived. `ongoing` & `full` are derived (see shared/utils/events.ts). */
    status: eventStatus('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('events_slug_unique')
      .on(t.slug)
      .where(sql`${t.deletedAt} IS NULL`),
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

export const eventSpeakers = pgTable(
  'event_speakers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    role: text('role'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('event_speakers_event_idx').on(t.eventId, t.sortOrder)],
)

/** Susunan acara (agenda) of an event. */
export const eventAgendaItems = pgTable(
  'event_agenda_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    startTime: time('start_time'),
    endTime: time('end_time'),
    title: text('title').notNull(),
    person: text('person'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('event_agenda_items_event_idx').on(t.eventId, t.sortOrder)],
)
