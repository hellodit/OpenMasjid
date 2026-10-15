<script setup lang="ts">
import { formatDate } from '~/utils/format'
export type CheckInOutcome = 'success' | 'already' | 'error'

export interface CheckInResult {
  /** Client-side id (for list keys). */
  id: number
  kind: CheckInOutcome
  at: Date
  code: string
  attendee?: { name: string, email: string }
  event?: { id: string, title: string, startDate: string }
  attendedAt?: string
  message?: string
}

const OUTCOME_LABELS: Record<CheckInOutcome, string> = {
  success: 'Kehadiran dicatat',
  already: 'Sudah check-in sebelumnya',
  error: 'Check-in gagal',
}

const props = defineProps<{ result: CheckInResult }>()

const tone = computed(() => ({
  success: { box: 'bg-cms-green-50 border-cms-green-300', icon: 'bg-cms-green-700 text-white', name: 'lucide:circle-check-big', title: 'text-cms-green-800' },
  already: { box: 'bg-cms-gold-soft border-cms-gold', icon: 'bg-cms-gold text-cms-green-900', name: 'lucide:history', title: 'text-cms-gold-ink' },
  error: { box: 'bg-cms-rose-soft border-cms-rose', icon: 'bg-cms-rose text-white', name: 'lucide:circle-x', title: 'text-cms-rose' },
}[props.result.kind]))

const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })
const attendedLabel = computed(() => props.result.attendedAt ? timeFmt.format(new Date(props.result.attendedAt)) : '')
</script>

<template>
  <div data-testid="check-in-result" :class="['border-2 rounded-cms-lg p-5 flex gap-4 items-start', tone.box]" role="status" aria-live="polite">
    <div :class="['w-12 h-12 rounded-full grid place-items-center shrink-0', tone.icon]">
      <Icon :name="tone.name" size="26" />
    </div>
    <div class="min-w-0 flex-1">
      <div :class="['font-serif text-[20px] font-semibold leading-tight', tone.title]">
        {{ OUTCOME_LABELS[result.kind] }}
      </div>

      <template v-if="result.attendee">
        <div class="mt-2 font-semibold text-[16px] text-cms-ink truncate">{{ result.attendee.name }}</div>
        <div class="text-[13px] text-cms-muted truncate">{{ result.attendee.email }}</div>
      </template>
      <div v-if="result.event" class="mt-2 text-[13px] text-cms-ink-2 flex items-center gap-1.5">
        <Icon name="lucide:calendar" size="14" class="shrink-0" />
        <span class="truncate">{{ result.event.title }} · {{ formatDate(result.event.startDate) }}</span>
      </div>
      <div v-if="result.kind === 'already' && attendedLabel" class="mt-1 text-[13px] text-cms-gold-ink">
        Tercatat hadir pukul {{ attendedLabel }}
      </div>
      <div v-if="result.kind === 'error'" class="mt-1.5 text-[14px] text-cms-ink-2">
        {{ result.message }}
      </div>
    </div>
  </div>
</template>
