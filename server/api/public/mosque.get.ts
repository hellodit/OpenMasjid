/** Public mosque profile (portal, TV display, transparency page). */
export default defineEventHandler(async () => {
  const p = await getMosqueProfile()
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Profil masjid belum diatur' })
  return {
    name: p.name,
    arabicName: p.arabicName,
    tagline: p.tagline,
    yearFounded: p.yearFounded,
    capacity: p.capacity,
    addressLine: p.addressLine,
    city: p.city,
    province: p.province,
    postalCode: p.postalCode,
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
    phone: p.phone,
    email: p.email,
    whatsapp: p.whatsapp,
    websiteUrl: p.websiteUrl,
    instagramUrl: p.instagramUrl,
    youtubeUrl: p.youtubeUrl,
    facebookUrl: p.facebookUrl,
    tiktokUrl: p.tiktokUrl,
    isRegistrationOpen: p.isRegistrationOpen,
    isMaintenance: p.isMaintenance,
  }
})
