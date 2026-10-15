import { z } from 'zod'
import { isoDate, nullableText } from './common'
import { DUTY_ROLES, DUTY_SERVICES, daysBetween } from '../utils/duties'

export const dutySchema = z.object({
  date: isoDate,
  service: z.enum(DUTY_SERVICES, 'Pilih jenis sholat/kegiatan'),
  role: z.enum(DUTY_ROLES, 'Pilih tugas'),
  personName: z.string().trim().min(2, 'Nama petugas minimal 2 karakter').max(120),
  phone: nullableText(40),
  topic: nullableText(200),
  notes: nullableText(500),
})
export type DutyInput = z.input<typeof dutySchema>

/** Inclusive date range, at most 93 days. */
export const dutyRangeQuery = z
  .object({ from: isoDate.optional(), to: isoDate.optional() })
  .refine((v) => !v.from || !v.to || (v.to >= v.from && daysBetween(v.from, v.to) <= 92), {
    message: 'Rentang tanggal tidak valid (maks. 93 hari)',
  })

/** Copy every assignment in [sourceFrom, sourceTo] so that sourceFrom lands on targetFrom. */
export const dutyCopySchema = z
  .object({ sourceFrom: isoDate, sourceTo: isoDate, targetFrom: isoDate })
  .refine((v) => v.sourceTo >= v.sourceFrom && daysBetween(v.sourceFrom, v.sourceTo) <= 30, {
    message: 'Rentang sumber maks. 31 hari',
    path: ['sourceTo'],
  })
  .refine((v) => v.targetFrom !== v.sourceFrom, { message: 'Tanggal tujuan sama dengan sumber', path: ['targetFrom'] })
