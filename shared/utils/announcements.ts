export interface AnnouncementWindow {
  status: 'draft' | 'published' | 'archived'
  startsOn: string | null
  endsOn: string | null
}

export type AnnouncementVisibility = 'draft' | 'archived' | 'scheduled' | 'active' | 'expired'

/** Public visibility of an announcement on a mosque-local date `today`. */
export function announcementVisibility(a: AnnouncementWindow, today: string): AnnouncementVisibility {
  if (a.status !== 'published') return a.status
  if (a.startsOn && a.startsOn > today) return 'scheduled'
  if (a.endsOn && a.endsOn < today) return 'expired'
  return 'active'
}

export const ANNOUNCEMENT_VISIBILITY_LABELS: Record<AnnouncementVisibility, string> = {
  draft: 'Draf',
  archived: 'Diarsipkan',
  scheduled: 'Terjadwal',
  active: 'Tayang',
  expired: 'Berakhir',
}
