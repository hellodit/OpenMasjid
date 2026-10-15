<script setup lang="ts">
const api = useApiBase()
definePageMeta({ layout: 'admin' })
useHead({ title: 'Kategori — OpenMasjid CMS' })

const { isAdmin } = useAuth()
const toast = useToast()

const { data, error, refresh, status } = await useFetch(`${api}/admin/categories`)

const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)

type Category = NonNullable<typeof data.value>[number]

const cats = computed(() => data.value ?? [])
const activeCount = computed(() => cats.value.filter(c => c.isActive).length)
const totalEvents = computed(() => cats.value.reduce((s, c) => s + c.eventCount, 0))
const popular = computed(() => {
  const top = [...cats.value].sort((a, b) => b.eventCount - a.eventCount)[0]
  return top && top.eventCount > 0 ? top.name : '—'
})
const nextSortOrder = computed(() => Math.min(9999, Math.max(0, ...cats.value.map(c => c.sortOrder)) + 1))

// ─── Create / edit ───────────────────────────────────────────────────────
const formOpen = ref(false)
const editing = ref<Category | null>(null)

function openCreate() {
  editing.value = null
  formOpen.value = true
}
function openEdit(c: Category) {
  editing.value = c
  formOpen.value = true
}

function errMsg(err: unknown) {
  return (err as { data?: { statusMessage?: string } }).data?.statusMessage
}

// ─── Toggle active ───────────────────────────────────────────────────────
const busyId = ref<string | null>(null)

async function toggleActive(c: Category, isActive: boolean) {
  busyId.value = c.id
  try {
    await $fetch(`${api}/admin/categories/${c.id}`, { method: 'PUT', body: { isActive } })
    toast.add({ color: 'success', title: isActive ? 'Kategori diaktifkan' : 'Kategori dinonaktifkan' })
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal mengubah status', description: errMsg(err) })
  }
  finally {
    busyId.value = null
  }
}

// ─── Archive / delete ────────────────────────────────────────────────────
const removing = ref<Category | null>(null)
const removeOpen = computed({
  get: () => !!removing.value,
  set: (v: boolean) => { if (!v) removing.value = null },
})
const removeBusy = ref(false)

async function confirmRemove() {
  const c = removing.value
  if (!c) return
  removeBusy.value = true
  try {
    const res = await $fetch(`${api}/admin/categories/${c.id}`, { method: 'DELETE' })
    toast.add({
      color: 'success',
      title: res.archived ? 'Kategori diarsipkan' : 'Kategori dihapus',
      description: res.archived ? 'Kategori masih dipakai kegiatan, sehingga hanya dinonaktifkan.' : undefined,
    })
    removing.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menghapus kategori', description: errMsg(err) })
  }
  finally {
    removeBusy.value = false
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Manajemen Kategori"
      title="Kategori Kegiatan"
      description="Pisahkan kegiatan ke dalam kategori untuk memudahkan pencarian dan pelaporan kepada DKM."
    >
      <template #actions>
        <UButton v-if="isAdmin" icon="i-lucide-plus" label="Kategori Baru" class="font-semibold" @click="openCreate" />
      </template>
    </AdminPageHeader>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Gagal memuat kategori"
      :description="errorMessage"
      class="mb-6"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Total Kategori" :num="cats.length" icon="lucide:tag" />
      <AdminStatCard label="Kategori Aktif" :num="activeCount" tone="info" icon="lucide:check" />
      <AdminStatCard label="Paling Banyak Kegiatan" :num="popular" tone="gold" icon="lucide:trending-up" />
      <AdminStatCard label="Total Kegiatan" :num="totalEvents" tone="rose" icon="lucide:calendar" />
    </div>

    <div v-if="status === 'pending' && !cats.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-[220px] rounded-cms-lg" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminCategoriesCard
        v-for="c in cats"
        :key="c.id"
        :category="c"
        :can-edit="isAdmin"
        :busy="busyId === c.id"
        @edit="openEdit(c)"
        @toggle="(v) => toggleActive(c, v)"
        @remove="removing = c"
      />

      <button
        v-if="isAdmin"
        type="button"
        class="relative rounded-cms-lg p-6 min-h-[200px] flex flex-col items-center justify-center text-center bg-cms-surface border-[1.5px] border-dashed border-cms-green-300 text-cms-green-700 hover:bg-cms-green-50 hover:border-cms-green-700 transition-colors"
        @click="openCreate"
      >
        <div class="w-14 h-14 rounded-xl bg-cms-green-100 border border-cms-green-300 text-cms-green-700 grid place-items-center mb-2.5">
          <Icon name="lucide:plus" size="24" />
        </div>
        <h3 class="font-serif text-[18px] text-cms-ink m-0 font-semibold">Tambah Kategori</h3>
        <div class="text-[13px] text-cms-muted mt-1">
          Buat kategori baru untuk mengelompokkan kegiatan masjid Anda.
        </div>
      </button>

      <div v-if="!cats.length && !isAdmin && !error" class="text-[13px] text-cms-muted col-span-full text-center py-10">
        Belum ada kategori.
      </div>
    </div>

    <AdminCategoriesFormModal
      v-if="isAdmin"
      v-model:open="formOpen"
      :category="editing"
      :next-sort-order="nextSortOrder"
      @saved="refresh()"
    />

    <UModal
      v-if="isAdmin"
      v-model:open="removeOpen"
      :title="removing?.eventCount ? 'Arsipkan kategori?' : 'Hapus kategori?'"
    >
      <template #body>
        <p v-if="removing?.eventCount" class="text-sm text-cms-ink-2 m-0">
          Kategori <b>{{ removing?.name }}</b> masih dipakai oleh {{ removing?.eventCount }} kegiatan, sehingga tidak
          dihapus melainkan <b>dinonaktifkan</b>. Kegiatan yang ada tetap memakai kategori ini.
        </p>
        <p v-else class="text-sm text-cms-ink-2 m-0">
          Kategori <b>{{ removing?.name }}</b> akan dihapus. Tindakan ini tidak dapat dibatalkan dari CMS.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="outline" label="Batal" @click="removing = null" />
          <UButton
            color="error"
            :loading="removeBusy"
            :icon="removing?.eventCount ? 'i-lucide-archive' : 'i-lucide-trash-2'"
            :label="removing?.eventCount ? 'Arsipkan' : 'Hapus'"
            @click="confirmRemove"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
