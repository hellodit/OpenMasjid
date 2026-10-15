<script setup lang="ts">
/**
 * Hero search: type a mosque name or city, pick a result → mosque home (/<slug>).
 * Accessible combobox (ARIA 1.2 pattern): ↑/↓ to move, Enter to open, Esc to close.
 */
interface MosqueHit {
  slug: string
  name: string
  city: string | null
}

const props = withDefaults(defineProps<{ autofocus?: boolean }>(), { autofocus: false })

const query = ref('')
const results = ref<MosqueHit[]>([])
const open = ref(false)
const loading = ref(false)
const failed = ref(false)
const active = ref(-1)
const root = ref<HTMLElement>()
const inputId = useId()
const listId = `${inputId}-list`

let timer: ReturnType<typeof setTimeout> | undefined
let requestSeq = 0

async function search(term: string) {
  const seq = ++requestSeq
  loading.value = true
  failed.value = false
  try {
    const hits = await $fetch('/api/tenants', { query: { q: term, limit: 8 } })
    if (seq !== requestSeq) return // a newer keystroke won
    results.value = hits
    active.value = hits.length ? 0 : -1
  }
  catch {
    if (seq === requestSeq) {
      failed.value = true
      results.value = []
    }
  }
  finally {
    if (seq === requestSeq) loading.value = false
  }
}

watch(query, (value) => {
  clearTimeout(timer)
  const term = value.trim()
  if (term.length < 2) {
    requestSeq++
    results.value = []
    loading.value = false
    open.value = false
    return
  }
  open.value = true
  timer = setTimeout(() => search(term), 250)
})

function go(hit: MosqueHit | undefined) {
  if (!hit) return
  open.value = false
  navigateTo(`/${hit.slug}`)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!results.value.length) return
    e.preventDefault()
    open.value = true
    const n = results.value.length
    active.value = e.key === 'ArrowDown' ? (active.value + 1) % n : (active.value - 1 + n) % n
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    go(results.value[active.value] ?? results.value[0])
  }
  else if (e.key === 'Escape') {
    open.value = false
  }
}

function onFocusOut(e: FocusEvent) {
  if (!root.value?.contains(e.relatedTarget as Node | null)) open.value = false
}

const showPanel = computed(() => open.value && query.value.trim().length >= 2)

onMounted(() => {
  if (props.autofocus) document.getElementById(inputId)?.focus()
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div ref="root" class="relative" @focusout="onFocusOut">
    <label :for="inputId" class="sr-only">Cari masjid</label>
    <div class="flex items-center gap-2 rounded-cms-lg bg-white p-2 shadow-cms-lg ring-1 ring-black/5">
      <UIcon name="i-lucide-search" class="size-5 text-cms-muted ml-2 shrink-0" />
      <input
        :id="inputId"
        v-model="query"
        type="text"
        inputmode="search"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :aria-expanded="showPanel"
        :aria-controls="listId"
        aria-autocomplete="list"
        :aria-activedescendant="showPanel && active >= 0 ? `${listId}-${active}` : undefined"
        placeholder="Cari nama masjid atau kota…"
        class="flex-1 min-w-0 h-11 bg-transparent text-[16px] text-cms-ink placeholder:text-cms-muted-2 outline-none"
        @keydown="onKeydown"
        @focus="open = query.trim().length >= 2"
      >
      <UIcon v-if="loading" name="i-lucide-loader-2" class="size-4 text-cms-muted animate-spin shrink-0" />
      <UButton
        v-else-if="query"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        aria-label="Hapus pencarian"
        class="shrink-0"
        @click="query = ''; open = false"
      />
      <UButton
        size="lg"
        label="Cari"
        class="shrink-0"
        :disabled="!results.length"
        @click="go(results[active] ?? results[0])"
      />
    </div>

    <div
      v-if="showPanel"
      class="absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-cms-lg border border-cms-border bg-white text-left shadow-cms-lg"
    >
      <ul
        v-if="results.length"
        :id="listId"
        role="listbox"
        aria-label="Hasil pencarian masjid"
        class="max-h-[340px] overflow-y-auto py-1.5 list-none m-0 p-0"
      >
        <li
          v-for="(hit, i) in results"
          :id="`${listId}-${i}`"
          :key="hit.slug"
          role="option"
          :aria-selected="i === active"
          class="flex items-center gap-3 px-4 py-3 cursor-pointer"
          :class="i === active ? 'bg-cms-green-50' : 'hover:bg-cms-surface-2'"
          @mouseenter="active = i"
          @mousedown.prevent="go(hit)"
        >
          <span class="w-9 h-9 rounded-[10px] bg-cms-gold-soft text-cms-gold-ink grid place-items-center shrink-0">
            <UIcon name="i-lucide-landmark" class="size-[18px]" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-semibold text-[15px] text-cms-ink truncate">{{ hit.name }}</span>
            <span class="block text-[12.5px] text-cms-muted truncate">
              <template v-if="hit.city">{{ hit.city }} · </template>/{{ hit.slug }}
            </span>
          </span>
          <UIcon name="i-lucide-arrow-right" class="size-4 text-cms-muted-2 shrink-0" />
        </li>
      </ul>

      <div v-else-if="failed" class="px-4 py-5 text-[14px] text-cms-rose">
        Pencarian gagal. Periksa koneksi lalu coba lagi.
      </div>

      <div v-else-if="!loading" class="px-4 py-5 text-[14px] text-cms-muted">
        Masjid “{{ query.trim() }}” belum terdaftar.
        <NuxtLink to="/register" class="font-semibold text-cms-green-700 hover:text-cms-green-800">
          Daftarkan masjid ini
        </NuxtLink>
      </div>

      <div v-else class="px-4 py-5 text-[14px] text-cms-muted">
        Mencari…
      </div>
    </div>
  </div>
</template>
