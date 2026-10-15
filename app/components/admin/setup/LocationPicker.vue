<script setup lang="ts">
import { ID_CITIES, nearestCity } from '#shared/data/id-cities'

/**
 * Mosque location: pick a city (fills city/province/coordinates/timezone),
 * use the browser location, or type coordinates by hand.
 */
interface LocationValue {
  city?: string | null
  province?: string | null
  latitude?: number | null
  longitude?: number | null
  timezone?: string
}

const model = defineModel<LocationValue>({ required: true })
withDefaults(defineProps<{ disabled?: boolean, showPreview?: boolean }>(), { showPreview: true })

const TIMEZONES = [
  { label: 'WIB — Waktu Indonesia Barat (UTC+7)', value: 'Asia/Jakarta' },
  { label: 'WITA — Waktu Indonesia Tengah (UTC+8)', value: 'Asia/Makassar' },
  { label: 'WIT — Waktu Indonesia Timur (UTC+9)', value: 'Asia/Jayapura' },
]
const timezoneItems = computed(() =>
  !model.value.timezone || TIMEZONES.some(t => t.value === model.value.timezone)
    ? TIMEZONES
    : [...TIMEZONES, { label: model.value.timezone, value: model.value.timezone }],
)

const cityItems = ID_CITIES.map((c, i) => ({ label: c.name, description: c.province, value: i }))

const cityIndex = computed<number | undefined>({
  get: () => {
    const i = ID_CITIES.findIndex(c => c.name === model.value.city && c.province === model.value.province)
    return i >= 0 ? i : undefined
  },
  set: (i) => {
    const c = i != null ? ID_CITIES[i] : undefined
    if (!c) return
    model.value.city = c.name
    model.value.province = c.province
    model.value.latitude = c.latitude
    model.value.longitude = c.longitude
    model.value.timezone = c.timezone
    geoMessage.value = null
  },
})

/* ---------- Browser geolocation ---------- */
const locating = ref(false)
const geoMessage = ref<{ tone: 'info' | 'error', text: string } | null>(null)
const round6 = (n: number) => Math.round(n * 1e6) / 1e6

function useMyLocation() {
  if (!import.meta.client || !('geolocation' in navigator)) {
    geoMessage.value = { tone: 'error', text: 'Peramban ini tidak mendukung deteksi lokasi.' }
    return
  }
  locating.value = true
  geoMessage.value = null
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false
      const lat = round6(pos.coords.latitude)
      const lng = round6(pos.coords.longitude)
      model.value.latitude = lat
      model.value.longitude = lng
      const { city, km } = nearestCity(lat, lng)
      model.value.timezone = city.timezone
      if (km <= 75) {
        model.value.city = city.name
        model.value.province = city.province
        geoMessage.value = { tone: 'info', text: `Koordinat diambil dari perangkat Anda. Kota terdekat: ${city.name}, ${city.province} (±${Math.round(km)} km).` }
      }
      else {
        geoMessage.value = { tone: 'info', text: `Koordinat diambil dari perangkat Anda. Kota terdekat di daftar: ${city.name} (±${Math.round(km)} km) — pilih kota secara manual bila perlu.` }
      }
      manualOpen.value = true
    },
    (err) => {
      locating.value = false
      geoMessage.value = {
        tone: 'error',
        text: err.code === err.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Pilih kota dari daftar atau isi koordinat secara manual.'
          : 'Lokasi tidak dapat dideteksi. Pilih kota dari daftar atau isi koordinat secara manual.',
      }
    },
    { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
  )
}

/* ---------- Manual coordinates ---------- */
const manualOpen = ref(false)

function coordModel(key: 'latitude' | 'longitude') {
  return computed<string>({
    get: () => (model.value[key] != null ? String(model.value[key]) : ''),
    set: (v: string | number) => {
      const n = v === '' || v == null ? null : Number(v)
      model.value[key] = n != null && Number.isFinite(n) ? n : null
    },
  })
}
const latText = coordModel('latitude')
const lngText = coordModel('longitude')

const hasCoords = computed(() => model.value.latitude != null && model.value.longitude != null)
const mapTitle = computed(() => [model.value.city, model.value.province].filter(Boolean).join(', ') || 'Lokasi masjid')
</script>

<template>
  <div class="flex flex-col gap-4">
    <UFormField label="Kota / kabupaten" description="Pilih kota terdekat — koordinat dan zona waktu terisi otomatis.">
      <USelectMenu
        v-model="cityIndex"
        :items="cityItems"
        value-key="value"
        :filter-fields="['label', 'description']"
        :search-input="{ placeholder: 'Cari kota atau provinsi…', icon: 'i-lucide-search' }"
        :placeholder="model.city || 'Pilih kota'"
        icon="i-lucide-map-pin"
        size="lg"
        class="w-full"
        :disabled="disabled"
      />
    </UFormField>

    <div class="flex flex-wrap items-center gap-2">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-locate-fixed"
        :loading="locating"
        :disabled="disabled"
        label="Gunakan lokasi saya"
        @click="useMyLocation"
      />
      <UButton
        color="neutral"
        variant="ghost"
        :icon="manualOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        trailing
        label="Atur koordinat manual"
        @click="manualOpen = !manualOpen"
      />
    </div>

    <UAlert
      v-if="geoMessage"
      :color="geoMessage.tone === 'error' ? 'error' : 'info'"
      variant="subtle"
      :icon="geoMessage.tone === 'error' ? 'i-lucide-alert-circle' : 'i-lucide-locate'"
      :description="geoMessage.text"
    />

    <div v-if="manualOpen" class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Lintang (latitude)" help="Contoh: -6.914744">
        <UInput
          v-model="latText"
          type="number"
          step="0.000001"
          min="-90"
          max="90"
          inputmode="decimal"
          placeholder="-6.914744"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>
      <UFormField label="Bujur (longitude)" help="Contoh: 107.609810">
        <UInput
          v-model="lngText"
          type="number"
          step="0.000001"
          min="-180"
          max="180"
          inputmode="decimal"
          placeholder="107.609810"
          class="w-full"
          :disabled="disabled"
        />
      </UFormField>
    </div>

    <UFormField label="Zona waktu" description="Terisi dari kota yang dipilih; ubah bila perlu.">
      <USelect
        v-model="model.timezone"
        :items="timezoneItems"
        size="lg"
        class="w-full"
        :disabled="disabled"
      />
    </UFormField>

    <AdminSettingsMapStub
      v-if="hasCoords"
      :title="mapTitle"
      :latitude="model.latitude"
      :longitude="model.longitude"
      :timezone="model.timezone || 'Asia/Jakarta'"
    />

    <AdminSetupPrayerPreview
      v-if="showPreview && hasCoords"
      :latitude="model.latitude!"
      :longitude="model.longitude!"
      :timezone="model.timezone || 'Asia/Jakarta'"
    />
  </div>
</template>
