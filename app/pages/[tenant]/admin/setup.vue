<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { mosqueSetupSchema } from '#shared/schemas/mosque'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Lengkapi Profil Masjid — OpenMasjid CMS' })

const api = useApiBase()
const tp = useTenantPath()
const toast = useToast()
const { isAdmin } = useAuth()

const { data, error, refresh } = await useFetch(`${api}/admin/setup`)
const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)

function errMsg(err: unknown) {
  return (err as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Terjadi kesalahan. Coba lagi.'
}

/* ---------- Wizard state ---------- */
const steps = [
  { title: 'Lokasi masjid', description: 'Untuk jadwal sholat', icon: 'i-lucide-map-pin' },
  { title: 'Alamat & kontak', description: 'Untuk jamaah', icon: 'i-lucide-phone' },
  { title: 'Selesai', description: 'Langkah berikutnya', icon: 'i-lucide-flag' },
]
const route = useRoute()
/** `?step=2` deep-links from the dashboard checklist (1-based). */
const initialStep = Number(route.query.step)
const step = ref(Number.isInteger(initialStep) && initialStep >= 1 && initialStep <= steps.length ? initialStep - 1 : 0)

const location = reactive({
  city: null as string | null,
  province: null as string | null,
  latitude: null as number | null,
  longitude: null as number | null,
  timezone: 'Asia/Jakarta',
})

const contact = reactive({
  addressLine: '',
  postalCode: '',
  phone: '',
  whatsapp: '',
  email: '',
})

watch(() => data.value?.profile, (p) => {
  if (!p) return
  Object.assign(location, {
    city: p.city,
    province: p.province,
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone || 'Asia/Jakarta',
  })
  Object.assign(contact, {
    addressLine: p.addressLine ?? '',
    postalCode: p.postalCode ?? '',
    phone: p.phone ?? '',
    whatsapp: p.whatsapp ?? '',
    email: p.email ?? '',
  })
}, { immediate: true })

const saving = ref(false)

async function patch(body: z.input<typeof mosqueSetupSchema>) {
  return $fetch(`${api}/admin/setup`, { method: 'PATCH', body })
}

async function saveLocation() {
  if ((location.latitude == null) !== (location.longitude == null)) {
    toast.add({ color: 'error', title: 'Koordinat belum lengkap', description: 'Isi lintang dan bujur, atau kosongkan keduanya.' })
    return
  }
  saving.value = true
  try {
    await patch({ ...location })
    toast.add({ color: 'success', title: 'Lokasi masjid disimpan', icon: 'i-lucide-check-circle' })
    step.value = 1
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menyimpan lokasi', description: errMsg(err) })
  }
  finally {
    saving.value = false
  }
}

async function saveContact(event: FormSubmitEvent<z.output<typeof mosqueSetupSchema>>) {
  saving.value = true
  try {
    const { addressLine, postalCode, phone, whatsapp, email } = event.data
    await patch({ addressLine, postalCode, phone, whatsapp, email })
    toast.add({ color: 'success', title: 'Alamat & kontak disimpan', icon: 'i-lucide-check-circle' })
    await refresh()
    step.value = 2
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menyimpan kontak', description: errMsg(err) })
  }
  finally {
    saving.value = false
  }
}

async function goToStep(i: number) {
  step.value = i
  if (i === 2) await refresh()
}

const finishing = ref(false)
async function finish() {
  finishing.value = true
  try {
    await patch({ complete: true })
    await navigateTo(tp('/admin'))
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menyelesaikan pengaturan', description: errMsg(err) })
  }
  finally {
    finishing.value = false
  }
}

const tzLabel = (tz: string) => ({ 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' } as Record<string, string>)[tz] ?? tz
const summary = computed(() => {
  const p = data.value?.profile
  if (!p) return []
  const coords = p.latitude != null && p.longitude != null ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : null
  return [
    { label: 'Lokasi', value: [p.city, p.province].filter(Boolean).join(', ') || null, ok: data.value?.checklist.location },
    { label: 'Koordinat', value: coords ? `${coords} · ${tzLabel(p.timezone)}` : null, ok: data.value?.checklist.location },
    { label: 'Alamat', value: [p.addressLine, p.postalCode].filter(Boolean).join(' ') || null, ok: data.value?.checklist.address },
    { label: 'Kontak', value: [p.phone, p.whatsapp && `WA ${p.whatsapp}`, p.email].filter(Boolean).join(' · ') || null, ok: data.value?.checklist.contact },
  ]
})
</script>

<template>
  <div class="max-w-[820px] mx-auto">
    <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-1.5 flex items-center">
          Pengaturan awal
        </div>
        <h1 class="font-serif text-[26px] sm:text-[32px] font-semibold m-0 mb-1.5 tracking-[-0.4px]">
          Lengkapi profil {{ data?.profile.name ?? 'masjid' }}
        </h1>
        <p class="m-0 text-cms-muted text-sm max-w-[540px]">
          Tiga langkah singkat. Semua langkah boleh dilewati dan bisa diubah kapan saja di Pengaturan.
        </p>
      </div>
      <UButton
        v-if="isAdmin"
        color="neutral"
        variant="ghost"
        label="Lewati semua"
        trailing-icon="i-lucide-skip-forward"
        :loading="finishing"
        @click="finish"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Gagal memuat data"
      :description="errorMessage"
      class="mb-6"
    />

    <UAlert
      v-else-if="!isAdmin"
      color="info"
      variant="subtle"
      icon="i-lucide-eye"
      title="Hanya admin yang dapat mengubah profil masjid"
      description="Anda masuk sebagai pengurus dengan akses lihat saja. Minta admin DKM untuk melengkapi lokasi dan kontak masjid."
      class="mb-6"
    >
      <template #actions>
        <UButton size="sm" color="neutral" variant="outline" :to="tp('/admin')" label="Kembali ke dashboard" />
      </template>
    </UAlert>

    <template v-if="data && isAdmin">
      <UStepper
        :model-value="step"
        :items="steps"
        size="sm"
        class="mb-6"
        @update:model-value="(v) => goToStep(Number(v))"
      />

      <!-- Step 1: location -->
      <AdminPanel
        v-if="step === 0"
        title="Lokasi masjid"
        subtitle="Dibutuhkan agar jadwal sholat di halaman masjid dan Layar TV tepat."
      >
        <AdminSetupLocationPicker v-model="location" />
        <div class="flex flex-wrap items-center justify-end gap-2 mt-6 pt-4 border-t border-cms-border">
          <UButton color="neutral" variant="ghost" label="Lewati" @click="goToStep(1)" />
          <UButton
            label="Simpan & lanjut"
            trailing-icon="i-lucide-arrow-right"
            :loading="saving"
            @click="saveLocation"
          />
        </div>
      </AdminPanel>

      <!-- Step 2: address & contact -->
      <AdminPanel
        v-else-if="step === 1"
        title="Alamat & kontak"
        subtitle="Ditampilkan di halaman publik masjid agar jamaah mudah menghubungi pengurus."
      >
        <UForm :schema="mosqueSetupSchema" :state="contact" class="flex flex-col gap-4" @submit="saveContact">
          <UFormField label="Alamat" name="addressLine">
            <UTextarea
              v-model="contact.addressLine"
              :rows="2"
              autoresize
              placeholder="Jl. Merdeka No. 1, Kel. …, Kec. …"
              class="w-full"
            />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Kode pos" name="postalCode">
              <UInput v-model="contact.postalCode" inputmode="numeric" placeholder="40111" class="w-full" />
            </UFormField>
            <UFormField label="Telepon" name="phone">
              <UInput v-model="contact.phone" type="tel" icon="i-lucide-phone" placeholder="022-1234567" class="w-full" />
            </UFormField>
            <UFormField label="WhatsApp" name="whatsapp">
              <UInput v-model="contact.whatsapp" type="tel" icon="i-lucide-message-circle" placeholder="0812-3456-7890" class="w-full" />
            </UFormField>
            <UFormField label="Email masjid" name="email">
              <UInput v-model="contact.email" type="email" icon="i-lucide-mail" placeholder="dkm@masjid.id" class="w-full" />
            </UFormField>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 mt-2 pt-4 border-t border-cms-border">
            <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" label="Kembali" @click="goToStep(0)" />
            <div class="flex gap-2">
              <UButton color="neutral" variant="ghost" label="Lewati" @click="goToStep(2)" />
              <UButton type="submit" label="Simpan & lanjut" trailing-icon="i-lucide-arrow-right" :loading="saving" />
            </div>
          </div>
        </UForm>
      </AdminPanel>

      <!-- Step 3: done -->
      <div v-else class="flex flex-col gap-4">
        <AdminPanel title="Ringkasan" subtitle="Data yang sudah tersimpan. Bagian yang kosong bisa dilengkapi nanti di Pengaturan.">
          <dl class="m-0 divide-y divide-cms-border">
            <div v-for="row in summary" :key="row.label" class="flex items-start gap-3 py-2.5">
              <Icon
                :name="row.ok ? 'lucide:circle-check' : 'lucide:circle-dashed'"
                size="18"
                :class="row.ok ? 'text-cms-green-600 mt-0.5' : 'text-cms-muted-2 mt-0.5'"
              />
              <dt class="w-24 shrink-0 text-[13px] text-cms-muted">{{ row.label }}</dt>
              <dd class="m-0 text-[13.5px] min-w-0 break-words" :class="row.value ? 'text-cms-ink' : 'text-cms-muted-2 italic'">
                {{ row.value ?? 'Belum diisi' }}
              </dd>
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel title="Langkah berikutnya" subtitle="Mulai isi konten masjid Anda.">
          <AdminSetupNextSteps :checklist="data.checklist" />
        </AdminPanel>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" label="Kembali" @click="goToStep(1)" />
          <UButton
            size="lg"
            icon="i-lucide-check"
            label="Selesai & buka dashboard"
            :loading="finishing"
            @click="finish"
          />
        </div>
      </div>
    </template>
  </div>
</template>
