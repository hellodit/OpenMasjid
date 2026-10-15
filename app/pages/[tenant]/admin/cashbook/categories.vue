<script setup lang="ts">
import type { FormSubmitEvent, TabsItem } from '@nuxt/ui'
import type { z } from 'zod'
import { categoryCreateSchema, categoryUpdateSchema } from '#shared/schemas/cashbook'
import {
  apiErrorMessage,
  categoriesAsTree,
  useCashbookApi,
  useTransactionCategories,
  type CategoryType,
  type TransactionCategory,
} from '~/composables/useCashbook'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Kategori Transaksi — Buku Kas' })

const { isAdmin } = useAuth()
const toast = useToast()
const api = useCashbookApi()

const { data: catsData, refresh } = await useTransactionCategories({ includeArchived: true })

const activeTab = ref<CategoryType>('income')
const tabItems = [
  { label: 'Pemasukan', value: 'income', icon: 'i-lucide-arrow-down-circle' },
  { label: 'Pengeluaran', value: 'expense', icon: 'i-lucide-arrow-up-circle' },
] satisfies TabsItem[]

const tree = computed(() =>
  categoriesAsTree((catsData.value ?? []).filter((c) => c.type === activeTab.value)),
)

// ── Create / edit form ────────────────────────────────────────────────
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)

const emptyState = (type: CategoryType = 'income', parentId: string | null = null) => ({
  name: '',
  type,
  parentId,
  icon: '',
  colorToken: '',
  description: '',
  sortOrder: 0,
})
const state = reactive(emptyState())
const schema = computed(() => (editingId.value ? categoryUpdateSchema : categoryCreateSchema))

const typeItems = [
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

const editingHasChildren = computed(
  () => !!editingId.value && (catsData.value ?? []).some((c) => c.parentId === editingId.value),
)

const parentItems = computed(() =>
  (catsData.value ?? [])
    .filter((c) => c.type === state.type && !c.parentId && c.id !== editingId.value && c.isActive)
    .map((c) => ({ label: c.name, value: c.id })),
)

watch(() => state.type, () => {
  if (state.parentId && !parentItems.value.some((p) => p.value === state.parentId)) state.parentId = null
})

function startCreate(type: CategoryType, parentId?: string) {
  Object.assign(state, emptyState(type, parentId ?? null))
  editingId.value = null
  formOpen.value = true
}

function startEdit(cat: TransactionCategory) {
  Object.assign(state, {
    name: cat.name,
    type: cat.type,
    parentId: cat.parentId,
    icon: cat.icon ?? '',
    colorToken: cat.colorToken ?? '',
    description: cat.description ?? '',
    sortOrder: cat.sortOrder,
  })
  editingId.value = cat.id
  formOpen.value = true
}

type CategoryFormOutput = z.output<typeof categoryCreateSchema> | z.output<typeof categoryUpdateSchema>

async function onSubmit(event: FormSubmitEvent<CategoryFormOutput>) {
  submitting.value = true
  try {
    if (editingId.value) {
      // categoryUpdateSchema already strips `type` (immutable).
      await api.updateCategory(editingId.value, { ...event.data, parentId: event.data.parentId ?? null })
    } else {
      // Validated against categoryCreateSchema in create mode.
      await api.createCategory(event.data as z.output<typeof categoryCreateSchema>)
    }
    toast.add({
      color: 'success',
      icon: 'i-lucide-check-circle',
      title: editingId.value ? 'Kategori diperbarui' : 'Kategori dibuat',
      description: event.data.name,
    })
    activeTab.value = state.type
    formOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal menyimpan kategori', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    submitting.value = false
  }
}

// ── Archive / restore ─────────────────────────────────────────────────
const archiveTarget = ref<TransactionCategory | null>(null)
const archiveOpen = computed({
  get: () => !!archiveTarget.value,
  set: (v) => { if (!v) archiveTarget.value = null },
})
const archiving = ref(false)

async function confirmArchive() {
  const target = archiveTarget.value
  if (!target) return
  archiving.value = true
  try {
    const res = await api.deleteCategory(target.id)
    toast.add({
      color: 'success',
      icon: 'i-lucide-archive',
      title: 'archived' in res ? 'Kategori diarsipkan' : 'Kategori dihapus',
      description: target.name,
    })
    archiveTarget.value = null
    await refresh()
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal mengarsipkan kategori', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    archiving.value = false
  }
}

async function restore(cat: TransactionCategory) {
  try {
    await api.updateCategory(cat.id, { isActive: true })
    toast.add({ color: 'success', icon: 'i-lucide-archive-restore', title: 'Kategori diaktifkan kembali', description: cat.name })
    await refresh()
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal mengaktifkan kategori', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Kategori Transaksi"
      description="Atur kategori untuk pemasukan dan pengeluaran. Maksimal 2 level hierarki."
    >
      <template #actions>
        <UButton
          v-if="isAdmin"
          icon="i-lucide-plus"
          label="Kategori Baru"
          class="font-semibold"
          @click="startCreate(activeTab)"
        />
      </template>
    </AdminPageHeader>

    <UTabs
      v-model="activeTab"
      :items="tabItems"
      :content="false"
      color="neutral"
      variant="pill"
      class="mb-4 w-fit"
    />

    <div
      v-if="!tree.length"
      class="text-cms-muted text-sm py-12 text-center bg-cms-surface border border-cms-border rounded-cms-lg"
    >
      Belum ada kategori {{ activeTab === 'income' ? 'pemasukan' : 'pengeluaran' }}.
    </div>

    <div v-else class="bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden">
      <ul class="m-0 p-0 list-none">
        <li
          v-for="node in tree"
          :key="node.id"
          class="border-b border-cms-border last:border-b-0"
        >
          <div :class="['flex items-center gap-3 px-4 py-3', !node.isActive && 'opacity-60']">
            <Icon
              :name="node.icon ?? 'lucide:tag'"
              size="18"
              :style="node.colorToken ? `color:${node.colorToken}` : ''"
            />
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-cms-ink">
                {{ node.name }}
                <UBadge v-if="!node.isActive" color="neutral" variant="outline" size="sm" label="Arsip" class="ml-2" />
              </div>
              <div v-if="node.description" class="text-[12.5px] text-cms-muted truncate">
                {{ node.description }}
              </div>
            </div>
            <div v-if="isAdmin" class="flex gap-1">
              <template v-if="node.isActive">
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-plus" label="Sub" @click="startCreate(node.type, node.id)" />
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" aria-label="Edit" @click="startEdit(node)" />
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-archive" aria-label="Arsipkan" @click="archiveTarget = node" />
              </template>
              <UButton
                v-else
                size="sm"
                variant="ghost"
                icon="i-lucide-archive-restore"
                label="Aktifkan"
                @click="restore(node)"
              />
            </div>
          </div>

          <ul v-if="node.children.length" class="m-0 p-0 list-none bg-cms-surface-2/40 border-t border-cms-border">
            <li
              v-for="child in node.children"
              :key="child.id"
              :class="['flex items-center gap-3 px-4 py-2.5 pl-12 border-b border-cms-border last:border-b-0', !child.isActive && 'opacity-60']"
            >
              <Icon
                :name="child.icon ?? 'lucide:corner-down-right'"
                size="14"
                :style="child.colorToken ? `color:${child.colorToken}` : ''"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-cms-ink-2">
                  {{ child.name }}
                  <UBadge v-if="!child.isActive" color="neutral" variant="outline" size="sm" label="Arsip" class="ml-1.5" />
                </div>
              </div>
              <div v-if="isAdmin" class="flex gap-1">
                <template v-if="child.isActive">
                  <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" aria-label="Edit" @click="startEdit(child)" />
                  <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-archive" aria-label="Arsipkan" @click="archiveTarget = child" />
                </template>
                <UButton
                  v-else
                  size="sm"
                  variant="ghost"
                  icon="i-lucide-archive-restore"
                  label="Aktifkan"
                  @click="restore(child)"
                />
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <UModal
      v-model:open="formOpen"
      :title="editingId ? 'Edit Kategori' : 'Kategori Baru'"
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Nama" name="name" required>
              <UInput v-model="state.name" placeholder="cth: Infaq Jum'at" class="w-full" />
            </UFormField>
            <UFormField
              label="Tipe"
              name="type"
              required
              :help="editingId ? 'Tipe tidak dapat diubah.' : undefined"
            >
              <USelect v-model="state.type" :items="typeItems" :disabled="!!editingId" class="w-full" />
            </UFormField>
            <UFormField
              label="Parent"
              name="parentId"
              :hint="editingHasChildren ? undefined : 'kosongkan untuk top-level'"
              :help="editingHasChildren ? 'Kategori ini punya sub-kategori sehingga harus tetap top-level.' : undefined"
            >
              <USelectMenu
                v-model="state.parentId"
                :items="parentItems"
                value-key="value"
                clear
                :disabled="editingHasChildren"
                placeholder="— Top Level —"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Urutan" name="sortOrder">
              <UInputNumber v-model="state.sortOrder" :min="0" :max="9999" class="w-full" />
            </UFormField>
            <UFormField label="Icon" name="icon" hint="cth: lucide:heart">
              <UInput v-model="state.icon" placeholder="lucide:tag" class="w-full">
                <template v-if="state.icon" #leading>
                  <Icon :name="state.icon" size="16" />
                </template>
              </UInput>
            </UFormField>
            <UFormField label="Warna (CSS)" name="colorToken" hint="cth: #16a34a">
              <UInput v-model="state.colorToken" placeholder="#16a34a" class="w-full">
                <template #leading>
                  <span
                    class="block size-4 rounded-full border border-cms-border"
                    :style="state.colorToken ? { background: state.colorToken } : {}"
                  />
                </template>
              </UInput>
            </UFormField>
            <UFormField label="Deskripsi" name="description" hint="opsional" class="md:col-span-2">
              <UTextarea v-model="state.description" :rows="2" autoresize class="w-full" />
            </UFormField>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="ghost" label="Batal" @click="formOpen = false" />
            <UButton type="submit" icon="i-lucide-save" label="Simpan" :loading="submitting" class="font-semibold" />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="archiveOpen"
      title="Arsipkan kategori?"
      :description="`Kategori “${archiveTarget?.name ?? ''}” tidak bisa dipakai untuk transaksi baru. Transaksi lama tetap merujuk ke kategori ini; kategori yang belum dipakai akan dihapus.`"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Batal" @click="archiveTarget = null" />
          <UButton color="error" icon="i-lucide-archive" label="Arsipkan" :loading="archiving" @click="confirmArchive" />
        </div>
      </template>
    </UModal>
  </div>
</template>
