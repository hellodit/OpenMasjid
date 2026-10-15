import { z } from 'zod'

/** Mirrors the tenants_slug_format CHECK and server RESERVED_SLUGS. */
export const RESERVED_TENANT_SLUGS = [
  'api', 'admin', 'auth', 'daftar', 'masjid', 'login', 'logout', 'register', 'signup',
  'display', 'transparency', 'platform', 'app', 'www', 'static', 'assets', 'public',
  '_nuxt', '__nuxt', 'favicon', 'robots', 'sitemap', 'health', 'help', 'tentang', 'about',
] as const

export const tenantSlug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Alamat minimal 3 karakter')
  .max(48, 'Alamat maksimal 48 karakter')
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/, 'Gunakan huruf kecil, angka, dan tanda -')
  .refine((s) => !(RESERVED_TENANT_SLUGS as readonly string[]).includes(s), 'Alamat ini tidak bisa dipakai')

const password = z.string().min(8, 'Password minimal 8 karakter').max(128)

/**
 * Sign-up keeps to the minimum (mosque name + owner account). The address
 * (slug) is generated from the name unless the user picks one; location,
 * timezone and contact details are filled in the setup wizard afterwards.
 */
export const onboardingSchema = z.object({
  mosque: z.object({
    name: z.string().trim().min(3, 'Nama masjid minimal 3 karakter').max(160),
    slug: tenantSlug.optional().or(z.literal('').transform(() => undefined)),
  }),
  owner: z.object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120),
    email: z.email('Format email tidak valid').trim().toLowerCase(),
    password,
  }),
})
export type OnboardingInput = z.input<typeof onboardingSchema>

export const STAFF_ROLES_INPUT = ['admin', 'viewer'] as const

export const invitationCreateSchema = z.object({
  email: z.email('Format email tidak valid').trim().toLowerCase(),
  role: z.enum(STAFF_ROLES_INPUT),
})
export type InvitationCreateInput = z.input<typeof invitationCreateSchema>

export const invitationAcceptSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120),
  password,
})

export const teamMemberUpdateSchema = z
  .object({
    role: z.enum(STAFF_ROLES_INPUT).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.isActive !== undefined, 'Tidak ada perubahan')

/** GET /api/tenants — public directory & mosque search (landing page). */
export const tenantSearchQuery = z.object({
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})
