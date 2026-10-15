<script setup lang="ts">
import { formatDate } from '~/utils/format'

/** One public announcement: pinned badge, title, body (line breaks kept, long text clamped). */
const props = defineProps<{
  announcement: {
    title: string
    body: string | null
    isPinned: boolean
    startsOn: string | null
    endsOn: string | null
    publishedAt: string | null
  }
}>()

const expanded = ref(false)

const body = computed(() => props.announcement.body?.trim() || '')
/** Clamp only when the text is clearly longer than ~4 lines on a phone. */
const isLong = computed(() => body.value.length > 220 || body.value.split('\n').length > 4)

const windowHint = computed(() => {
  const { startsOn, endsOn, publishedAt } = props.announcement
  if (startsOn && endsOn) return `Berlaku ${formatDate(startsOn)} – ${formatDate(endsOn)}`
  if (endsOn) return `Berlaku s.d. ${formatDate(endsOn)}`
  if (startsOn) return `Berlaku sejak ${formatDate(startsOn)}`
  return publishedAt ? `Diumumkan ${formatDate(publishedAt)}` : null
})
</script>

<template>
  <article
    class="relative bg-white rounded-cms-lg border shadow-cms-sm overflow-hidden"
    :class="announcement.isPinned ? 'border-cms-gold/60' : 'border-cms-border'"
  >
    <div v-if="announcement.isPinned" class="absolute inset-y-0 left-0 w-1 bg-cms-gold" aria-hidden="true" />
    <div class="p-4" :class="announcement.isPinned ? 'pl-5' : ''">
      <div class="flex flex-wrap items-center gap-2 mb-1.5">
        <span
          v-if="announcement.isPinned"
          class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px] bg-cms-gold-soft text-cms-gold-ink"
        >
          <Icon name="lucide:pin" size="11" />
          Disematkan
        </span>
        <span v-if="windowHint" class="text-[11px] text-cms-muted-2">{{ windowHint }}</span>
      </div>
      <h3 class="font-serif text-[16px] font-semibold leading-[1.25]">
        {{ announcement.title }}
      </h3>
      <p
        v-if="body"
        class="text-[13px] leading-relaxed text-cms-ink-2 mt-1.5 whitespace-pre-line break-words"
        :class="isLong && !expanded ? 'line-clamp-4' : ''"
      >
        {{ body }}
      </p>
      <UButton
        v-if="isLong"
        variant="link"
        color="primary"
        size="xs"
        :trailing-icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="px-0 mt-1 font-semibold text-cms-green-800"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Tutup' : 'Selengkapnya' }}
      </UButton>
    </div>
  </article>
</template>
