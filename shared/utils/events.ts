export type PersistedEventStatus = 'draft' | 'published' | 'archived'
export type EventDisplayStatus = PersistedEventStatus | 'ongoing' | 'full'

export const EVENT_STATUS_LABELS: Record<EventDisplayStatus, string> = {
  draft: 'Draf',
  published: 'Tayang',
  ongoing: 'Berjalan',
  full: 'Penuh',
  archived: 'Arsip',
}

/**
 * `ongoing` and `full` are derived, never stored, so they can't go stale.
 * `today` is the mosque-local calendar date (YYYY-MM-DD).
 */
export function deriveEventStatus(
  e: { status: string, startDate: string, endDate: string | null, capacity: number | null },
  registeredCount: number,
  today: string,
): EventDisplayStatus {
  if (e.status === 'draft' || e.status === 'archived') return e.status
  const end = e.endDate ?? e.startDate
  if (today >= e.startDate && today <= end) return 'ongoing'
  if (e.capacity && registeredCount >= e.capacity) return 'full'
  return 'published'
}

export type RegistrantStatus = 'confirmed' | 'attended' | 'cancelled'

export const REGISTRANT_STATUS_LABELS: Record<RegistrantStatus, string> = {
  confirmed: 'Terkonfirmasi',
  attended: 'Hadir',
  cancelled: 'Dibatalkan',
}

export function deriveRegistrantStatus(r: { attendedAt: Date | string | null, cancelledAt: Date | string | null }): RegistrantStatus {
  if (r.cancelledAt) return 'cancelled'
  if (r.attendedAt) return 'attended'
  return 'confirmed'
}

export type RegistrationAvailability =
  | 'open' // can register now
  | 'not-required' // event does not use registration
  | 'closed' // mosque closed registrations (settings) or event not published
  | 'full'
  | 'past'

export const REGISTRATION_AVAILABILITY_LABELS: Record<RegistrationAvailability, string> = {
  'open': 'Pendaftaran dibuka',
  'not-required': 'Terbuka untuk umum, tanpa pendaftaran',
  'closed': 'Pendaftaran ditutup',
  'full': 'Kuota penuh',
  'past': 'Kegiatan sudah selesai',
}

/**
 * Whether a member may register for an event right now. Used by the server
 * (enforcement) and the UI (button state). `today` = mosque-local YYYY-MM-DD.
 */
export function registrationAvailability(
  e: { status: string, startDate: string, endDate: string | null, capacity: number | null, requiresRegistration: boolean },
  registeredCount: number,
  today: string,
  mosqueRegistrationOpen: boolean,
): RegistrationAvailability {
  if (!e.requiresRegistration) return 'not-required'
  if ((e.endDate ?? e.startDate) < today) return 'past'
  if (e.status !== 'published' || !mosqueRegistrationOpen) return 'closed'
  if (e.capacity && registeredCount >= e.capacity) return 'full'
  return 'open'
}
