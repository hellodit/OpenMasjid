/**
 * Guards /admin/**: only `admin` and `viewer` may enter.
 * Logged-in users visiting /auth/login are sent to the dashboard.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const isAdminArea = to.path === '/admin' || to.path.startsWith('/admin/')
  const isLogin = to.path === '/auth/login'
  if (!isAdminArea && !isLogin) return

  const { user, isStaff, fetchSession } = useAuth()
  await fetchSession()

  if (isLogin) {
    if (isStaff.value) return navigateTo(typeof to.query.redirect === 'string' ? to.query.redirect : '/admin')
    return
  }

  if (!user.value)
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })

  if (!isStaff.value)
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Akun Anda tidak punya akses ke CMS.' }))
})
