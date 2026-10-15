<script setup lang="ts">
const tp = useTenantPath()
const props = defineProps<{
  items: {
    id: string
    registeredAt: string | Date
    attendedAt: string | Date | null
    user: { fullName: string } | null
    event: { id: string, title: string } | null
  }[]
}>()

const rows = computed(() => props.items.map(r => ({
  id: r.id,
  attended: !!r.attendedAt,
  name: r.user?.fullName ?? 'Jamaah',
  event: r.event,
  when: timeAgo(r.attendedAt ?? r.registeredAt),
})))
</script>

<template>
  <div v-if="rows.length" class="flex flex-col">
    <div
      v-for="(it, i) in rows"
      :key="it.id"
      :class="['flex gap-3 py-3', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div
        :class="[
          'w-8 h-8 rounded-full grid place-items-center shrink-0',
          it.attended ? 'bg-cms-green-100 text-cms-green-800' : 'bg-cms-gold-soft text-cms-gold-ink',
        ]"
      >
        <Icon :name="it.attended ? 'lucide:check' : 'lucide:user-plus'" size="14" />
      </div>
      <div class="min-w-0">
        <div class="text-[13.5px] leading-snug">
          <b class="text-cms-ink font-semibold">{{ it.name }}</b>
          {{ it.attended ? 'hadir di' : 'mendaftar pada' }}
          <NuxtLink
            v-if="it.event"
            :to="tp(`/admin/events/${it.event.id}`)"
            class="text-cms-ink font-semibold hover:text-cms-green-700 hover:underline"
          >
            {{ it.event.title }}
          </NuxtLink>
        </div>
        <div class="text-[11.5px] text-cms-muted mt-0.5">{{ it.when }}</div>
      </div>
    </div>
  </div>
  <div v-else class="text-[13px] text-cms-muted py-4 text-center">
    Belum ada pendaftaran.
  </div>
</template>
