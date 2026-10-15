import { z } from 'zod'
import { isoDate, nullableText } from './common'

const optionalDate = isoDate.nullish().or(z.literal('').transform(() => null))

export const announcementStatusInput = z.enum(['draft', 'published', 'archived'])

export const announcementSchema = z
  .object({
    title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(160, 'Judul maksimal 160 karakter'),
    body: nullableText(5_000),
    status: announcementStatusInput.default('published'),
    isPinned: z.boolean().default(false),
    showOnDisplay: z.boolean().default(true),
    startsOn: optionalDate,
    endsOn: optionalDate,
  })
  .refine((v) => !v.startsOn || !v.endsOn || v.endsOn >= v.startsOn, {
    message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
    path: ['endsOn'],
  })
export type AnnouncementInput = z.input<typeof announcementSchema>

export const announcementListQuery = z.object({
  status: announcementStatusInput.optional(),
})

export const publicAnnouncementQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  /** Only announcements flagged for the TV display. */
  display: z.enum(['1', 'true']).optional(),
})
