import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  remember: z.boolean().default(true),
})
export type LoginInput = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.email('Format email tidak valid'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: 'Konfirmasi password tidak sama', path: ['confirm'] })
