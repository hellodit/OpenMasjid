<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  categoriesAsTree,
  useCashbookApi,
  useTransactionCategories,
  type CategoryType,
  type TransactionCategory,
} from '~/composables/useCashbook'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Kategori Transaksi — Buku Kas' })

const { data: catsData, refresh } = useTransactionCategories({ includeArchived: true })
const api = useCashbookApi()

const activeTab = ref<CategoryType>('income')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  name: '',
  type: 'income' as CategoryType,
  parentId: '' as string,
  icon: '',
  colorToken: '',
  description: '',
  sortOrder: 0,
})

const tabbed = computed(() => (catsData.value ?? []).filter((c) => c.type === activeTab.value))
const tree = computed(() => categoriesAsTree(tabbed.value))

const parentOptions = computed(() =>
  (catsData.value ?? []).filter(
    (c) => c.type === form.type && !c.parentId && c.id !== editingId.value && c.isActive,
  ),
)

function startCreate(type: CategoryType, parentId?: string) {
  Object.assign(form, {
    name: '',
    type,
    parentId: parentId ?? '',
    icon: '',
    colorToken: '',
    description: '',
    sortOrder: 0,
  })
  editingId.value = null
  showForm.value = true
}

function startEdit(cat: TransactionCategory) {
  Object.assign(form, {
    name: cat.name,
    type: cat.type,
    parentId: cat.parentId ?? '',
    icon: cat.icon ?? '',
    colorToken: cat.colorToken ?? '',
    description: cat.description ?? '',
    sortOrder: cat.sortOrder,
  })
  editingId.value = cat.id
  showForm.value = true
}

async function submit() {
  error.value = null
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      type: form.type,
      parentId: form.parentId || null,
      icon: form.icon.trim() || null,
      colorToken: form.colorToken.trim() || null,
      description: form.description.trim() || null,
      sortOrder: form.sortOrder,
    }
    if (editingId.value) {
      await api.updateCategory(editingId.value, payload)
    } else {
      await api.createCategory(payload)
    }
    showForm.value = false
    await refresh()
  } catch (e: unknown) {
    const fetchErr = e as { data?: { statusMessage?: string; data?: { errors?: string[] } } }
    error.value =
      fetchErr?.data?.data?.errors?.join(', ') ??
      fetchErr?.data?.statusMessage ??
      'Gagal menyimpan kategori'
  } finally {
    submitting.value = false
  }
}

async function archive(id: string) {
  if (!confirm('Arsipkan kategori ini? Transaksi historis tetap merujuk ke kategori ini.')) return
  try {
    await api.deleteCategory(id)
    await refresh()
  } catch {
    error.value = 'Gagal mengarsipkan kategori'
  }
}

const inputCls =
  'w-full h-10 px-3 border border-cms-border rounded-cms bg-cms-surface text-sm text-cms-ink outline-none focus:border-cms-green-700'
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Kategori Transaksi"
      description="Atur kategori untuk pemasukan dan pengeluaran. Maksimal 2 level hierarki."
    >
      <template #actions>
        <AdminBtn variant="primary" @click="startCreate(activeTab)">
          <Icon name="lucide:plus" size="16" /> Kategori Baru
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div
      v-if="error"
      class="mb-4 flex items-start gap-2 rounded-cms border border-cms-rose-soft bg-cms-rose-soft text-cms-rose px-3 py-2.5 text-[13px]"
    >
      <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <div class="inline-flex gap-1 p-1 bg-cms-surface-2 rounded-cms border border-cms-border mb-4">
      <button
        v-for="t in ['income', 'expense'] as const"
        :key="t"
        type="button"
        :class="[
          'h-9 px-4 rounded-cms-sm text-sm font-semibold',
          activeTab === t ? 'bg-cms-surface text-cms-ink shadow-sm' : 'text-cms-muted hover:text-cms-ink',
        ]"
        @click="activeTab = t"
      >
        {{ t === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
      </button>
    </div>

    <div v-if="showForm" class="mb-6 max-w-2xl">
      <AdminPanel :title="editingId ? 'Edit Kategori' : 'Kategori Baru'">
        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label="Nama" required>
              <input v-model="form.name" type="text" placeholder="cth: Infaq Jum'at" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Tipe" required>
              <select v-model="form.type" :class="inputCls" :disabled="!!editingId">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Parent" hint="kosongkan untuk kategori top-level">
              <select v-model="form.parentId" :class="inputCls">
                <option value="">— Top Level —</option>
                <option v-for="p in parentOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Urutan">
              <input v-model.number="form.sortOrder" type="number" min="0" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Icon" hint="cth: lucide:heart">
              <input v-model="form.icon" type="text" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Warna (CSS)" hint="cth: #16a34a">
              <input v-model="form.colorToken" type="text" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Deskripsi" hint="opsional" class="md:col-span-2">
              <textarea v-model="form.description" rows="2" :class="[inputCls, 'h-auto py-2']" />
            </AdminFormField>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <AdminBtn type="button" variant="ghost" @click="showForm = false">Batal</AdminBtn>
            <AdminBtn type="submit" variant="primary" :disabled="submitting">
              <Icon v-if="submitting" name="lucide:loader-2" class="animate-spin" size="16" />
              Simpan
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>
    </div>

    <div v-if="!tree.length" class="text-cms-muted text-sm py-12 text-center bg-cms-surface border border-cms-border rounded-cms-lg">
      Belum ada kategori {{ activeTab === 'income' ? 'pemasukan' : 'pengeluaran' }}.
    </div>

    <div v-else class="bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden">
      <ul>
        <li
          v-for="node in tree"
          :key="node.id"
          class="border-b border-cms-border last:border-b-0"
        >
          <div class="flex items-center gap-3 px-4 py-3">
            <Icon
              :name="node.icon ?? 'lucide:tag'"
              size="18"
              :style="node.colorToken ? `color:${node.colorToken}` : ''"
            />
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-cms-ink">
                {{ node.name }}
                <span v-if="!node.isActive" class="ml-2 text-[11px] font-normal text-cms-muted">(arsip)</span>
              </div>
              <div v-if="node.description" class="text-[12.5px] text-cms-muted truncate">
                {{ node.description }}
              </div>
            </div>
            <div class="flex gap-1">
              <AdminBtn size="sm" variant="ghost" @click="startCreate(node.type, node.id)">
                <Icon name="lucide:plus" size="14" /> Sub
              </AdminBtn>
              <AdminBtn size="sm" variant="ghost" @click="startEdit(node)">
                <Icon name="lucide:edit-2" size="14" />
              </AdminBtn>
              <AdminBtn size="sm" variant="ghost" @click="archive(node.id)">
                <Icon name="lucide:archive" size="14" />
              </AdminBtn>
            </div>
          </div>

          <ul v-if="node.children.length" class="bg-cms-surface-2/40 border-t border-cms-border">
            <li
              v-for="child in node.children"
              :key="child.id"
              class="flex items-center gap-3 px-4 py-2.5 pl-12 border-b border-cms-border last:border-b-0"
            >
              <Icon
                :name="child.icon ?? 'lucide:corner-down-right'"
                size="14"
                :style="child.colorToken ? `color:${child.colorToken}` : ''"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-cms-ink-2">
                  {{ child.name }}
                  <span v-if="!child.isActive" class="ml-1.5 text-[11px] text-cms-muted">(arsip)</span>
                </div>
              </div>
              <div class="flex gap-1">
                <AdminBtn size="sm" variant="ghost" @click="startEdit(child)">
                  <Icon name="lucide:edit-2" size="14" />
                </AdminBtn>
                <AdminBtn size="sm" variant="ghost" @click="archive(child.id)">
                  <Icon name="lucide:archive" size="14" />
                </AdminBtn>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
