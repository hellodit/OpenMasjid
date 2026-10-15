export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const profile = await getMosqueProfile()
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Profil masjid belum dibuat. Jalankan db:seed.' })
  return {
    ...profile,
    latitude: profile.latitude != null ? Number(profile.latitude) : null,
    longitude: profile.longitude != null ? Number(profile.longitude) : null,
  }
})
