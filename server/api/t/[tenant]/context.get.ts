/**
 * Tenant + current user for the frontend (SSR-safe: no session token).
 * Used by app/composables/useTenant.ts and useAuth.ts.
 */
export default defineTenantHandler('public', async (_event, { tenant, user }) => ({
  tenant: { slug: tenant.slug, name: tenant.name, timezone: tenant.timezone },
  user,
}))
