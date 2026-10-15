<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { bannerClass } from '~/utils/format'
import { eventCategoryCreateSchema, eventCategoryUpdateSchema } from '#shared/schemas/events'

interface CategoryRow {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  colorToken: string | null
  sortOrder: number
  isActive: boolean
}

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ category?: CategoryRow | null, nextSortOrder?: number }>()
const emit = defineEmits<{ saved: [] }>()

const COLORS = [
  { label: 'Otomatis (dari slug)', value: 'auto' },
  { label: 'Hijau — Kajian', value: 'kajian' },
  { label: 'Biru — Tahsin', value: 'tahsin' },
  { label: 'Emas — TPA', value: 'tpa' },
  { label: 'Merah bata — Zakat', value: 'zakat' },
  { label: 'Ungu — Hari Besar', value: 'muharram' },
  { label: 'Hijau muda — Umum', value: 'umum' },
]

const empty = () => ({
  name: '',
  slug: undefined as string | undefined,
  description: '',
  icon: 'lucide:tag',
  colorToken: '',
  sortOrder: props.nextSortOrder ?? 0,
  isActive: true,
})

const state = reactive(empty())
const saving = ref(false)
const toast = useToast()

const isEdit = computed(() => !!props.category)
const schema = computed(() => (isEdit.value ? eventCategoryUpdateSchema : eventCategoryCreateSchema))

watch(open, (v) => {
  if (!v) return
  const c = props.category
  Object.assign(state, c
    ? {
        name: c.name,
        slug: c.slug,
        description: c.description ?? '',
        icon: c.icon ?? '',
        colorToken: c.colorToken ?? '',
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }
    : empty())
}, { immediate: true })

const slugModel = computed({
  get: () => state.slug ?? '',
  set: (v: string) => { state.slug = v.trim() ? v : undefined },
})

// Reka UI selects can't hold an empty value, so 'auto' stands in for "no token".
const colorModel = computed({
  get: () => state.colorToken || 'auto',
  set: (v: string) => { state.colorToken = v === 'auto' ? '' : v },
})

const iconPreview = computed(() => (/^[a-z0-9-]+:[a-z0-9-]+$/.test(state.icon.trim()) ? state.icon.trim() : 'lucide:tag'))

async function onSubmit(event: FormSubmitEvent<Record<string, unknown>>) {
  saving.value = true
  try {
    if (props.category) {
      await $fetch(`/api/admin/categories/${props.category.id}`, { method: 'PUT', body: event.data })
      toast.add({ color: 'success', title: 'Kategori diperbarui' })
    }
    else {
      await $fetch('/api/admin/categories', { method: 'POST', body: event.data })
      toast.add({ color: 'success', title: 'Kategori dibuat' })
    }
    open.value = false
    emit('saved')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ color: 'error', title: 'Gagal menyimpan kategori', description: e.data?.statusMessage })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Ubah Kategori' : 'Kategori Baru'"
    description="Kategori mengelompokkan kegiatan untuk pencarian dan pelaporan."
  >
    <template #body>
      <UForm id="category-form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nama" name="name" required>
          <UInput v-model="state.name" placeholder="mis. Kajian Rutin" class="w-full" autofocus />
        </UFormField>

        <UFormField label="Slug" name="slug" :hint="isEdit ? undefined : 'Opsional'" help="Huruf kecil, angka, dan tanda -. Kosongkan untuk dibuat otomatis dari nama.">
          <UInput v-model="slugModel" placeholder="kajian-rutin" class="w-full" />
        </UFormField>

        <UFormField label="Deskripsi" name="description">
          <UTextarea v-model="state.description" :rows="3" :maxlength="300" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <UFormField label="Ikon" name="icon" help="Nama ikon Lucide, mis. lucide:book-open">
            <UInput v-model="state.icon" placeholder="lucide:book-open" class="w-full" />
          </UFormField>
          <div
            :class="['w-12 h-12 rounded-xl grid place-items-center text-white mb-6', bannerClass(state.colorToken || state.slug || '')]"
            title="Pratinjau"
          >
            <Icon :name="iconPreview" size="22" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField label="Warna" name="colorToken">
            <USelect v-model="colorModel" :items="COLORS" class="w-full" />
          </UFormField>
          <UFormField label="Urutan" name="sortOrder">
            <UInputNumber v-model="state.sortOrder" :min="0" :max="9999" class="w-full" />
          </UFormField>
        </div>

        <UFormField name="isActive">
          <USwitch v-model="state.isActive" label="Aktif" description="Kategori nonaktif tidak bisa dipilih untuk kegiatan baru." />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="outline" label="Batal" @click="open = false" />
        <UButton type="submit" form="category-form" :loading="saving" :label="isEdit ? 'Simpan' : 'Buat Kategori'" />
      </div>
    </template>
  </UModal>
</template>
