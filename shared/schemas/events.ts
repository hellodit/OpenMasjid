import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { categories, events } from '../../server/db/schema'
import { isoDate, nullableText, pagination, timeOfDay, uuid } from './common'

// ─── Event categories ──────────────────────────────────────────────────────
const categoryBase = createInsertSchema(categories, {
  name: (s) => s.trim().min(1, 'Nama kategori wajib diisi').max(80),
})

export const eventCategoryCreateSchema = categoryBase.pick({ name: true }).extend({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan -').max(80).optional(),
  description: nullableText(300),
  icon: nullableText(80),
  colorToken: nullableText(40),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
})
export type EventCategoryInput = z.input<typeof eventCategoryCreateSchema>
export const eventCategoryUpdateSchema = eventCategoryCreateSchema.partial()

// ─── Events ────────────────────────────────────────────────────────────────
export const eventSpeakerSchema = z.object({
  name: z.string().trim().min(1, 'Nama pembicara wajib diisi').max(120),
  role: nullableText(160),
})

export const eventAgendaItemSchema = z.object({
  startTime: timeOfDay.nullish().or(z.literal('').transform(() => null)),
  endTime: timeOfDay.nullish().or(z.literal('').transform(() => null)),
  title: z.string().trim().min(1, 'Judul agenda wajib diisi').max(160),
  person: nullableText(120),
})

const eventBase = createInsertSchema(events, {
  title: (s) => s.trim().min(3, 'Judul minimal 3 karakter').max(160),
})

export const eventStatusInput = z.enum(['draft', 'published', 'archived'])

export const eventCreateSchema = eventBase
  .pick({ title: true })
  .extend({
    categoryId: uuid,
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan -').max(160).optional(),
    arabicTitle: nullableText(160),
    description: nullableText(10_000),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    startDate: isoDate,
    endDate: isoDate.nullish().or(z.literal('').transform(() => null)),
    startTime: timeOfDay.nullish().or(z.literal('').transform(() => null)),
    endTime: timeOfDay.nullish().or(z.literal('').transform(() => null)),
    locationName: nullableText(160),
    locationDetail: nullableText(160),
    addressFull: nullableText(500),
    capacity: z.number().int().positive('Kapasitas harus lebih dari 0').max(100_000).nullish(),
    bannerUrl: z.url().nullish().or(z.literal('').transform(() => null)),
    livestreamUrl: z.url().nullish().or(z.literal('').transform(() => null)),
    isLivestream: z.boolean().default(false),
    isPinned: z.boolean().default(false),
    requiresRegistration: z.boolean().default(true),
    status: eventStatusInput.default('draft'),
    speakers: z.array(eventSpeakerSchema).max(10).default([]),
    agenda: z.array(eventAgendaItemSchema).max(30).default([]),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  })
  .refine((v) => !v.isLivestream || !!v.livestreamUrl, {
    message: 'URL livestream wajib diisi jika livestream aktif',
    path: ['livestreamUrl'],
  })
export type EventInput = z.input<typeof eventCreateSchema>
export type EventOutput = z.output<typeof eventCreateSchema>

/** PUT replaces the whole event (speakers & agenda included). */
export const eventUpdateSchema = eventCreateSchema

export const eventListQuery = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  categoryId: uuid.optional(),
  status: z.enum(['draft', 'published', 'archived', 'ongoing', 'full', 'upcoming', 'past']).optional(),
  ...pagination,
})

// ─── Registrants ───────────────────────────────────────────────────────────
export const registrantListQuery = z.object({
  eventId: uuid.optional(),
  status: z.enum(['confirmed', 'attended', 'cancelled']).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  ...pagination,
})

export const registrantActionSchema = z.object({
  action: z.enum(['check-in', 'undo-check-in', 'cancel', 'restore']),
})
