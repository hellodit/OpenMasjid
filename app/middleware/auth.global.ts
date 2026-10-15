/**
 * For pages under /[tenant]/…:
 *  - unknown mosque slug → 404
 *  - /[tenant]/admin/** → only `admin` and `viewer` of THAT mosque
 *  - /[tenant]/admin/team → owner only
 *  - /[tenant]/auth/login while signed in as staff → dashboard
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const raw = to.params.tenant
  const slug = Array.isArray(raw) ? raw[0] : raw
  if (!slug) return

  const ctx = useTenantContext(slug)
  const state = await ctx.load()
  if (state.status === 'missing')
    throw createError({ statusCode: 404, statusMessage: 'Masjid tidak ditemukan', fatal: true })

  const base = `/${slug}`
  const rest = to.path.slice(base.length) || '/'
  const isAdminArea = rest === '/admin' || rest.startsWith('/admin/')
  const isLogin = rest === '/auth/login'
  const user = state.user
  const isStaff = !!user && (user.role === 'admin' || user.role === 'viewer')

  if (isLogin && isStaff) {
    const redirect = typeof to.query.redirect === 'string' && to.query.redirect.startsWith(`${base}/`) ? to.query.redirect : `${base}/admin`
    return navigateTo(redirect)
  }
  if (!isAdminArea) return

  if (!user) return navigateTo({ path: `${base}/auth/login`, query: { redirect: to.fullPath } })
  if (!isStaff)
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Akun Anda tidak punya akses ke CMS masjid ini.' }))
  if (rest.startsWith('/admin/team') && !user.isOwner)
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Hanya pemilik masjid yang dapat mengelola pengurus.' }))
})
