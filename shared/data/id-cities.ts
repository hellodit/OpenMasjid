/**
 * Indonesian cities/regency seats with approximate centre coordinates (~0.01°)
 * and IANA timezone. Used by the setup wizard's location picker to fill
 * city, province, coordinates and timezone in one pick.
 *
 * Not auto-imported: `import { ID_CITIES, nearestCity } from '#shared/data/id-cities'`.
 */

export type IdTimezone = 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'

export interface IdCity {
  name: string
  province: string
  latitude: number
  longitude: number
  timezone: IdTimezone
}

/** Timezone per province (WIB / WITA / WIT). */
const PROVINCE_TZ: Record<string, IdTimezone> = {
  'Aceh': 'Asia/Jakarta',
  'Sumatera Utara': 'Asia/Jakarta',
  'Sumatera Barat': 'Asia/Jakarta',
  'Riau': 'Asia/Jakarta',
  'Kepulauan Riau': 'Asia/Jakarta',
  'Jambi': 'Asia/Jakarta',
  'Sumatera Selatan': 'Asia/Jakarta',
  'Kepulauan Bangka Belitung': 'Asia/Jakarta',
  'Bengkulu': 'Asia/Jakarta',
  'Lampung': 'Asia/Jakarta',
  'DKI Jakarta': 'Asia/Jakarta',
  'Banten': 'Asia/Jakarta',
  'Jawa Barat': 'Asia/Jakarta',
  'Jawa Tengah': 'Asia/Jakarta',
  'DI Yogyakarta': 'Asia/Jakarta',
  'Jawa Timur': 'Asia/Jakarta',
  'Kalimantan Barat': 'Asia/Jakarta',
  'Kalimantan Tengah': 'Asia/Jakarta',
  'Kalimantan Selatan': 'Asia/Makassar',
  'Kalimantan Timur': 'Asia/Makassar',
  'Kalimantan Utara': 'Asia/Makassar',
  'Bali': 'Asia/Makassar',
  'Nusa Tenggara Barat': 'Asia/Makassar',
  'Nusa Tenggara Timur': 'Asia/Makassar',
  'Sulawesi Utara': 'Asia/Makassar',
  'Gorontalo': 'Asia/Makassar',
  'Sulawesi Tengah': 'Asia/Makassar',
  'Sulawesi Barat': 'Asia/Makassar',
  'Sulawesi Selatan': 'Asia/Makassar',
  'Sulawesi Tenggara': 'Asia/Makassar',
  'Maluku': 'Asia/Jayapura',
  'Maluku Utara': 'Asia/Jayapura',
  'Papua': 'Asia/Jayapura',
  'Papua Barat': 'Asia/Jayapura',
  'Papua Barat Daya': 'Asia/Jayapura',
  'Papua Tengah': 'Asia/Jayapura',
  'Papua Pegunungan': 'Asia/Jayapura',
  'Papua Selatan': 'Asia/Jayapura',
}

/** [name, province, latitude, longitude] — provincial capitals first per province. */
const ROWS: [string, string, number, number][] = [
  // Aceh
  ['Banda Aceh', 'Aceh', 5.55, 95.32],
  ['Lhokseumawe', 'Aceh', 5.18, 97.15],
  ['Langsa', 'Aceh', 4.47, 97.97],
  ['Meulaboh', 'Aceh', 4.14, 96.13],
  ['Sabang', 'Aceh', 5.89, 95.32],
  // Sumatera Utara
  ['Medan', 'Sumatera Utara', 3.59, 98.67],
  ['Binjai', 'Sumatera Utara', 3.60, 98.49],
  ['Pematangsiantar', 'Sumatera Utara', 2.96, 99.06],
  ['Tebing Tinggi', 'Sumatera Utara', 3.33, 99.16],
  ['Sibolga', 'Sumatera Utara', 1.74, 98.78],
  ['Padang Sidempuan', 'Sumatera Utara', 1.38, 99.27],
  ['Tanjung Balai', 'Sumatera Utara', 2.97, 99.80],
  ['Kisaran', 'Sumatera Utara', 2.98, 99.62],
  ['Rantau Prapat', 'Sumatera Utara', 2.10, 99.83],
  // Sumatera Barat
  ['Padang', 'Sumatera Barat', -0.95, 100.35],
  ['Bukittinggi', 'Sumatera Barat', -0.30, 100.37],
  ['Payakumbuh', 'Sumatera Barat', -0.22, 100.63],
  ['Solok', 'Sumatera Barat', -0.79, 100.66],
  ['Pariaman', 'Sumatera Barat', -0.62, 100.12],
  // Riau
  ['Pekanbaru', 'Riau', 0.51, 101.45],
  ['Dumai', 'Riau', 1.67, 101.45],
  // Kepulauan Riau
  ['Tanjung Pinang', 'Kepulauan Riau', 0.92, 104.45],
  ['Batam', 'Kepulauan Riau', 1.13, 104.05],
  // Jambi
  ['Jambi', 'Jambi', -1.61, 103.61],
  ['Sungai Penuh', 'Jambi', -2.06, 101.39],
  // Sumatera Selatan
  ['Palembang', 'Sumatera Selatan', -2.98, 104.75],
  ['Lubuklinggau', 'Sumatera Selatan', -3.30, 102.86],
  ['Prabumulih', 'Sumatera Selatan', -3.43, 104.24],
  ['Lahat', 'Sumatera Selatan', -3.79, 103.54],
  // Kepulauan Bangka Belitung
  ['Pangkal Pinang', 'Kepulauan Bangka Belitung', -2.13, 106.11],
  ['Tanjung Pandan', 'Kepulauan Bangka Belitung', -2.74, 107.63],
  // Bengkulu
  ['Bengkulu', 'Bengkulu', -3.80, 102.27],
  // Lampung
  ['Bandar Lampung', 'Lampung', -5.43, 105.26],
  ['Metro', 'Lampung', -5.11, 105.31],
  // DKI Jakarta
  ['Jakarta Pusat', 'DKI Jakarta', -6.18, 106.83],
  ['Jakarta Selatan', 'DKI Jakarta', -6.26, 106.81],
  ['Jakarta Timur', 'DKI Jakarta', -6.23, 106.90],
  ['Jakarta Barat', 'DKI Jakarta', -6.17, 106.76],
  ['Jakarta Utara', 'DKI Jakarta', -6.13, 106.87],
  // Banten
  ['Serang', 'Banten', -6.12, 106.15],
  ['Tangerang', 'Banten', -6.18, 106.63],
  ['Tangerang Selatan', 'Banten', -6.29, 106.72],
  ['Cilegon', 'Banten', -6.00, 106.05],
  ['Rangkasbitung', 'Banten', -6.36, 106.25],
  ['Pandeglang', 'Banten', -6.31, 106.10],
  // Jawa Barat
  ['Bandung', 'Jawa Barat', -6.91, 107.61],
  ['Bogor', 'Jawa Barat', -6.60, 106.80],
  ['Depok', 'Jawa Barat', -6.40, 106.82],
  ['Bekasi', 'Jawa Barat', -6.24, 106.99],
  ['Cimahi', 'Jawa Barat', -6.87, 107.54],
  ['Soreang', 'Jawa Barat', -7.03, 107.52],
  ['Sukabumi', 'Jawa Barat', -6.92, 106.93],
  ['Cirebon', 'Jawa Barat', -6.71, 108.56],
  ['Tasikmalaya', 'Jawa Barat', -7.33, 108.22],
  ['Banjar', 'Jawa Barat', -7.37, 108.54],
  ['Garut', 'Jawa Barat', -7.21, 107.90],
  ['Karawang', 'Jawa Barat', -6.31, 107.30],
  ['Purwakarta', 'Jawa Barat', -6.55, 107.44],
  ['Subang', 'Jawa Barat', -6.57, 107.76],
  ['Cianjur', 'Jawa Barat', -6.82, 107.14],
  ['Sumedang', 'Jawa Barat', -6.86, 107.92],
  ['Indramayu', 'Jawa Barat', -6.33, 108.32],
  ['Kuningan', 'Jawa Barat', -6.98, 108.48],
  ['Majalengka', 'Jawa Barat', -6.84, 108.23],
  ['Ciamis', 'Jawa Barat', -7.33, 108.35],
  // Jawa Tengah
  ['Semarang', 'Jawa Tengah', -6.97, 110.42],
  ['Surakarta (Solo)', 'Jawa Tengah', -7.57, 110.82],
  ['Magelang', 'Jawa Tengah', -7.48, 110.22],
  ['Salatiga', 'Jawa Tengah', -7.33, 110.50],
  ['Pekalongan', 'Jawa Tengah', -6.89, 109.68],
  ['Tegal', 'Jawa Tengah', -6.87, 109.14],
  ['Purwokerto', 'Jawa Tengah', -7.42, 109.23],
  ['Kudus', 'Jawa Tengah', -6.80, 110.84],
  ['Jepara', 'Jawa Tengah', -6.59, 110.67],
  ['Cilacap', 'Jawa Tengah', -7.73, 109.01],
  ['Klaten', 'Jawa Tengah', -7.71, 110.61],
  ['Pati', 'Jawa Tengah', -6.75, 111.04],
  ['Demak', 'Jawa Tengah', -6.89, 110.64],
  ['Kebumen', 'Jawa Tengah', -7.67, 109.65],
  ['Wonosobo', 'Jawa Tengah', -7.36, 109.90],
  ['Boyolali', 'Jawa Tengah', -7.53, 110.60],
  ['Sragen', 'Jawa Tengah', -7.43, 111.02],
  ['Brebes', 'Jawa Tengah', -6.87, 109.04],
  ['Rembang', 'Jawa Tengah', -6.71, 111.34],
  ['Blora', 'Jawa Tengah', -6.97, 111.42],
  // DI Yogyakarta
  ['Yogyakarta', 'DI Yogyakarta', -7.80, 110.37],
  ['Sleman', 'DI Yogyakarta', -7.72, 110.36],
  ['Bantul', 'DI Yogyakarta', -7.89, 110.33],
  ['Wonosari', 'DI Yogyakarta', -7.97, 110.60],
  ['Wates', 'DI Yogyakarta', -7.86, 110.16],
  // Jawa Timur
  ['Surabaya', 'Jawa Timur', -7.25, 112.75],
  ['Malang', 'Jawa Timur', -7.98, 112.63],
  ['Batu', 'Jawa Timur', -7.87, 112.52],
  ['Sidoarjo', 'Jawa Timur', -7.45, 112.72],
  ['Gresik', 'Jawa Timur', -7.16, 112.65],
  ['Kediri', 'Jawa Timur', -7.82, 112.01],
  ['Blitar', 'Jawa Timur', -8.10, 112.17],
  ['Madiun', 'Jawa Timur', -7.63, 111.52],
  ['Mojokerto', 'Jawa Timur', -7.47, 112.43],
  ['Pasuruan', 'Jawa Timur', -7.65, 112.91],
  ['Probolinggo', 'Jawa Timur', -7.75, 113.22],
  ['Jember', 'Jawa Timur', -8.17, 113.70],
  ['Banyuwangi', 'Jawa Timur', -8.22, 114.37],
  ['Lamongan', 'Jawa Timur', -7.12, 112.42],
  ['Tuban', 'Jawa Timur', -6.90, 112.05],
  ['Bojonegoro', 'Jawa Timur', -7.15, 111.88],
  ['Ponorogo', 'Jawa Timur', -7.87, 111.46],
  ['Tulungagung', 'Jawa Timur', -8.07, 111.90],
  ['Jombang', 'Jawa Timur', -7.55, 112.23],
  ['Ngawi', 'Jawa Timur', -7.40, 111.45],
  ['Lumajang', 'Jawa Timur', -8.13, 113.22],
  ['Situbondo', 'Jawa Timur', -7.71, 114.01],
  ['Bangkalan', 'Jawa Timur', -7.04, 112.74],
  ['Pamekasan', 'Jawa Timur', -7.16, 113.48],
  ['Sumenep', 'Jawa Timur', -7.01, 113.86],
  // Kalimantan Barat
  ['Pontianak', 'Kalimantan Barat', -0.03, 109.33],
  ['Singkawang', 'Kalimantan Barat', 0.91, 108.98],
  ['Ketapang', 'Kalimantan Barat', -1.85, 109.98],
  ['Sintang', 'Kalimantan Barat', 0.07, 111.50],
  // Kalimantan Tengah
  ['Palangka Raya', 'Kalimantan Tengah', -2.21, 113.92],
  ['Sampit', 'Kalimantan Tengah', -2.53, 112.95],
  ['Pangkalan Bun', 'Kalimantan Tengah', -2.68, 111.62],
  // Kalimantan Selatan
  ['Banjarbaru', 'Kalimantan Selatan', -3.44, 114.83],
  ['Banjarmasin', 'Kalimantan Selatan', -3.32, 114.59],
  ['Martapura', 'Kalimantan Selatan', -3.42, 114.86],
  ['Kotabaru', 'Kalimantan Selatan', -3.24, 116.23],
  // Kalimantan Timur
  ['Samarinda', 'Kalimantan Timur', -0.50, 117.15],
  ['Balikpapan', 'Kalimantan Timur', -1.27, 116.83],
  ['Bontang', 'Kalimantan Timur', 0.13, 117.50],
  ['Tenggarong', 'Kalimantan Timur', -0.42, 116.99],
  // Kalimantan Utara
  ['Tanjung Selor', 'Kalimantan Utara', 2.84, 117.37],
  ['Tarakan', 'Kalimantan Utara', 3.30, 117.63],
  ['Nunukan', 'Kalimantan Utara', 4.14, 117.66],
  // Bali
  ['Denpasar', 'Bali', -8.65, 115.22],
  ['Singaraja', 'Bali', -8.11, 115.09],
  ['Gianyar', 'Bali', -8.54, 115.33],
  ['Tabanan', 'Bali', -8.54, 115.12],
  ['Semarapura', 'Bali', -8.54, 115.40],
  ['Negara', 'Bali', -8.36, 114.62],
  // Nusa Tenggara Barat
  ['Mataram', 'Nusa Tenggara Barat', -8.58, 116.12],
  ['Praya', 'Nusa Tenggara Barat', -8.71, 116.27],
  ['Selong', 'Nusa Tenggara Barat', -8.65, 116.53],
  ['Sumbawa Besar', 'Nusa Tenggara Barat', -8.49, 117.42],
  ['Dompu', 'Nusa Tenggara Barat', -8.54, 118.46],
  ['Bima', 'Nusa Tenggara Barat', -8.46, 118.73],
  // Nusa Tenggara Timur
  ['Kupang', 'Nusa Tenggara Timur', -10.18, 123.61],
  ['Ende', 'Nusa Tenggara Timur', -8.84, 121.66],
  ['Maumere', 'Nusa Tenggara Timur', -8.62, 122.21],
  ['Labuan Bajo', 'Nusa Tenggara Timur', -8.49, 119.89],
  ['Ruteng', 'Nusa Tenggara Timur', -8.61, 120.46],
  ['Waingapu', 'Nusa Tenggara Timur', -9.66, 120.26],
  ['Atambua', 'Nusa Tenggara Timur', -9.11, 124.89],
  ['Kefamenanu', 'Nusa Tenggara Timur', -9.45, 124.48],
  // Sulawesi Utara
  ['Manado', 'Sulawesi Utara', 1.47, 124.84],
  ['Bitung', 'Sulawesi Utara', 1.44, 125.19],
  ['Tomohon', 'Sulawesi Utara', 1.32, 124.84],
  ['Kotamobagu', 'Sulawesi Utara', 0.73, 124.32],
  // Gorontalo
  ['Gorontalo', 'Gorontalo', 0.54, 123.06],
  ['Limboto', 'Gorontalo', 0.62, 122.97],
  // Sulawesi Tengah
  ['Palu', 'Sulawesi Tengah', -0.90, 119.87],
  ['Luwuk', 'Sulawesi Tengah', -0.95, 122.79],
  ['Poso', 'Sulawesi Tengah', -1.39, 120.75],
  ['Toli-Toli', 'Sulawesi Tengah', 1.04, 120.82],
  // Sulawesi Barat
  ['Mamuju', 'Sulawesi Barat', -2.68, 118.89],
  ['Majene', 'Sulawesi Barat', -3.54, 118.97],
  ['Polewali', 'Sulawesi Barat', -3.42, 119.34],
  // Sulawesi Selatan
  ['Makassar', 'Sulawesi Selatan', -5.15, 119.42],
  ['Sungguminasa (Gowa)', 'Sulawesi Selatan', -5.20, 119.45],
  ['Maros', 'Sulawesi Selatan', -5.00, 119.57],
  ['Parepare', 'Sulawesi Selatan', -4.01, 119.62],
  ['Palopo', 'Sulawesi Selatan', -2.99, 120.20],
  ['Watampone (Bone)', 'Sulawesi Selatan', -4.54, 120.33],
  ['Sengkang', 'Sulawesi Selatan', -4.13, 120.03],
  ['Bulukumba', 'Sulawesi Selatan', -5.56, 120.19],
  // Sulawesi Tenggara
  ['Kendari', 'Sulawesi Tenggara', -3.97, 122.51],
  ['Baubau', 'Sulawesi Tenggara', -5.47, 122.62],
  ['Kolaka', 'Sulawesi Tenggara', -4.05, 121.59],
  ['Raha', 'Sulawesi Tenggara', -4.84, 122.72],
  // Maluku
  ['Ambon', 'Maluku', -3.70, 128.18],
  ['Masohi', 'Maluku', -3.30, 128.96],
  ['Tual', 'Maluku', -5.63, 132.75],
  ['Saumlaki', 'Maluku', -7.98, 131.30],
  // Maluku Utara
  ['Sofifi', 'Maluku Utara', 0.74, 127.56],
  ['Ternate', 'Maluku Utara', 0.79, 127.38],
  ['Tidore', 'Maluku Utara', 0.68, 127.40],
  ['Tobelo', 'Maluku Utara', 1.73, 128.01],
  // Papua
  ['Jayapura', 'Papua', -2.53, 140.72],
  ['Sentani', 'Papua', -2.57, 140.51],
  ['Biak', 'Papua', -1.18, 136.08],
  ['Serui', 'Papua', -1.88, 136.24],
  // Papua Barat
  ['Manokwari', 'Papua Barat', -0.86, 134.06],
  ['Fakfak', 'Papua Barat', -2.92, 132.30],
  ['Kaimana', 'Papua Barat', -3.66, 133.77],
  ['Bintuni', 'Papua Barat', -2.11, 133.53],
  // Papua Barat Daya
  ['Sorong', 'Papua Barat Daya', -0.88, 131.26],
  ['Waisai (Raja Ampat)', 'Papua Barat Daya', -0.43, 130.82],
  // Papua Tengah
  ['Nabire', 'Papua Tengah', -3.37, 135.50],
  ['Timika', 'Papua Tengah', -4.55, 136.89],
  // Papua Pegunungan
  ['Wamena', 'Papua Pegunungan', -4.10, 138.95],
  // Papua Selatan
  ['Merauke', 'Papua Selatan', -8.49, 140.40],
]

export const ID_CITIES: readonly IdCity[] = ROWS.map(([name, province, latitude, longitude]) => ({
  name,
  province,
  latitude,
  longitude,
  timezone: PROVINCE_TZ[province] ?? 'Asia/Jakarta',
}))

/** Great-circle distance in kilometres. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLng = (lng2 - lng1) * rad
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** Closest city in the list (with its distance in km). */
export function nearestCity(lat: number, lng: number): { city: IdCity, km: number } {
  let best = ID_CITIES[0]!
  let bestKm = Infinity
  for (const c of ID_CITIES) {
    const km = distanceKm(lat, lng, c.latitude, c.longitude)
    if (km < bestKm) {
      best = c
      bestKm = km
    }
  }
  return { city: best, km: bestKm }
}
