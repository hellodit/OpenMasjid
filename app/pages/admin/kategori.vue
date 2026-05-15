<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Kategori — Masjidku CMS' })

const { CATEGORIES } = useAdminMock()

interface CatRow {
  id: CategoryId
  name: string
  ar: string
  desc: string
  events: number
  attend: number
  growth: string
}

const cats: CatRow[] = [
  { id: 'kajian',   name: 'Kajian Rutin',     ar: 'الدُّرُوس',         desc: 'Kajian rutin pekanan dan bulanan dari kitab-kitab utama serta tafsir.', events: 18, attend: 472,  growth: '+12%' },
  { id: 'tahsin',   name: 'Tahsin & Tahfidz', ar: 'تحفيظ القرآن',    desc: 'Program tahsin tilawah dan tahfidz untuk seluruh kalangan jamaah.',     events: 11, attend: 286,  growth: '+8%' },
  { id: 'tpa',      name: 'TPA / TPQ',        ar: 'تربية الأطفال',     desc: 'Pendidikan Al-Qur\'an untuk anak usia dini hingga remaja.',             events: 9,  attend: 184,  growth: '+4%' },
  { id: 'zakat',    name: 'Zakat & Sosial',   ar: 'الزكاة والإحسان', desc: 'Penyaluran zakat, infaq, sedekah, dan kegiatan sosial kemasyarakatan.', events: 6,  attend: 98,   growth: '+22%' },
  { id: 'muharram', name: 'Hari Besar Islam', ar: 'أيام إسلامية',    desc: 'Peringatan hari-hari besar Islam: Maulid, Isra Mi\'raj, Tahun Baru Hijriyah.', events: 3, attend: 1240, growth: '+35%' },
  { id: 'umum',     name: 'Lainnya',          ar: 'أخرى',            desc: 'Kegiatan umum yang belum dikategorikan secara spesifik.',               events: 1,  attend: 12,   growth: '—' },
]

const iconOf = (id: CategoryId) => CATEGORIES.find(c => c.id === id)?.icon ?? 'lucide:tag'
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Manajemen Kategori"
      title="Kategori Kegiatan"
      description="Pisahkan kegiatan ke dalam kategori untuk memudahkan pencarian dan pelaporan kepada DKM."
    >
      <template #actions>
        <AdminBtn><Icon name="lucide:filter" size="16" /> Filter</AdminBtn>
        <AdminBtn variant="primary"><Icon name="lucide:plus" size="16" /> Kategori Baru</AdminBtn>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Total Kategori" :num="6" icon="lucide:tag" />
      <AdminStatCard label="Kategori Aktif" :num="6" tone="info" icon="lucide:check" />
      <AdminStatCard label="Paling Populer" num="Kajian" tone="gold" icon="lucide:trending-up" />
      <AdminStatCard label="Hadirin Total" num="2.292" tone="rose" icon="lucide:users" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminKategoriCard
        v-for="c in cats"
        :key="c.id"
        v-bind="c"
        :icon="iconOf(c.id)"
      />

      <!-- Add card -->
      <button
        type="button"
        class="cms-cat-add relative rounded-cms-lg p-6 min-h-[200px] flex flex-col items-center justify-center text-center bg-cms-surface border-[1.5px] border-dashed border-cms-green-300 text-cms-green-700 hover:bg-cms-green-50 hover:border-cms-green-700 transition-colors"
      >
        <div class="w-14 h-14 rounded-xl bg-cms-green-100 border border-cms-green-300 text-cms-green-700 grid place-items-center mb-2.5">
          <Icon name="lucide:plus" size="24" />
        </div>
        <h3 class="font-serif text-[18px] text-cms-ink m-0 font-semibold">Tambah Kategori</h3>
        <div class="text-[13px] text-cms-muted mt-1">
          Buat kategori baru untuk mengelompokkan kegiatan masjid Anda.
        </div>
      </button>
    </div>
  </div>
</template>
