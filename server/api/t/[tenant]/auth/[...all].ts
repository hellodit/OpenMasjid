/** Per-tenant Better Auth endpoints: /api/t/<slug>/auth/* */
export default defineEventHandler((event) =>
  getTenantAuth(requireTenant(event)).handler(toWebRequest(event)),
)
