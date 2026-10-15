<script lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { eventCreateSchema, type EventInput, type EventOutput } from '#shared/schemas/events'
import { bannerClass, todayIso } from '~/utils/format'

/** Minimal event shape returned by GET /api/admin/events/:id. */
export interface EventFormSource {
  categoryId: string
  title: string
  arabicTitle: string | null
  description: string | null
  tags: string[]
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  locationName: string | null
  locationDetail: string | null
  addressFull: string | null
  capacity: number | null
  bannerUrl: string | null
  livestreamUrl: string | null
  isLivestream: boolean
  isPinned: boolean
  requiresRegistration: boolean
  status: string
  speakers: { name: string, role: string | null }[]
  agenda: { startTime: string | null, endTime: string | null, title: string, person: string | null }[]
}

/** Form state: text inputs are always strings (the schema maps '' → null). */
export interface EventFormState {
  categoryId: string
  title: string
  arabicTitle: string
  description: string
  tags: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  locationName: string
  locationDetail: string
  addressFull: string
  capacity: number | null
  bannerUrl: string
  livestreamUrl: string
  isLivestream: boolean
  isPinned: boolean
  requiresRegistration: boolean
  status: NonNullable<EventInput['status']>
  speakers: { name: string, role: string }[]
  agenda: { startTime: string, endTime: string, title: string, person: string }[]
}

const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : '')

/** Convert an API event into a full create/update payload (`HH:MM:SS` → `HH:MM`). */
export function eventToFormState(ev: EventFormSource): EventFormState {
  return {
    categoryId: ev.categoryId,
    title: ev.title,
    arabicTitle: ev.arabicTitle ?? '',
    description: ev.description ?? '',
    tags: [...ev.tags],
    startDate: ev.startDate,
    endDate: ev.endDate ?? '',
    startTime: hhmm(ev.startTime),
    endTime: hhmm(ev.endTime),
    locationName: ev.locationName ?? '',
    locationDetail: ev.locationDetail ?? '',
    addressFull: ev.addressFull ?? '',
    capacity: ev.capacity,
    bannerUrl: ev.bannerUrl ?? '',
    livestreamUrl: ev.livestreamUrl ?? '',
    isLivestream: ev.isLivestream,
    isPinned: ev.isPinned,
    requiresRegistration: ev.requiresRegistration,
    status: ev.status as EventFormState['status'],
    speakers: ev.speakers.map(s => ({ name: s.name, role: s.role ?? '' })),
    agenda: ev.agenda.map(a => ({
      startTime: hhmm(a.startTime),
      endTime: hhmm(a.endTime),
      title: a.title,
      person: a.person ?? '',
    })),
  }
}

export function emptyEventState(): EventFormState {
  return {
    categoryId: '',
    title: '',
    arabicTitle: '',
    description: '',
    tags: [],
    startDate: todayIso(),
    endDate: '',
    startTime: '',
    endTime: '',
    locationName: '',
    locationDetail: '',
    addressFull: '',
    capacity: null,
    bannerUrl: '',
    livestreamUrl: '',
    isLivestream: false,
    isPinned: false,
    requiresRegistration: true,
    status: 'draft',
    speakers: [],
    agenda: [],
  }
}
</script>

<script setup lang="ts">
const api = useApiBase()
const tp = useTenantPath()
const props = defineProps<{
  /** Existing event id → PUT; omitted → POST. */
  eventId?: string
  initial?: EventFormState
}>()

const toast = useToast()
const state = reactive<EventFormState>(props.initial ? structuredClone(toRaw(props.initial)) : emptyEventState())
const saving = ref(false)

const { data: categories } = await useFetch(`${api}/admin/categories`, { key: 'admin-event-categories', default: () => [] })
const pickable = computed(() => (categories.value ?? []).filter(c => c.isActive || c.id === state.categoryId))

const steps = [
  { id: 'informasi', t: 'Informasi Dasar', d: 'Judul, kategori, deskripsi' },
  { id: 'jadwal', t: 'Jadwal & Lokasi', d: 'Waktu, tempat, kapasitas' },
  { id: 'pembicara', t: 'Pembicara', d: 'Ustadz / narasumber' },
  { id: 'agenda', t: 'Susunan Acara', d: 'Urutan kegiatan' },
  { id: 'banner', t: 'Banner', d: 'Poster kegiatan' },
  { id: 'pengaturan', t: 'Pengaturan', d: 'Pendaftaran & publikasi' },
]

const statusItems = computed(() => [
  { label: 'Draf', value: 'draft', description: 'Tersimpan, belum tampil di portal jamaah.' },
  { label: 'Tayang', value: 'published', description: 'Langsung tampil di portal jamaah.' },
  ...(props.initial?.status === 'archived'
    ? [{ label: 'Arsip', value: 'archived', description: 'Disembunyikan dari portal jamaah.' }]
    : []),
])

const fieldUi = { label: 'text-[12.5px] font-semibold text-cms-ink-2', hint: 'text-[11.5px] text-cms-muted' }

const capacityModel = computed({
  get: () => state.capacity ?? null,
  set: (v: number | null | undefined) => {
    state.capacity = typeof v === 'number' && !Number.isNaN(v) ? v : null
  },
})

const bannerPreview = computed(() => /^https?:\/\/\S+$/i.test(state.bannerUrl ?? '') ? state.bannerUrl! : null)
const bannerBroken = ref(false)
watch(() => state.bannerUrl, () => { bannerBroken.value = false })

const addSpeaker = () => state.speakers.push({ name: '', role: '' })
const addAgenda = () => state.agenda.push({ startTime: '', endTime: '', title: '', person: '' })

async function onSubmit(event: FormSubmitEvent<EventOutput>) {
  saving.value = true
  try {
    const { id } = props.eventId
      ? await $fetch(`${api}/admin/events/${props.eventId}`, { method: 'PUT', body: event.data })
      : await $fetch(`${api}/admin/events`, { method: 'POST', body: event.data })
    toast.add({
      color: 'success',
      title: props.eventId ? 'Perubahan disimpan' : 'Kegiatan dibuat',
      description: event.data.title,
    })
    await navigateTo(tp(`/admin/events/${id}`))
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ color: 'error', title: 'Gagal menyimpan kegiatan', description: err.data?.statusMessage ?? err.message })
  }
  finally {
    saving.value = false
  }
}

function onError(event: FormErrorEvent) {
  toast.add({
    color: 'error',
    title: 'Periksa kembali isian formulir',
    description: event.errors[0]?.message,
  })
  const id = event.errors[0]?.id
  if (id) document.getElementById(id)?.focus()
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
    <AdminFormStepGuide :steps="steps" class="hidden lg:block" />

    <UForm
      :schema="eventCreateSchema"
      :state="state"
      class="min-w-0"
      @submit="onSubmit"
      @error="onError"
    >
      <!-- Section 1: Basic -->
      <AdminFormSection
        id="informasi"
        class="scroll-mt-4"
        title="Informasi Dasar"
        description="Tampilkan kegiatan secara jelas. Judul yang baik singkat namun deskriptif."
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <UFormField label="Judul Kegiatan" name="title" required :ui="fieldUi">
            <UInput v-model="state.title" placeholder="Kajian Tafsir Surah Yasin" class="w-full" />
          </UFormField>
          <UFormField label="Judul Arab" name="arabicTitle" hint="Opsional" :ui="fieldUi">
            <UInput v-model="state.arabicTitle" dir="rtl" placeholder="تفسير سورة يس" class="w-full" :ui="{ base: 'font-arab text-[16px]' }" />
          </UFormField>
        </div>

        <UFormField label="Kategori" name="categoryId" required class="mb-3.5" :ui="fieldUi">
          <AdminFormCategoryPicker v-model="state.categoryId" :categories="pickable" />
          <div v-if="!pickable.length" class="text-[12.5px] text-cms-muted">
            Belum ada kategori aktif. <NuxtLink :to="tp('/admin/categories')" class="text-cms-green-700 underline">Tambah kategori</NuxtLink>
          </div>
        </UFormField>

        <UFormField label="Deskripsi" name="description" class="mb-3.5" :ui="fieldUi">
          <UTextarea v-model="state.description" :rows="5" autoresize placeholder="Ceritakan tema, sasaran jamaah, dan hal yang perlu dipersiapkan…" class="w-full" />
        </UFormField>

        <UFormField label="Tag" name="tags" hint="Tekan Enter untuk menambah" :ui="fieldUi">
          <UInputTags v-model="state.tags" placeholder="Tambah tag…" :max="20" class="w-full" />
        </UFormField>
      </AdminFormSection>

      <!-- Section 2: Schedule & location -->
      <AdminFormSection
        id="jadwal"
        class="scroll-mt-4"
        title="Jadwal & Lokasi"
        description="Tentukan kapan dan di mana kegiatan akan diselenggarakan."
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <UFormField label="Tanggal Mulai" name="startDate" required :ui="fieldUi">
            <UInput v-model="state.startDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Tanggal Selesai" name="endDate" hint="Kosongkan jika satu hari" :ui="fieldUi">
            <UInput v-model="state.endDate" type="date" :min="state.startDate" class="w-full" />
          </UFormField>
          <UFormField label="Waktu Mulai" name="startTime" :ui="fieldUi">
            <UInput v-model="state.startTime" type="time" class="w-full" />
          </UFormField>
          <UFormField label="Waktu Selesai" name="endTime" :ui="fieldUi">
            <UInput v-model="state.endTime" type="time" class="w-full" />
          </UFormField>
        </div>

        <AdminMotifDivider>Lokasi</AdminMotifDivider>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <UFormField label="Tempat" name="locationName" :ui="fieldUi">
            <UInput v-model="state.locationName" placeholder="Ruang Utama Masjid" class="w-full" />
          </UFormField>
          <UFormField label="Detail Lokasi" name="locationDetail" :ui="fieldUi">
            <UInput v-model="state.locationDetail" placeholder="Lt. 1, Mihrab Selatan" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Alamat Lengkap" name="addressFull" class="mb-3.5" :ui="fieldUi">
          <UInput v-model="state.addressFull" placeholder="Jl. …" class="w-full" />
        </UFormField>

        <UFormField label="Kapasitas Maksimum" name="capacity" hint="Kosongkan jika tanpa batas" class="md:w-1/2" :ui="fieldUi">
          <UInputNumber v-model="capacityModel" :min="1" :max="100000" placeholder="Tanpa batas" class="w-full" />
        </UFormField>
      </AdminFormSection>

      <!-- Section 3: Speakers -->
      <AdminFormSection
        id="pembicara"
        class="scroll-mt-4"
        title="Pembicara / Narasumber"
        description="Nama dan jabatan ustadz atau narasumber (maksimal 10)."
      >
        <template #aside>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-plus"
            :disabled="state.speakers.length >= 10"
            @click="addSpeaker"
          >
            Tambah
          </UButton>
        </template>

        <div v-if="!state.speakers.length" class="text-[13px] text-cms-muted">Belum ada pembicara.</div>
        <div
          v-for="(s, i) in state.speakers"
          :key="i"
          class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2.5 items-start py-2.5"
          :class="i > 0 ? 'border-t border-dashed border-cms-border' : ''"
        >
          <UFormField :name="`speakers.${i}.name`" :ui="fieldUi">
            <UInput v-model="s.name" placeholder="Nama pembicara" class="w-full" />
          </UFormField>
          <UFormField :name="`speakers.${i}.role`" :ui="fieldUi">
            <UInput v-model="s.role" placeholder="Jabatan / asal" class="w-full" />
          </UFormField>
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            square
            aria-label="Hapus pembicara"
            @click="state.speakers.splice(i, 1)"
          />
        </div>
      </AdminFormSection>

      <!-- Section 4: Agenda -->
      <AdminFormSection
        id="agenda"
        class="scroll-mt-4"
        title="Susunan Acara"
        description="Urutan kegiatan beserta waktu dan pengisinya (opsional)."
      >
        <template #aside>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-plus"
            :disabled="state.agenda.length >= 30"
            @click="addAgenda"
          >
            Tambah
          </UButton>
        </template>

        <div v-if="!state.agenda.length" class="text-[13px] text-cms-muted">Belum ada susunan acara.</div>
        <div
          v-for="(a, i) in state.agenda"
          :key="i"
          class="grid grid-cols-2 md:grid-cols-[110px_110px_1fr_1fr_auto] gap-2.5 items-start py-2.5"
          :class="i > 0 ? 'border-t border-dashed border-cms-border' : ''"
        >
          <UFormField :name="`agenda.${i}.startTime`" :ui="fieldUi">
            <UInput v-model="a.startTime" type="time" aria-label="Mulai" class="w-full" />
          </UFormField>
          <UFormField :name="`agenda.${i}.endTime`" :ui="fieldUi">
            <UInput v-model="a.endTime" type="time" aria-label="Selesai" class="w-full" />
          </UFormField>
          <UFormField :name="`agenda.${i}.title`" :ui="fieldUi" class="col-span-2 md:col-span-1">
            <UInput v-model="a.title" placeholder="Judul sesi" class="w-full" />
          </UFormField>
          <UFormField :name="`agenda.${i}.person`" :ui="fieldUi">
            <UInput v-model="a.person" placeholder="Pengisi" class="w-full" />
          </UFormField>
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            square
            aria-label="Hapus sesi"
            @click="state.agenda.splice(i, 1)"
          />
        </div>
      </AdminFormSection>

      <!-- Section 5: Banner -->
      <AdminFormSection
        id="banner"
        class="scroll-mt-4"
        title="Banner Kegiatan"
        description="Tautan gambar banner (rekomendasi 1600×900px). Kosongkan untuk memakai motif kategori."
      >
        <UFormField label="URL Banner" name="bannerUrl" :ui="fieldUi" class="mb-3.5">
          <UInput v-model="state.bannerUrl" type="url" icon="i-lucide-image" placeholder="https://…" class="w-full" />
        </UFormField>
        <div
          :class="[
            'relative h-[180px] rounded-cms overflow-hidden border border-cms-border text-white',
            bannerClass(pickable.find(c => c.id === state.categoryId)?.slug),
          ]"
        >
          <img
            v-if="bannerPreview && !bannerBroken"
            :src="bannerPreview"
            alt="Pratinjau banner"
            class="absolute inset-0 w-full h-full object-cover"
            @error="bannerBroken = true"
          >
          <template v-else>
            <div class="cms-pattern-strip absolute inset-0 opacity-50" />
            <div class="relative z-[1] h-full grid place-items-center text-center px-6">
              <div>
                <div class="font-serif text-[20px] font-semibold">{{ state.title || 'Judul kegiatan' }}</div>
                <div class="text-[12px] opacity-80 mt-1">
                  {{ bannerBroken ? 'Gambar tidak dapat dimuat — periksa URL.' : 'Pratinjau motif kategori' }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </AdminFormSection>

      <!-- Section 6: Settings -->
      <AdminFormSection
        id="pengaturan"
        class="scroll-mt-4"
        title="Pengaturan & Publikasi"
        description="Atur pendaftaran, visibilitas, dan saluran tampilan kegiatan."
      >
        <UFormField label="Status" name="status" class="mb-3.5" :ui="fieldUi">
          <URadioGroup
            v-model="state.status"
            :items="statusItems"
            variant="card"
            orientation="horizontal"
            :ui="{ fieldset: 'flex-col md:flex-row', item: 'flex-1' }"
          />
        </UFormField>

        <div class="grid gap-3">
          <AdminFormToggleCard
            v-model="state.requiresRegistration"
            title="Memerlukan Pendaftaran"
            description="Jamaah perlu mendaftar terlebih dahulu untuk hadir."
          />
          <AdminFormToggleCard
            v-model="state.isPinned"
            title="Sematkan Kegiatan"
            description="Tampilkan di urutan teratas daftar dan portal jamaah."
          />
          <AdminFormToggleCard
            v-model="state.isLivestream"
            title="Live Streaming"
            description="Sediakan tautan siaran langsung saat kegiatan berlangsung."
          />
          <UFormField v-if="state.isLivestream" label="URL Live Streaming" name="livestreamUrl" required :ui="fieldUi">
            <UInput v-model="state.livestreamUrl" type="url" icon="i-lucide-radio" placeholder="https://youtube.com/live/…" class="w-full" />
          </UFormField>
        </div>
      </AdminFormSection>

      <!-- Action bar -->
      <div class="flex justify-between items-center gap-2 bg-cms-surface border border-cms-border rounded-cms px-4 py-3 sticky bottom-0 z-10">
        <UButton color="neutral" variant="ghost" :to="tp(eventId ? `/admin/events/${eventId}` : '/admin/events')">
          Batalkan
        </UButton>
        <UButton type="submit" icon="i-lucide-check" :loading="saving" class="font-semibold">
          {{ eventId ? 'Simpan Perubahan' : state.status === 'published' ? 'Simpan & Tayangkan' : 'Simpan sebagai Draf' }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>
