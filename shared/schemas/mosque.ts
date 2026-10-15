import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { mosqueProfile } from '../../server/db/schema'
import { nullableText } from './common'
import { PRAYER_CALC_METHODS } from '../utils/prayer'

const minutes = (min: number, max: number) => z.number().int().min(min).max(max)

const prayerMinutes = (min: number, max: number) =>
  z.object({
    fajr: minutes(min, max),
    sunrise: minutes(min, max),
    dhuhr: minutes(min, max),
    asr: minutes(min, max),
    maghrib: minutes(min, max),
    isha: minutes(min, max),
  })

const optionalUrl = z.url('URL tidak valid').nullish().or(z.literal('').transform(() => null))

const base = createInsertSchema(mosqueProfile, {
  name: (s) => s.trim().min(3, 'Nama masjid minimal 3 karakter').max(160),
})

export const mosqueSettingsSchema = base.pick({ name: true }).extend({
  arabicName: nullableText(160),
  tagline: nullableText(200),
  yearFounded: z.number().int().min(600).max(2100).nullish(),
  capacity: z.number().int().positive().max(1_000_000).nullish(),
  addressLine: nullableText(300),
  city: nullableText(120),
  province: nullableText(120),
  postalCode: nullableText(10),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  timezone: z.string().refine((tz) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: tz })
      return true
    }
    catch {
      return false
    }
  }, 'Zona waktu tidak valid'),
  phone: nullableText(40),
  email: z.email('Email tidak valid').nullish().or(z.literal('').transform(() => null)),
  whatsapp: nullableText(40),
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  isPublicProfile: z.boolean(),
  isVisibleOnTv: z.boolean(),
  isRegistrationOpen: z.boolean(),
  isMaintenance: z.boolean(),
  prayerMethod: z.enum(PRAYER_CALC_METHODS),
  asrMadhab: z.enum(['shafi', 'hanafi']),
  prayerAdjustments: prayerMinutes(-30, 30),
  iqamahOffsets: prayerMinutes(0, 60),
})
export type MosqueSettingsInput = z.input<typeof mosqueSettingsSchema>
