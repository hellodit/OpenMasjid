<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Tambah Kegiatan — Masjidku CMS' })

const cat = ref<CategoryId>('kajian')
const tags = ref<string[]>(['pekanan', 'tafsir'])
const pubNow = ref(true)
const needsReg = ref(true)
const livestream = ref(false)

const steps = [
  { t: 'Informasi Dasar', d: 'Judul, kategori, deskripsi', done: true },
  { t: 'Jadwal & Lokasi', d: 'Waktu, tempat, susunan acara', done: true },
  { t: 'Pembicara',        d: 'Ustadz / Narasumber' },
  { t: 'Banner & Visual',  d: 'Poster kegiatan' },
  { t: 'Pengaturan',       d: 'Pendaftaran & publikasi' },
]

const inputCls = 'cms-input w-full h-[42px] px-3.5 border border-cms-border rounded-cms bg-cms-surface outline-none text-sm transition-all'
const textareaCls = 'cms-input w-full min-h-[110px] px-3.5 py-3 border border-cms-border rounded-cms bg-cms-surface outline-none text-sm leading-relaxed resize-y transition-all'
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Kegiatan Baru"
      title="Tambah Kegiatan"
      description="Lengkapi informasi kegiatan agar jamaah dapat mengetahui dan mendaftar dengan mudah."
    >
      <template #actions>
        <AdminBtn variant="ghost" to="/admin/kegiatan">
          <Icon name="lucide:arrow-left" size="16" /> Kembali ke Daftar
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
      <AdminFormStepGuide :steps="steps" />

      <div>
        <!-- Section 1: Basic -->
        <AdminFormSection
          title="Informasi Dasar"
          description="Tampilkan kegiatan secara jelas. Judul yang baik singkat namun deskriptif."
        >
          <div class="grid grid-cols-1 gap-3.5 mb-3.5">
            <AdminFormField label="Judul Kegiatan" required>
              <input :class="inputCls" type="text" value="Kajian Tafsir Surah Yasin">
            </AdminFormField>
          </div>

          <div class="mb-3.5">
            <AdminFormField label="Kategori" required>
              <AdminFormCategoryPicker v-model="cat" />
            </AdminFormField>
          </div>

          <div class="mb-3.5">
            <AdminFormField label="Deskripsi" hint="Markdown didukung">
              <textarea
                :class="textareaCls"
                rows="4"
              >Kajian rutin pekanan setiap hari Selasa selepas Maghrib. Bahasan kali ini melanjutkan tafsir Surah Yasin ayat 30-40 dari kitab Tafsir Ibn Katsir. Terbuka untuk seluruh jamaah ikhwan dan akhwat.</textarea>
            </AdminFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <AdminFormField label="Tag" hint="Tekan Enter untuk menambah">
              <AdminFormTagInput v-model="tags" />
            </AdminFormField>
            <AdminFormField label="Bahasa Pengantar">
              <select :class="inputCls">
                <option value="id">Bahasa Indonesia</option>
                <option value="ar">Bahasa Arab</option>
                <option value="en">English</option>
                <option value="mix">Campuran (ID + Arab)</option>
              </select>
            </AdminFormField>
          </div>
        </AdminFormSection>

        <!-- Section 2: Schedule -->
        <AdminFormSection
          title="Jadwal & Lokasi"
          description="Tentukan kapan dan dimana kegiatan akan diselenggarakan."
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
            <AdminFormField label="Tanggal Mulai" required>
              <input :class="inputCls" type="date" value="2026-05-12">
            </AdminFormField>
            <AdminFormField label="Tanggal Selesai">
              <input :class="inputCls" type="date" value="2026-05-12">
            </AdminFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
            <AdminFormField label="Waktu Mulai" required>
              <input :class="inputCls" type="time" value="19:30">
            </AdminFormField>
            <AdminFormField label="Waktu Selesai">
              <input :class="inputCls" type="time" value="21:00">
            </AdminFormField>
            <AdminFormField label="Patokan Waktu">
              <select :class="inputCls">
                <option value="fix">Waktu Tetap</option>
                <option value="subuh">Ba'da Subuh</option>
                <option value="dhuhur">Ba'da Dzuhur</option>
                <option value="ashar">Ba'da Ashar</option>
                <option value="maghrib" selected>Ba'da Maghrib</option>
                <option value="isya">Ba'da Isya</option>
              </select>
            </AdminFormField>
          </div>

          <AdminMotifDivider>Lokasi</AdminMotifDivider>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
            <AdminFormField label="Tempat" required>
              <input :class="inputCls" type="text" value="Ruang Utama Masjid">
            </AdminFormField>
            <AdminFormField label="Detail Lokasi">
              <input :class="inputCls" type="text" value="Lt. 1, Mihrab Selatan">
            </AdminFormField>
          </div>

          <div class="mb-3.5">
            <AdminFormField label="Alamat Lengkap">
              <input :class="inputCls" type="text" value="Jl. KH. Hasyim Asy'ari No. 14, Kelurahan Sukamaju">
            </AdminFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <AdminFormField label="Kapasitas Maksimum">
              <input :class="inputCls" type="number" value="200">
            </AdminFormField>
            <AdminFormField label="Pengulangan">
              <select :class="inputCls">
                <option>Tidak Berulang</option>
                <option>Setiap Hari</option>
                <option>Setiap Pekan</option>
                <option>Setiap Bulan</option>
              </select>
            </AdminFormField>
          </div>
        </AdminFormSection>

        <!-- Section 3: Speaker -->
        <AdminFormSection
          title="Pembicara / Narasumber"
          description="Lampirkan nama dan profil singkat ustadz atau narasumber."
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
            <AdminFormField label="Nama Pembicara" required>
              <input :class="inputCls" type="text" value="Ust. Ahmad Mahfudz, Lc.">
            </AdminFormField>
            <AdminFormField label="Jabatan / Asal">
              <input :class="inputCls" type="text" value="Imam Tetap Masjid Al-Hikmah">
            </AdminFormField>
          </div>
          <AdminFormField label="Biografi Singkat">
            <textarea :class="textareaCls" rows="3">Lulusan Universitas Islam Madinah jurusan Syari'ah. Aktif mengisi kajian rutin di Masjid Al-Hikmah sejak 2018.</textarea>
          </AdminFormField>
        </AdminFormSection>

        <!-- Section 4: Banner -->
        <AdminFormSection
          title="Banner Kegiatan"
          description="Banner ditampilkan pada halaman kegiatan dan portal jamaah. Rekomendasi 1600×900px."
        >
          <AdminFormBannerUpload>
            Tarik & lepas berkas, atau
            <span class="text-cms-green-700 underline">pilih dari komputer</span>
          </AdminFormBannerUpload>
        </AdminFormSection>

        <!-- Section 5: Settings -->
        <AdminFormSection
          title="Pengaturan & Publikasi"
          description="Atur pendaftaran, visibilitas, dan saluran tampilan kegiatan."
        >
          <div class="grid gap-3">
            <AdminFormToggleCard
              v-model="pubNow"
              title="Tayangkan Sekarang"
              description="Bila aktif, kegiatan langsung muncul di portal jamaah."
            />
            <AdminFormToggleCard
              v-model="needsReg"
              title="Memerlukan Pendaftaran"
              description="Jamaah perlu mendaftar terlebih dahulu untuk hadir."
            />
            <AdminFormToggleCard
              v-model="livestream"
              title="Live Streaming"
              description="Sediakan tautan siaran langsung saat kegiatan berlangsung."
            />
          </div>
        </AdminFormSection>

        <!-- Action bar -->
        <div class="flex justify-between items-center bg-cms-surface border border-cms-border rounded-cms px-4 py-3 sticky bottom-0">
          <AdminBtn variant="ghost" to="/admin/kegiatan">Batalkan</AdminBtn>
          <div class="flex gap-2.5">
            <AdminBtn>Simpan sebagai Draf</AdminBtn>
            <AdminBtn variant="primary">
              <Icon name="lucide:check" size="16" /> Publikasikan Kegiatan
            </AdminBtn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
