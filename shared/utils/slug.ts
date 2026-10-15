/** URL slug from a mosque name: "Masjid Al-Ikhlas Bandung" → "masjid-al-ikhlas-bandung". */
export function mosqueSlugFromName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) // room for a "-NN" suffix within the 48-char limit
    .replace(/-+$/g, '')
}
