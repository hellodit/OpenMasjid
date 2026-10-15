<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { PersistedEventStatus } from '#shared/utils/events'
import { eventToFormState } from '~/components/admin/form/EventForm.vue'
import { dateParts, formatDate, formatTimeRange, initials, timeAgo } from '~/utils/format'
const api = useApiBase()
const tp = useTenantPath()

definePageMeta({ layout: 'admin' })

const route = useRoute()
const toast = useToast()
const { isAdmin } = useAuth()
const id = computed(() => String(route.params.id))

const { data: ev, error, refresh } = await useFetch(() => `${api}/admin/events/${id.value}`)
if (error.value?.statusCode === 404 || error.value?.statusCode === 400)
  throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan', fatal: true })

const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)

useHead({ title: () => `${ev.value?.title ?? 'Kegiatan'} — OpenMasjid CMS` })

const dateLabel = computed(() => {
  if (!ev.value) return ''
  const start = `${dateParts(ev.value.startDate).day}, ${formatDate(ev.value.startDate)}`
  return ev.value.endDate && ev.value.endDate !== ev.value.startDate
    ? `${start} — ${formatDate(ev.value.endDate)}`
    : start
})
const capacityLabel = computed(() => {
  if (!ev.value) return ''
  return ev.value.capacity
    ? `${ev.value.registeredCount} dari ${ev.value.capacity} orang`
    : `${ev.value.registeredCount} pendaftar`
})
const capacitySub = computed(() => {
  if (!ev.value?.capacity) return 'Tanpa batas kapasitas'
  return `${Math.round((ev.value.registeredCount / ev.value.capacity) * 100)}% terisi`
})

// ─── Status changes (PUT replaces the full event) ──────────────────────────
const busy = ref(false)

async function setStatus(status: PersistedEventStatus) {
  if (!ev.value) return
  busy.value = true
  try {
    await $fetch(`${api}/admin/events/${id.value}`, {
      method: 'PUT',
      body: { ...eventToFormState(ev.value), status },
    })
    toast.add({
      color: 'success',
      title: { published: 'Kegiatan ditayangkan', draft: 'Kegiatan dijadikan draf', archived: 'Kegiatan diarsipkan' }[status],
    })
    await refresh()
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ color: 'error', title: 'Gagal mengubah status', description: err.data?.statusMessage })
  }
  finally {
    busy.value = false
  }
}

const statusItems = computed<DropdownMenuItem[]>(() => {
  const s = ev.value?.status
  return [
    s !== 'published' && { label: 'Tayangkan', icon: 'i-lucide-send', onSelect: () => setStatus('published') },
    s !== 'draft' && { label: 'Jadikan Draf', icon: 'i-lucide-file-pen', onSelect: () => setStatus('draft') },
    s !== 'archived' && { label: 'Arsipkan', icon: 'i-lucide-archive', onSelect: () => setStatus('archived') },
  ].filter(Boolean) as DropdownMenuItem[]
})

// ─── Delete ────────────────────────────────────────────────────────────────
const deleteOpen = ref(false)
const deleting = ref(false)

async function remove() {
  deleting.value = true
  try {
    await $fetch(`${api}/admin/events/${id.value}`, { method: 'DELETE' })
    toast.add({ color: 'success', title: 'Kegiatan dihapus' })
    deleteOpen.value = false
    await navigateTo(tp('/admin/events'))
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ color: 'error', title: 'Gagal menghapus kegiatan', description: err.data?.statusMessage })
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-2 flex-wrap mb-[18px]">
      <UButton :to="tp('/admin/events')" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="font-semibold">
        Kembali ke Daftar
      </UButton>
      <div v-if="ev && isAdmin" class="flex gap-2">
        <UButton :to="{ path: tp('/admin/check-in'), query: { eventId: id } }" color="primary" variant="soft" icon="i-lucide-scan-line" class="font-semibold">
          Check-in
        </UButton>
        <UDropdownMenu :items="statusItems" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-toggle-right" trailing-icon="i-lucide-chevron-down" :loading="busy" class="font-semibold">
            Status
          </UButton>
        </UDropdownMenu>
        <UButton :to="tp(`/admin/events/${id}/edit`)" color="neutral" variant="outline" icon="i-lucide-pencil" class="font-semibold">
          Edit
        </UButton>
        <UButton color="error" variant="outline" icon="i-lucide-trash-2" class="font-semibold" @click="deleteOpen = true">
          Hapus
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="error || !ev"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Kegiatan tidak dapat dimuat"
      :description="errorMessage"
    />

    <template v-else>
      <AdminDetailHero :ev="ev" />

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[18px] items-start">
        <div>
          <AdminDetailInfoBox title="Tentang Kegiatan">
            <p v-if="ev.description" class="text-[15px] leading-[1.65] text-cms-ink-2 m-0 whitespace-pre-line">{{ ev.description }}</p>
            <p v-else class="text-[14px] text-cms-muted m-0">Belum ada deskripsi.</p>

            <div v-if="ev.tags.length" class="flex flex-wrap gap-1.5 mt-3">
              <UBadge v-for="t in ev.tags" :key="t" color="primary" variant="soft" size="sm" class="rounded-full">
                #{{ t }}
              </UBadge>
            </div>

            <AdminMotifDivider class="mt-4">Detail</AdminMotifDivider>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <AdminDetailInfoCell
                icon="lucide:calendar"
                label="Tanggal"
                :value="dateLabel"
                :sub="ev.startTime ? formatTimeRange(ev.startTime, ev.endTime) : 'Waktu belum ditentukan'"
              />
              <AdminDetailInfoCell
                icon="lucide:map-pin"
                label="Lokasi"
                :value="[ev.locationName, ev.locationDetail].filter(Boolean).join(', ') || '—'"
                :sub="ev.addressFull"
              />
              <AdminDetailInfoCell
                icon="lucide:users"
                label="Kapasitas"
                :value="capacityLabel"
                :sub="capacitySub"
              />
              <AdminDetailInfoCell
                icon="lucide:clipboard-check"
                label="Pendaftaran"
                :value="ev.requiresRegistration ? 'Wajib mendaftar' : 'Tanpa pendaftaran'"
                :sub="`${ev.attendedCount} orang sudah hadir`"
              />
              <AdminDetailInfoCell
                v-if="ev.isLivestream"
                icon="lucide:radio"
                label="Live Streaming"
                value=""
              >
                <a v-if="ev.livestreamUrl" :href="ev.livestreamUrl" target="_blank" rel="noopener" class="text-cms-green-700 hover:underline break-all">
                  {{ ev.livestreamUrl }}
                </a>
              </AdminDetailInfoCell>
            </div>
          </AdminDetailInfoBox>

          <AdminDetailInfoBox v-if="ev.agenda.length" title="Susunan Acara">
            <AdminDetailScheduleList :items="ev.agenda" />
          </AdminDetailInfoBox>

          <AdminDetailInfoBox v-if="ev.speakers.length" title="Pembicara">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="s in ev.speakers" :key="s.id" class="flex items-center gap-3 p-3 border border-cms-border rounded-cms bg-cms-surface-2">
                <div class="w-10 h-10 rounded-full bg-cms-gold text-cms-green-900 grid place-items-center font-bold font-serif shrink-0">
                  {{ initials(s.name, 1) }}
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-sm">{{ s.name }}</div>
                  <div v-if="s.role" class="text-[12px] text-cms-muted">{{ s.role }}</div>
                </div>
              </div>
            </div>
          </AdminDetailInfoBox>
        </div>

        <div>
          <AdminDetailCapacitySideCard
            :registered="ev.registeredCount"
            :attended="ev.attendedCount"
            :capacity="ev.capacity"
          />

          <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
            <h4 class="font-serif text-[16px] m-0 mb-3 font-semibold flex items-center justify-between">
              Pendaftar Terbaru
              <NuxtLink
                :to="{ path: tp('/admin/registrants'), query: { eventId: ev.id } }"
                class="text-[13px] font-sans text-cms-green-700 font-semibold hover:underline"
              >
                Lihat semua
              </NuxtLink>
            </h4>
            <AdminDetailAttendeesList :items="ev.recentRegistrants" />
          </div>

          <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px] text-[12.5px] text-cms-muted flex flex-col gap-1.5">
            <div>Dibuat {{ timeAgo(ev.createdAt) }}<template v-if="ev.creator"> oleh <strong class="text-cms-ink-2">{{ ev.creator.fullName }}</strong></template></div>
            <div>Diperbarui {{ timeAgo(ev.updatedAt) }}<template v-if="ev.updater"> oleh <strong class="text-cms-ink-2">{{ ev.updater.fullName }}</strong></template></div>
            <div v-if="ev.publishedAt">Ditayangkan {{ formatDate(String(ev.publishedAt)) }}</div>
          </div>
        </div>
      </div>
    </template>

    <UModal
      v-model:open="deleteOpen"
      title="Hapus kegiatan?"
      :description="ev ? `“${ev.title}” akan dihapus beserta jadwal dan pembicaranya. Tindakan ini tidak dapat dibatalkan.` : ''"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="deleteOpen = false">Batal</UButton>
          <UButton color="error" icon="i-lucide-trash-2" :loading="deleting" @click="remove">Hapus Kegiatan</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
