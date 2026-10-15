<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { mosqueSettingsSchema, type MosqueSettingsInput } from '#shared/schemas/mosque'
import type { PrayerTime } from '#shared/utils/prayer'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Pengaturan — OpenMasjid CMS' })

const toast = useToast()
const { isAdmin } = useAuth()

const { data: profile, error } = await useFetch('/api/admin/settings/mosque')

type Profile = NonNullable<typeof profile.value>

/** Copy only the fields the settings schema accepts. */
function toState(p: Profile): MosqueSettingsInput {
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
    isPublicProfile: p.isPublicProfile,
    isVisibleOnTv: p.isVisibleOnTv,
    isRegistrationOpen: p.isRegistrationOpen,
    isMaintenance: p.isMaintenance,
    prayerMethod: p.prayerMethod,
    asrMadhab: p.asrMadhab,
    prayerAdjustments: { ...p.prayerAdjustments },
    iqamahOffsets: { ...p.iqamahOffsets },
  }
}

const original = ref<MosqueSettingsInput | null>(profile.value ? toState(profile.value) : null)
const state = ref<MosqueSettingsInput | null>(profile.value ? toState(profile.value) : null)

/* `null` and "" are the same for text fields. */
const snapshot = (s: MosqueSettingsInput | null) => JSON.stringify(s, (_k, v) => (v === '' ? null : v))
const dirty = computed(() => snapshot(state.value) !== snapshot(original.value))

function reset() {
  if (original.value) state.value = structuredClone(toRaw(original.value))
}

/* ── Save ──────────────────────────────────────────────────────────── */
const saving = ref(false)
async function onSubmit(event: FormSubmitEvent<typeof mosqueSettingsSchema>) {
  saving.value = true
  try {
    const row = await $fetch('/api/admin/settings/mosque', { method: 'PUT', body: event.data })
    const next = toState({
      ...row,
      latitude: row.latitude != null ? Number(row.latitude) : null,
      longitude: row.longitude != null ? Number(row.longitude) : null,
    } as unknown as Profile)
    original.value = next
    state.value = structuredClone(next)
    toast.add({ color: 'success', title: 'Pengaturan tersimpan', icon: 'i-lucide-check' })
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ color: 'error', title: 'Gagal menyimpan pengaturan', description: e.data?.statusMessage })
  }
  finally {
    saving.value = false
  }
}

function onError() {
  toast.add({ color: 'error', title: 'Periksa kembali isian formulir', description: 'Beberapa kolom belum valid.' })
}

/* ── Live prayer preview (debounced, client-side) ──────────────────── */
interface Preview { date: string, hijri: string, prayers: PrayerTime[] }
const preview = ref<Preview | null>(null)
const previewLoading = ref(false)

const previewInput = computed(() => {
  const s = state.value
  if (!s) return null
  return {
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    timezone: s.timezone,
    prayerMethod: s.prayerMethod,
    asrMadhab: s.asrMadhab,
    prayerAdjustments: { ...s.prayerAdjustments },
    iqamahOffsets: { ...s.iqamahOffsets },
  }
})

let previewTimer: ReturnType<typeof setTimeout> | undefined
let previewSeq = 0
async function loadPreview() {
  const settings = previewInput.value
  if (!settings) return
  const seq = ++previewSeq
  previewLoading.value = true
  try {
    const res = await $fetch('/api/admin/settings/prayer-preview', { method: 'POST', body: { settings } })
    if (seq === previewSeq) preview.value = res
  }
  catch {
    // Invalid intermediate input (e.g. while typing coordinates): keep the last good preview.
  }
  finally {
    if (seq === previewSeq) previewLoading.value = false
  }
}

onMounted(() => {
  loadPreview()
  watch(() => JSON.stringify(previewInput.value), () => {
    clearTimeout(previewTimer)
    previewTimer = setTimeout(loadPreview, 400)
  })
})
onBeforeUnmount(() => clearTimeout(previewTimer))

const place = computed(() => [state.value?.name, state.value?.city].filter(Boolean).join(' · '))
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Sistem"
      title="Pengaturan"
      description="Atur identitas masjid dan konfigurasi jadwal sholat yang ditampilkan di TV display serta halaman jamaah."
    >
      <template v-if="isAdmin && state" #actions>
        <span
          v-if="dirty"
          class="hidden md:inline-flex items-center gap-1.5 text-cms-gold-ink text-[13px] font-semibold self-center"
        >
          <Icon name="lucide:circle-dot" size="14" /> Belum disimpan
        </span>
        <AdminBtn :disabled="!dirty || saving" @click="reset">Batal</AdminBtn>
        <UButton
          type="submit"
          form="settings-form"
          icon="i-lucide-check"
          :loading="saving"
          :disabled="!dirty"
        >
          Simpan Perubahan
        </UButton>
      </template>
    </AdminPageHeader>

    <UAlert
      v-if="error || !state"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Gagal memuat pengaturan masjid"
      :description="error?.data?.statusMessage ?? error?.message"
    />

    <template v-else>
      <UAlert
        v-if="!isAdmin"
        color="info"
        variant="soft"
        icon="i-lucide-eye"
        title="Mode baca saja"
        description="Hanya admin yang dapat mengubah pengaturan masjid."
        class="mb-5"
      />

      <UForm
        id="settings-form"
        :schema="mosqueSettingsSchema"
        :state="state"
        :disabled="!isAdmin"
        class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px] items-start"
        @submit="onSubmit"
        @error="onError"
      >
        <div class="min-w-0">
          <AdminSettingsMosqueProfile v-model:state="state" />
          <AdminSettingsPrayerTimes
            v-model:state="state"
            :times="preview?.prayers"
            :loading="previewLoading"
          />
        </div>

        <aside class="lg:sticky lg:top-6">
          <AdminFormSection
            title="Pratinjau TV Display"
            description="Dihitung langsung dari pengaturan saat ini (belum disimpan)."
          >
            <AdminSettingsTVPreview
              v-if="preview"
              :prayers="preview.prayers"
              :place="place"
              :date="preview.date"
              :hijri="preview.hijri"
              :timezone="state.timezone"
              :class="previewLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'"
            />
            <USkeleton v-else class="h-[230px] w-full rounded-cms mt-1.5" />
          </AdminFormSection>

          <AdminFormSection
            title="Tampilan & Publikasi"
            description="Atur visibilitas profil masjid di kanal publik."
          >
            <AdminSettingsToggleRow
              v-model="state.isPublicProfile"
              name="isPublicProfile"
              title="Profil publik aktif"
              description="Tampilkan profil masjid di halaman publik."
            />
            <AdminSettingsToggleRow
              v-model="state.isVisibleOnTv"
              name="isVisibleOnTv"
              title="Tampilkan di TV Display"
              description="Identitas masjid pada layar utama."
            />
            <AdminSettingsToggleRow
              v-model="state.isRegistrationOpen"
              name="isRegistrationOpen"
              title="Pendaftaran kegiatan dibuka"
              description="Jamaah dapat mendaftar kegiatan secara online."
            />
            <AdminSettingsToggleRow
              v-model="state.isMaintenance"
              name="isMaintenance"
              title="Mode pemeliharaan"
              description="Sembunyikan halaman publik sementara."
            />
          </AdminFormSection>

          <AdminFormSection title="Pratinjau Identitas">
            <AdminSettingsMosquePreview
              :name="state.name"
              :arabic="state.arabicName"
              :city="state.city"
              :province="state.province"
            />
          </AdminFormSection>
        </aside>
      </UForm>
    </template>
  </div>
</template>
