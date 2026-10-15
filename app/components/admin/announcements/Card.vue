<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AnnouncementVisibility } from '#shared/utils/announcements'

export interface AnnouncementRow {
  id: string
  title: string
  body: string | null
  status: 'draft' | 'published' | 'archived'
  isPinned: boolean
  showOnDisplay: boolean
  startsOn: string | null
  endsOn: string | null
  createdByName: string | null
  createdAt: string
  updatedAt: string
  visibility: AnnouncementVisibility
}

const props = defineProps<{ announcement: AnnouncementRow, canEdit: boolean, busy?: boolean }>()
const emit = defineEmits<{ edit: [], pin: [], archive: [], publish: [], remove: [] }>()

const LONG_BODY = 320
const expanded = ref(false)
const isLong = computed(() => (props.announcement.body?.length ?? 0) > LONG_BODY || (props.announcement.body?.split('\n').length ?? 0) > 6)

const DAY_MONTH = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const DAY_MONTH_YEAR = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function shortDate(iso: string, withYear = false) {
  const d = new Date(`${iso}T00:00:00Z`)
  return (withYear ? DAY_MONTH_YEAR : DAY_MONTH).format(d)
}

/** "Tayang 10–20 Okt", "Mulai 1 Des", "Sampai 20 Okt", "Tanpa batas". */
const windowLabel = computed(() => {
  const { startsOn: s, endsOn: e } = props.announcement
  const thisYear = String(new Date().getFullYear())
  const needYear = (iso: string) => !iso.startsWith(thisYear)
  if (s && e) {
    if (s === e) return `Tayang ${shortDate(s, needYear(s))}`
    const sameYear = s.slice(0, 4) === e.slice(0, 4)
    if (sameYear && s.slice(0, 7) === e.slice(0, 7)) {
      return `Tayang ${Number(s.slice(8))}–${shortDate(e, needYear(e))}`
    }
    return `Tayang ${shortDate(s, !sameYear || needYear(s))} – ${shortDate(e, needYear(e))}`
  }
  if (s) return `Mulai ${shortDate(s, needYear(s))}`
  if (e) return `Sampai ${shortDate(e, needYear(e))}`
  return 'Tanpa batas'
})

const menu = computed<DropdownMenuItem[][]>(() => [
  [
    props.announcement.status === 'published'
      ? { label: 'Arsipkan', icon: 'i-lucide-archive', onSelect: () => emit('archive') }
      : { label: 'Terbitkan', icon: 'i-lucide-send', onSelect: () => emit('publish') },
  ],
  [{ label: 'Hapus', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => emit('remove') }],
])

// Relative time depends on "now" and the viewer's clock, so render it after hydration only.
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const { tenant } = useTenantContext()
const updatedLabel = computed(() => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: tenant.value?.timezone ?? 'Asia/Jakarta',
}).format(new Date(props.announcement.updatedAt)))

const muted = computed(() => ['archived', 'expired'].includes(props.announcement.visibility))
</script>

<template>
  <article
    :class="[
      'relative bg-cms-surface border rounded-cms-lg p-5 flex flex-col gap-3 transition-colors',
      announcement.isPinned ? 'border-cms-gold shadow-cms' : 'border-cms-border',
    ]"
    :data-testid="`announcement-${announcement.id}`"
  >
    <div class="flex flex-wrap items-center gap-1.5 pr-0">
      <AdminAnnouncementsVisibilityBadge :visibility="announcement.visibility" />
      <span
        v-if="announcement.isPinned"
        class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.3px] text-cms-gold-ink bg-cms-gold-soft rounded-full px-2 py-0.5"
      >
        <Icon name="lucide:pin" size="11" />
        Disematkan
      </span>
      <span
        v-if="announcement.showOnDisplay"
        class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.3px] text-cms-info bg-cms-info-soft rounded-full px-2 py-0.5"
      >
        <Icon name="lucide:monitor" size="11" />
        Tampil di TV
      </span>
    </div>

    <div class="min-w-0">
      <h3 :class="['font-serif text-[19px] leading-snug font-semibold m-0 break-words', muted ? 'text-cms-ink-2' : 'text-cms-ink']">
        {{ announcement.title }}
      </h3>
      <p
        v-if="announcement.body"
        :class="['mt-1.5 mb-0 text-[13.5px] text-cms-ink-2 whitespace-pre-line break-words', isLong && !expanded ? 'line-clamp-5' : '']"
      >
        {{ announcement.body }}
      </p>
      <button
        v-if="isLong"
        type="button"
        class="mt-1 text-[12.5px] font-semibold text-cms-green-700 hover:underline"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Tutup' : 'Selengkapnya' }}
      </button>
    </div>

    <div class="mt-auto pt-3 border-t border-cms-border flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-cms-muted">
      <span class="inline-flex items-center gap-1.5">
        <Icon name="lucide:calendar-range" size="14" />
        {{ windowLabel }}
      </span>
      <span v-if="announcement.createdByName" class="inline-flex items-center gap-1.5 min-w-0">
        <Icon name="lucide:user-round" size="14" />
        <span class="truncate">{{ announcement.createdByName }}</span>
      </span>
      <span class="inline-flex items-center gap-1.5" :title="updatedLabel">
        <Icon name="lucide:clock" size="14" />
        Diperbarui {{ mounted ? timeAgo(announcement.updatedAt) : updatedLabel }}
      </span>

      <div v-if="canEdit" class="flex items-center gap-1 ml-auto">
        <UButton
          :icon="announcement.isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin'"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :loading="busy"
          :aria-label="announcement.isPinned ? 'Lepas sematan' : 'Sematkan'"
          @click="emit('pin')"
        />
        <UButton icon="i-lucide-pencil" color="neutral" variant="outline" size="sm" label="Ubah" @click="emit('edit')" />
        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
          <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" size="sm" square aria-label="Aksi lainnya" />
        </UDropdownMenu>
      </div>
    </div>
  </article>
</template>
