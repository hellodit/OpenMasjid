<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { dutySchema } from '#shared/schemas/duties'
import {
  DUTY_ROLES,
  DUTY_ROLES_BY_SERVICE,
  DUTY_ROLE_LABELS,
  DUTY_SERVICES,
  DUTY_SERVICE_LABELS,
  DUTY_SERVICE_ORDER,
  type DutyRole,
  type DutyService,
} from '#shared/utils/duties'
import type { DutyRow } from './DaySection.vue'

export interface DutyPreset {
  date: string
  service?: DutyService
  role?: DutyRole
}

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ duty?: DutyRow | null, preset?: DutyPreset | null }>()
const emit = defineEmits<{ saved: [] }>()

const api = useApiBase()
const toast = useToast()

interface FormState {
  date: string
  service: DutyService | undefined
  role: DutyRole | undefined
  personName: string
  phone: string
  topic: string
  notes: string
}

const state = reactive<FormState>({
  date: '',
  service: undefined,
  role: undefined,
  personName: '',
  phone: '',
  topic: '',
  notes: '',
})
const saving = ref(false)
const formError = ref<string | null>(null)
const isEdit = computed(() => !!props.duty)

watch(open, (v) => {
  if (!v) return
  formError.value = null
  const d = props.duty
  if (d) {
    Object.assign(state, {
      date: d.date,
      service: d.service,
      role: d.role,
      personName: d.personName,
      phone: d.phone ?? '',
      topic: d.topic ?? '',
      notes: d.notes ?? '',
    })
    return
  }
  const p = props.preset
  const service = p?.service
  Object.assign(state, {
    date: p?.date ?? '',
    service,
    role: p?.role ?? (service ? DUTY_ROLES_BY_SERVICE[service][0] : undefined),
    personName: '',
    phone: '',
    topic: '',
    notes: '',
  })
}, { immediate: true })

const serviceItems = [...DUTY_SERVICES]
  .sort((a, b) => DUTY_SERVICE_ORDER[a] - DUTY_SERVICE_ORDER[b])
  .map(s => ({ label: DUTY_SERVICE_LABELS[s], value: s }))

/** Suggested roles for the service first, then the rest. */
const roleItems = computed(() => {
  const suggested = state.service ? DUTY_ROLES_BY_SERVICE[state.service] : []
  const rest = DUTY_ROLES.filter(r => !suggested.includes(r))
  const toItem = (r: DutyRole) => ({ label: DUTY_ROLE_LABELS[r], value: r })
  if (!suggested.length) return rest.map(toItem)
  return [
    { type: 'label' as const, label: 'Disarankan' },
    ...suggested.map(toItem),
    { type: 'separator' as const },
    ...rest.map(toItem),
  ]
})

// When the service changes on a new entry, pick its first suggested role if the current one is not suggested.
watch(() => state.service, (s) => {
  if (!s || isEdit.value) return
  if (!state.role || !DUTY_ROLES_BY_SERVICE[s].includes(state.role)) state.role = DUTY_ROLES_BY_SERVICE[s][0]
})

const showTopic = computed(() => state.role === 'khatib' || state.role === 'preacher')
const topicLabel = computed(() => (state.role === 'khatib' ? 'Tema khutbah' : 'Tema/judul ceramah'))

const dayLabel = computed(() => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(state.date)) return ''
  const p = dateParts(state.date)
  return `${p.day === 'Jumat' ? "Jum'at" : p.day}, ${formatDate(state.date)}`
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof dutySchema>>) {
  saving.value = true
  formError.value = null
  const body = { ...event.data, topic: showTopic.value ? event.data.topic : null }
  try {
    if (props.duty) {
      await $fetch(`${api}/admin/duties/${props.duty.id}`, { method: 'PUT', body })
      toast.add({ color: 'success', title: 'Petugas diperbarui' })
    }
    else {
      await $fetch(`${api}/admin/duties`, { method: 'POST', body })
      toast.add({ color: 'success', title: 'Petugas ditambahkan', description: `${DUTY_ROLE_LABELS[body.role]} ${DUTY_SERVICE_LABELS[body.service]} — ${body.personName}` })
    }
    open.value = false
    emit('saved')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, statusCode?: number }
    formError.value = e.data?.statusMessage ?? 'Gagal menyimpan petugas. Coba lagi.'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Ubah Petugas' : 'Tambah Petugas'"
    description="Atur siapa yang bertugas sebagai imam, khatib, muadzin, atau bilal."
  >
    <template #body>
      <UForm id="duty-form" :schema="dutySchema" :state="state" class="space-y-4" @submit="onSubmit">
        <UAlert
          v-if="formError"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :title="formError"
          data-testid="duty-form-error"
        />

        <UFormField label="Tanggal" name="date" required :help="dayLabel || undefined">
          <UInput v-model="state.date" type="date" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField label="Layanan" name="service" required>
            <USelect v-model="state.service" :items="serviceItems" placeholder="Pilih sholat/kegiatan" class="w-full" />
          </UFormField>
          <UFormField label="Tugas" name="role" required>
            <USelect v-model="state.role" :items="roleItems" placeholder="Pilih tugas" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Nama petugas" name="personName" required>
          <UInput v-model="state.personName" placeholder="mis. Ust. Ahmad Fauzi" :maxlength="120" class="w-full" />
        </UFormField>

        <UFormField label="No. HP" name="phone" hint="Opsional" help="Hanya terlihat oleh pengurus.">
          <UInput v-model="state.phone" type="tel" inputmode="tel" placeholder="08xx-xxxx-xxxx" :maxlength="40" class="w-full" />
        </UFormField>

        <UFormField v-if="showTopic" :label="topicLabel" name="topic" hint="Opsional">
          <UInput v-model="state.topic" placeholder="mis. Menjaga amanah di era digital" :maxlength="200" class="w-full" />
        </UFormField>

        <UFormField label="Catatan" name="notes" hint="Opsional">
          <UTextarea v-model="state.notes" :rows="2" :maxlength="500" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="outline" label="Batal" @click="open = false" />
        <UButton type="submit" form="duty-form" :loading="saving" :label="isEdit ? 'Simpan' : 'Tambah Petugas'" />
      </div>
    </template>
  </UModal>
</template>
