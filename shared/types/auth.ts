export const USER_ROLES = ['admin', 'viewer', 'jamaah'] as const
export type UserRole = (typeof USER_ROLES)[number]

/** Roles allowed into /admin. */
export const STAFF_ROLES: readonly UserRole[] = ['admin', 'viewer']
