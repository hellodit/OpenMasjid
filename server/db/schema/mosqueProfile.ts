import { sql } from 'drizzle-orm'
import {
  boolean,
  char,
  check,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  uuid,
} from 'drizzle-orm/pg-core'
import { asrMadhab, prayerCalcMethod } from './_enums'
import { timestamps } from './_columns'
import { users } from './users'

export const MOSQUE_PROFILE_SINGLETON_ID = '00000000-0000-0000-0000-000000000001'

export type PrayerKey = 'subuh' | 'terbit' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'
export type PrayerMinutes = Record<PrayerKey, number>

export const mosqueProfile = pgTable(
  'mosque_profile',
  {
    id: uuid('id').primaryKey().default(sql`'${sql.raw(MOSQUE_PROFILE_SINGLETON_ID)}'::uuid`),
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
    timezone: text('timezone').notNull().default('Asia/Jakarta'),
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

    // ─── Prayer time calculation (consumed by shared/utils/prayer.ts) ───
    prayerMethod: prayerCalcMethod('prayer_method').notNull().default('kemenag'),
    asrMadhab: asrMadhab('asr_madhab').notNull().default('shafi'),
    /** Minute corrections added to the calculated adzan time. */
    prayerAdjustments: jsonb('prayer_adjustments')
      .$type<PrayerMinutes>()
      .notNull()
      .default({ subuh: 0, terbit: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 }),
    /** Minutes between adzan and iqamah. */
    iqamahOffsets: jsonb('iqamah_offsets')
      .$type<PrayerMinutes>()
      .notNull()
      .default({ subuh: 10, terbit: 0, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 }),

    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    check(
      'mosque_profile_singleton',
      sql`${t.id} = '${sql.raw(MOSQUE_PROFILE_SINGLETON_ID)}'::uuid`,
    ),
  ],
)
