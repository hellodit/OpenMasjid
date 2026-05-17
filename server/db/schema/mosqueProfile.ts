import { sql } from 'drizzle-orm'
import {
  boolean,
  char,
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const MOSQUE_PROFILE_SINGLETON_ID = '00000000-0000-0000-0000-000000000001'

export const mosqueProfile = pgTable(
  'mosque_profile',
  {
    id: uuid('id').primaryKey(),
    slug: text('slug').unique(),
    name: text('name').notNull(),
    arabicName: text('arabic_name'),
    tagline: text('tagline'),
    yearFounded: smallint('year_founded'),
    capacity: integer('capacity'),
    addressLine: text('address_line'),
    city: text('city'),
    province: text('province'),
    postalCode: text('postal_code'),
    countryCode: char('country_code', { length: 2 }).default('ID'),
    latitude: numeric('latitude', { precision: 9, scale: 6 }),
    longitude: numeric('longitude', { precision: 9, scale: 6 }),
    timezone: text('timezone').notNull(),
    phone: text('phone'),
    email: text('email'),
    whatsapp: text('whatsapp'),
    websiteUrl: text('website_url'),
    instagramUrl: text('instagram_url'),
    youtubeUrl: text('youtube_url'),
    facebookUrl: text('facebook_url'),
    tiktokUrl: text('tiktok_url'),
    isPublicProfile: boolean('is_public_profile').notNull().default(true),
    isVisibleOnTv: boolean('is_visible_on_tv').notNull().default(true),
    isRegistrationOpen: boolean('is_registration_open').notNull().default(true),
    isMaintenance: boolean('is_maintenance').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    check(
      'mosque_profile_singleton',
      sql`${t.id} = '${sql.raw(MOSQUE_PROFILE_SINGLETON_ID)}'::uuid`,
    ),
  ],
)
