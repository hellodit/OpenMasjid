<script setup lang="ts">
import type { MosqueSettingsInput } from '#shared/schemas/mosque'

const state = defineModel<MosqueSettingsInput>('state', { required: true })

const TIMEZONES = [
  { label: 'WIB — Asia/Jakarta (UTC+7)', value: 'Asia/Jakarta' },
  { label: 'WITA — Asia/Makassar (UTC+8)', value: 'Asia/Makassar' },
  { label: 'WIT — Asia/Jayapura (UTC+9)', value: 'Asia/Jayapura' },
]
const timezoneItems = computed(() =>
  TIMEZONES.some(t => t.value === state.value.timezone)
    ? TIMEZONES
    : [...TIMEZONES, { label: state.value.timezone, value: state.value.timezone }],
)

const mapTitle = computed(() =>
  [state.value.addressLine, state.value.city].filter(Boolean).join(', ') || state.value.name || 'Lokasi masjid',
)

const ui = { root: 'w-full' }
const coordFormat = { maximumFractionDigits: 6 }
</script>

<template>
  <div>
    <AdminFormSection
      title="Profil Masjid"
      description="Informasi utama yang ditampilkan di header CMS, TV display, dan halaman publik."
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
        <UFormField label="Nama Masjid" name="name" required>
          <UInput v-model="state.name" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="Nama dalam Bahasa Arab" name="arabicName" hint="opsional">
          <UInput
            v-model="state.arabicName"
            :ui="{ ...ui, base: 'font-arab text-right text-base' }"
            size="lg"
            dir="rtl"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
        <UFormField label="Tahun Berdiri" name="yearFounded">
          <UInputNumber
            v-model="state.yearFounded"
            :min="600"
            :max="2100"
            :format-options="{ useGrouping: false }"
            :ui="ui"
            size="lg"
            placeholder="cth. 1987"
          />
        </UFormField>
        <UFormField label="Kapasitas Jamaah" name="capacity" help="Estimasi total kapasitas saat sholat berjamaah.">
          <UInputNumber
            v-model="state.capacity"
            :min="1"
            :ui="ui"
            size="lg"
            placeholder="cth. 600"
          />
        </UFormField>
      </div>

      <UFormField
        label="Tagline"
        name="tagline"
        help="Maksimum 200 karakter. Ditampilkan pada halaman publik dan TV display."
      >
        <UTextarea
          v-model="state.tagline"
          :rows="3"
          :maxlength="200"
          autoresize
          :ui="ui"
          size="lg"
        />
      </UFormField>
    </AdminFormSection>

    <AdminFormSection
      title="Kontak & Media Sosial"
      description="Kanal kontak DKM dan tautan yang ditampilkan pada halaman publik."
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        <UFormField label="Telepon" name="phone">
          <UInput v-model="state.phone" icon="i-lucide-phone" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="WhatsApp" name="whatsapp">
          <UInput v-model="state.whatsapp" icon="i-lucide-message-circle" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" icon="i-lucide-mail" :ui="ui" size="lg" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <UFormField label="Website" name="websiteUrl">
          <UInput v-model="state.websiteUrl" icon="i-lucide-globe" placeholder="https://…" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="Instagram" name="instagramUrl">
          <UInput v-model="state.instagramUrl" icon="i-lucide-instagram" placeholder="https://instagram.com/…" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="YouTube" name="youtubeUrl">
          <UInput v-model="state.youtubeUrl" icon="i-lucide-youtube" placeholder="https://youtube.com/@…" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="Facebook" name="facebookUrl">
          <UInput v-model="state.facebookUrl" icon="i-lucide-facebook" placeholder="https://facebook.com/…" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="TikTok" name="tiktokUrl">
          <UInput v-model="state.tiktokUrl" icon="i-lucide-music-2" placeholder="https://tiktok.com/@…" :ui="ui" size="lg" />
        </UFormField>
      </div>
    </AdminFormSection>

    <AdminFormSection
      title="Alamat & Lokasi"
      description="Alamat lengkap dan koordinat geografis untuk perhitungan waktu sholat otomatis."
    >
      <UFormField label="Alamat" name="addressLine" class="mb-3.5">
        <UInput v-model="state.addressLine" :ui="ui" size="lg" />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        <UFormField label="Kota / Kabupaten" name="city">
          <UInput v-model="state.city" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="Provinsi" name="province">
          <UInput v-model="state.province" :ui="ui" size="lg" />
        </UFormField>
        <UFormField label="Kode Pos" name="postalCode">
          <UInput v-model="state.postalCode" :ui="ui" size="lg" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-2">
        <UFormField label="Lintang (latitude)" name="latitude">
          <UInputNumber
            v-model="state.latitude"
            :min="-90"
            :max="90"
            :step="0.0001"
            :format-options="coordFormat"
            :ui="ui"
            size="lg"
          />
        </UFormField>
        <UFormField label="Bujur (longitude)" name="longitude">
          <UInputNumber
            v-model="state.longitude"
            :min="-180"
            :max="180"
            :step="0.0001"
            :format-options="coordFormat"
            :ui="ui"
            size="lg"
          />
        </UFormField>
        <UFormField label="Zona Waktu" name="timezone">
          <USelect
            v-model="state.timezone"
            :items="timezoneItems"
            :ui="{ base: 'w-full' }"
            class="w-full"
            size="lg"
          />
        </UFormField>
      </div>

      <AdminSettingsMapStub
        :title="mapTitle"
        :latitude="state.latitude"
        :longitude="state.longitude"
        :timezone="state.timezone"
      />
    </AdminFormSection>
  </div>
</template>
