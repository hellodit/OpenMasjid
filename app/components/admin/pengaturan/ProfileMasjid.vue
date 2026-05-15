<script setup lang="ts">
const nama = ref('Masjid Al-Hikmah')
const arab = ref('مَسْجِد الْحِكْمَة')
const tahun = ref('1987')
const kapasitas = ref('850')
const tagline = ref('Pusat kegiatan keagamaan dan sosial bagi jamaah di kawasan Bintaro Jaya, Tangerang Selatan.')
const alamat = ref('Jl. Bintaro Utama Sektor 9 Blok B No. 12')
const kota = ref('Tangerang Selatan')
const provinsi = ref('Banten')
const kodepos = ref('15229')
const phone = ref('+62 21 7351 2200')
const email = ref('dkm@alhikmah-bintaro.or.id')
const website = ref('alhikmah-bintaro.or.id')
const ig = ref('@masjidalhikmah.bintaro')
const yt = ref('Masjid Al-Hikmah Bintaro')

const pubProfile = ref(true)
const showTv = ref(true)
const newRegs = ref(true)
const maintenance = ref(false)

const inputCls = 'cms-input w-full h-[42px] px-3.5 border border-cms-border rounded-cms bg-cms-surface outline-none text-sm transition-all'
const textareaCls = 'cms-input w-full min-h-[110px] px-3.5 py-3 border border-cms-border rounded-cms bg-cms-surface outline-none text-sm leading-relaxed resize-y transition-all'
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px] items-start">
    <div>
      <AdminFormSection
        title="Identitas Masjid"
        description="Informasi utama yang ditampilkan di header CMS, TV display, dan halaman publik."
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <AdminFormField label="Nama Masjid" required>
            <input v-model="nama" :class="inputCls" type="text">
          </AdminFormField>
          <AdminFormField label="Nama dalam Bahasa Arab" hint="opsional">
            <input
              v-model="arab"
              :class="[inputCls, 'font-serif text-right']"
              type="text"
              dir="rtl"
            >
          </AdminFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <AdminFormField label="Tahun Berdiri">
            <input v-model="tahun" :class="inputCls" type="number">
          </AdminFormField>
          <AdminFormField
            label="Kapasitas Jamaah"
            help="Estimasi total kapasitas saat sholat berjamaah."
          >
            <input v-model="kapasitas" :class="inputCls" type="number">
          </AdminFormField>
        </div>

        <AdminFormField
          label="Deskripsi Singkat"
          help="Maksimum 240 karakter. Ditampilkan pada halaman tentang dan banner publik."
        >
          <textarea v-model="tagline" :class="textareaCls" rows="3" />
        </AdminFormField>
      </AdminFormSection>

      <AdminFormSection
        title="Lokasi & Kontak"
        description="Alamat lengkap, koordinat geografis, dan kanal kontak DKM."
      >
        <div class="mb-3.5">
          <AdminFormField label="Alamat">
            <input v-model="alamat" :class="inputCls" type="text">
          </AdminFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
          <AdminFormField label="Kota / Kabupaten">
            <input v-model="kota" :class="inputCls" type="text">
          </AdminFormField>
          <AdminFormField label="Provinsi">
            <input v-model="provinsi" :class="inputCls" type="text">
          </AdminFormField>
          <AdminFormField label="Kode Pos">
            <input v-model="kodepos" :class="inputCls" type="text">
          </AdminFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <AdminFormField label="Telepon">
            <input v-model="phone" :class="inputCls" type="text">
          </AdminFormField>
          <AdminFormField label="Email">
            <input v-model="email" :class="inputCls" type="email">
          </AdminFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">
          <AdminFormField label="Website">
            <input v-model="website" :class="inputCls" type="text">
          </AdminFormField>
          <AdminFormField
            label="Koordinat (Lat, Lng)"
            help="Digunakan untuk perhitungan waktu sholat otomatis."
          >
            <input :class="inputCls" type="text" value="-6.2731, 106.7196">
          </AdminFormField>
        </div>

        <AdminPengaturanMapStub
          title="Bintaro Sektor 9, Tangerang Selatan"
          description="−6.2731° LS, 106.7196° BT · zona waktu WIB (UTC+7)"
        />
      </AdminFormSection>

      <AdminFormSection
        title="Media Sosial"
        description="Tautan ditampilkan pada footer halaman publik."
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <AdminFormField label="Instagram">
            <input v-model="ig" :class="inputCls" type="text">
          </AdminFormField>
          <AdminFormField label="YouTube">
            <input v-model="yt" :class="inputCls" type="text">
          </AdminFormField>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AdminFormField label="Facebook">
            <input :class="inputCls" type="text" placeholder="https://facebook.com/…">
          </AdminFormField>
          <AdminFormField label="TikTok">
            <input :class="inputCls" type="text" placeholder="@…">
          </AdminFormField>
        </div>
      </AdminFormSection>
    </div>

    <aside>
      <AdminFormSection
        title="Logo & Identitas Visual"
        description="Diunggah dalam format PNG transparan, minimal 512×512 px."
      >
        <AdminPengaturanLogoSlot filename="logo-alhikmah.png" size="512×512 · 64 KB" />

        <AdminMotifDivider>Banner Publik</AdminMotifDivider>

        <AdminFormBannerUpload
          icon="lucide:image"
          title="Unggah Banner"
          description="PNG, JPG • 1920×640 • maks 2 MB"
        >
          Unggah Banner
        </AdminFormBannerUpload>
      </AdminFormSection>

      <AdminFormSection
        title="Status Publikasi"
        description="Atur visibilitas profil masjid di kanal publik."
      >
        <AdminPengaturanToggleRow v-model="pubProfile" title="Profil publik aktif" description="Tampilkan di halaman /masjid" />
        <AdminPengaturanToggleRow v-model="showTv"      title="Tampilkan di TV Display" description="Header pada layar utama" />
        <AdminPengaturanToggleRow v-model="newRegs"     title="Pendaftaran jamaah baru" description="Buka formulir keanggotaan" />
        <AdminPengaturanToggleRow v-model="maintenance" title="Mode pemeliharaan" description="Sembunyikan halaman publik" />
      </AdminFormSection>

      <AdminFormSection title="Pratinjau Identitas">
        <AdminPengaturanMasjidPreview
          :name="nama"
          :arabic="arab"
          :city="kota"
          :province="provinsi"
        />
      </AdminFormSection>
    </aside>
  </div>
</template>
