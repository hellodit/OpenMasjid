import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  foreignKey,
  date,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { categories } from './categories'
import { users } from './users'
import { eventStatus } from './_enums'
import { timestamps } from './_columns'

import { tenantIdColumn, tenantIsolationPolicy } from './tenants'
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    categoryId: uuid('category_id').notNull(),
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
    tenantIsolationPolicy('events', t.tenantId),
    uniqueIndex('events_tenant_slug_unique')
      .on(t.tenantId, t.slug)
      .where(sql`${t.deletedAt} IS NULL`),
    unique('events_tenant_id_id_unique').on(t.tenantId, t.id),
    foreignKey({
      name: 'events_category_fk',
      columns: [t.tenantId, t.categoryId],
      foreignColumns: [categories.tenantId, categories.id],
    }).onDelete('restrict'),
    index('events_tenant_status_start_idx').on(t.tenantId, t.status, t.startDate),
    index('events_category_idx').on(t.categoryId),
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
    tenantId: tenantIdColumn(),
    eventId: uuid('event_id').notNull(),
    name: text('name').notNull(),
    role: text('role'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [
    tenantIsolationPolicy('event_speakers', t.tenantId),
    index('event_speakers_event_idx').on(t.eventId, t.sortOrder),
    foreignKey({
      name: 'event_speakers_event_fk',
      columns: [t.tenantId, t.eventId],
      foreignColumns: [events.tenantId, events.id],
    }).onDelete('cascade'),
  ],
)

/** Susunan acara (agenda) of an event. */
export const eventAgendaItems = pgTable(
  'event_agenda_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    eventId: uuid('event_id').notNull(),
    startTime: time('start_time'),
    endTime: time('end_time'),
    title: text('title').notNull(),
    person: text('person'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [
    tenantIsolationPolicy('event_agenda_items', t.tenantId),
    index('event_agenda_items_event_idx').on(t.eventId, t.sortOrder),
    foreignKey({
      name: 'event_agenda_items_event_fk',
      columns: [t.tenantId, t.eventId],
      foreignColumns: [events.tenantId, events.id],
    }).onDelete('cascade'),
  ],
)
