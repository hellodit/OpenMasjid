<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { formatDate, initials, timeAgo } from '~/utils/format'
const api = useApiBase()

definePageMeta({ layout: 'admin' })
useHead({ title: 'Pengurus — OpenMasjid CMS' })

const toast = useToast()

const { data, error, refresh } = await useFetch(`${api}/admin/team`)

type Member = NonNullable<typeof data.value>['members'][number]
type Invitation = NonNullable<typeof data.value>['invitations'][number]

const members = computed(() => data.value?.members ?? [])
const invitations = computed(() => data.value?.invitations ?? [])
const activeCount = computed(() => members.value.filter((m) => m.isActive).length)

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', viewer: 'Viewer' }

function errorMessage(err: unknown) {
  return (err as { data?: { statusMessage?: string } }).data?.statusMessage
}

/* ── Member updates ─────────────────────────────────────────────────── */
const busyId = ref<string | null>(null)

async function updateMember(m: Member, body: { role?: 'admin' | 'viewer', isActive?: boolean }, success: string) {
  busyId.value = m.id
  try {
    await $fetch(`${api}/admin/team/${m.id}`, { method: 'PUT', body })
    toast.add({ color: 'success', title: success, icon: 'i-lucide-check' })
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal memperbarui pengurus', description: errorMessage(err) })
  }
  finally {
    busyId.value = null
  }
}

const deactivateTarget = ref<Member | null>(null)
const deactivateOpen = computed({
  get: () => !!deactivateTarget.value,
  set: (v: boolean) => { if (!v) deactivateTarget.value = null },
})
async function confirmDeactivate() {
  const m = deactivateTarget.value
  if (!m) return
  await updateMember(m, { isActive: false }, `${m.fullName} dinonaktifkan`)
  deactivateTarget.value = null
}

function memberActions(m: Member): DropdownMenuItem[][] {
  const other = m.role === 'admin' ? 'viewer' : 'admin'
  return [
    [{
      label: other === 'admin' ? 'Jadikan Admin' : 'Jadikan Viewer',
      icon: other === 'admin' ? 'i-lucide-shield-check' : 'i-lucide-eye',
      onSelect: () => updateMember(m, { role: other }, `Peran ${m.fullName} diubah menjadi ${ROLE_LABEL[other]}`),
    }],
    [m.isActive
      ? { label: 'Nonaktifkan', icon: 'i-lucide-user-x', color: 'error', onSelect: () => { deactivateTarget.value = m } }
      : { label: 'Aktifkan', icon: 'i-lucide-user-check', onSelect: () => updateMember(m, { isActive: true }, `${m.fullName} diaktifkan kembali`) }],
  ]
}

/* ── Invitations ────────────────────────────────────────────────────── */
const inviteOpen = ref(false)

const revokeTarget = ref<Invitation | null>(null)
const revokeOpen = computed({
  get: () => !!revokeTarget.value,
  set: (v: boolean) => { if (!v) revokeTarget.value = null },
})
const revoking = ref(false)
async function confirmRevoke() {
  const inv = revokeTarget.value
  if (!inv) return
  revoking.value = true
  try {
    await $fetch(`${api}/admin/team/invitations/${inv.id}`, { method: 'DELETE' })
    toast.add({ color: 'success', title: 'Undangan dibatalkan', icon: 'i-lucide-check' })
    revokeTarget.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal membatalkan undangan', description: errorMessage(err) })
  }
  finally {
    revoking.value = false
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Sistem"
      title="Pengurus"
      description="Kelola siapa saja yang dapat membuka CMS masjid ini. Admin dapat mengubah data, viewer hanya dapat melihat."
    >
      <template #actions>
        <UButton icon="i-lucide-user-plus" label="Undang Pengurus" @click="inviteOpen = true" />
      </template>
    </AdminPageHeader>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      title="Gagal memuat data pengurus"
      :description="error.statusMessage || error.message"
      class="mb-6"
    />

    <template v-else>
      <AdminPanel title="Daftar pengurus" :subtitle="`${members.length} pengurus · ${activeCount} aktif`" class="mb-6">
        <ul class="divide-y divide-cms-border -my-2">
          <li v-for="m in members" :key="m.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
            <div
              :class="['w-10 h-10 rounded-full grid place-items-center font-semibold text-[13px] shrink-0',
                       m.isActive ? 'bg-cms-green-700 text-white' : 'bg-cms-surface-2 text-cms-muted']"
            >
              {{ initials(m.fullName) }}
            </div>

            <div class="min-w-0 flex-1 basis-[200px]">
              <div class="flex flex-wrap items-center gap-1.5">
                <span :class="['font-semibold truncate', m.isActive ? 'text-cms-ink' : 'text-cms-muted']">{{ m.fullName }}</span>
                <UBadge v-if="m.isOwner" color="secondary" variant="subtle" size="sm" icon="i-lucide-crown" label="Pemilik" />
              </div>
              <div class="text-[13px] text-cms-muted truncate">{{ m.email }}</div>
            </div>

            <div class="flex items-center gap-1.5">
              <UBadge
                :color="m.role === 'admin' ? 'primary' : 'neutral'"
                variant="subtle"
                :icon="m.role === 'admin' ? 'i-lucide-shield-check' : 'i-lucide-eye'"
                :label="ROLE_LABEL[m.role] ?? m.role"
              />
              <UBadge
                :color="m.isActive ? 'success' : 'error'"
                variant="outline"
                :label="m.isActive ? 'Aktif' : 'Nonaktif'"
              />
            </div>

            <div class="text-[12.5px] text-cms-muted w-[150px] max-sm:w-auto">
              <span class="block">Login terakhir</span>
              <span class="text-cms-ink">{{ m.lastLoginAt ? timeAgo(m.lastLoginAt) : 'Belum pernah' }}</span>
            </div>

            <div class="w-9 flex justify-end">
              <UDropdownMenu v-if="!m.isOwner" :items="memberActions(m)" :content="{ align: 'end' }">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-ellipsis-vertical"
                  :loading="busyId === m.id"
                  :aria-label="`Aksi untuk ${m.fullName}`"
                />
              </UDropdownMenu>
            </div>
          </li>
        </ul>
      </AdminPanel>

      <AdminPanel title="Undangan tertunda" subtitle="Undangan yang belum diterima dan belum kedaluwarsa.">
        <p v-if="!invitations.length" class="text-sm text-cms-muted m-0">
          Tidak ada undangan tertunda.
        </p>
        <ul v-else class="divide-y divide-cms-border -my-2">
          <li v-for="inv in invitations" :key="inv.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
            <div class="w-10 h-10 rounded-full grid place-items-center bg-cms-gold-soft text-cms-gold-ink shrink-0">
              <UIcon name="i-lucide-mail" class="size-4" />
            </div>
            <div class="min-w-0 flex-1 basis-[200px]">
              <div class="font-semibold text-cms-ink truncate">{{ inv.email }}</div>
              <div class="text-[12.5px] text-cms-muted">
                Diundang {{ timeAgo(inv.createdAt) }} · berlaku sampai {{ formatDate(String(inv.expiresAt)) }}
              </div>
            </div>
            <UBadge
              :color="inv.role === 'admin' ? 'primary' : 'neutral'"
              variant="subtle"
              :label="ROLE_LABEL[inv.role] ?? inv.role"
            />
            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-x"
              label="Batalkan"
              @click="revokeTarget = inv"
            />
          </li>
        </ul>
      </AdminPanel>
    </template>

    <AdminTeamInviteModal v-model:open="inviteOpen" @invited="refresh()" />

    <UModal
      v-model:open="deactivateOpen"
      title="Nonaktifkan pengurus?"
      :description="`${deactivateTarget?.fullName ?? ''} akan langsung dikeluarkan dari semua perangkat dan tidak dapat masuk ke CMS sampai diaktifkan kembali.`"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Batal" @click="deactivateTarget = null" />
          <UButton
            color="error"
            icon="i-lucide-user-x"
            label="Nonaktifkan"
            :loading="!!deactivateTarget && busyId === deactivateTarget.id"
            @click="confirmDeactivate"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="revokeOpen"
      title="Batalkan undangan?"
      :description="`Tautan undangan untuk ${revokeTarget?.email ?? ''} tidak akan bisa dipakai lagi.`"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Kembali" @click="revokeTarget = null" />
          <UButton color="error" icon="i-lucide-x" label="Batalkan Undangan" :loading="revoking" @click="confirmRevoke" />
        </div>
      </template>
    </UModal>
  </div>
</template>
