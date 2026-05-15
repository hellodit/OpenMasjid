<script setup lang="ts">
const auto = ref(true)
const method = ref('kemenag')
const tz = ref('Asia/Jakarta')
const imsak = ref<number | string>(10)
const jumat = ref('12:00')

const adj = ref<Record<string, number>>({ subuh: 0, terbit: 0, dzuhur: 2, ashar: 0, maghrib: 0, isya: 0 })
const iq  = ref<Record<string, number>>({ subuh: 15, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 })

const prayers = [
  { key: 'subuh',   label: 'Subuh',   ar: 'الفجر',  time: '04:32' },
  { key: 'terbit',  label: 'Terbit',  ar: 'الشروق', time: '05:46', noIq: true },
  { key: 'dzuhur',  label: 'Dzuhur',  ar: 'الظهر',  time: '11:54' },
  { key: 'ashar',   label: 'Ashar',   ar: 'العصر',  time: '15:18' },
  { key: 'maghrib', label: 'Maghrib', ar: 'المغرب', time: '17:51' },
  { key: 'isya',    label: 'Isya',    ar: 'العشاء', time: '19:04' },
]

const previewCells = computed(() =>
  prayers.filter(p => !p.noIq).map(p => ({
    key: p.key,
    label: p.label,
    time: p.time,
    iq: iq.value[p.key],
  })),
)

const showImsak = ref(true)
const showTarawih = ref(true)
const autoAdzan = ref(false)

const inputCls = 'cms-input w-full h-[42px] px-3.5 border border-cms-border rounded-cms bg-cms-surface outline-none text-sm transition-all'
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px] items-start">
    <div>
      <AdminFormSection
        title="Metode Perhitungan"
        description="Pilih lembaga rujukan dan sumber data untuk waktu sholat otomatis."
      >
        <template #aside>
          <AdminToggleSwitch v-model="auto" label="Otomatis" />
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
          <AdminFormField
            label="Metode"
            help="Direkomendasikan: Kemenag RI untuk wilayah Indonesia."
          >
            <select v-model="method" :class="inputCls">
              <option value="kemenag">Kemenag RI</option>
              <option value="mwl">Muslim World League (MWL)</option>
              <option value="isna">ISNA — North America</option>
              <option value="egypt">Egyptian General Authority</option>
              <option value="makkah">Umm Al-Qura, Makkah</option>
              <option value="karachi">University of Islamic Sciences, Karachi</option>
              <option value="custom">Kustom…</option>
            </select>
          </AdminFormField>
          <AdminFormField label="Mazhab Ashar">
            <select :class="inputCls">
              <option value="syafii">Syafi'i (bayangan = 1× tinggi)</option>
              <option value="hanafi">Hanafi (bayangan = 2× tinggi)</option>
            </select>
          </AdminFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <AdminFormField label="Sudut Fajar">
            <AdminPengaturanSuffixInput
              :model-value="20"
              suffix="°"
              type="number"
              step="0.5"
            />
          </AdminFormField>
          <AdminFormField label="Sudut Isya">
            <AdminPengaturanSuffixInput
              :model-value="18"
              suffix="°"
              type="number"
              step="0.5"
            />
          </AdminFormField>
          <AdminFormField label="Zona Waktu">
            <select v-model="tz" :class="inputCls">
              <option value="Asia/Jakarta">WIB (UTC+7)</option>
              <option value="Asia/Makassar">WITA (UTC+8)</option>
              <option value="Asia/Jayapura">WIT (UTC+9)</option>
            </select>
          </AdminFormField>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="Penyesuaian Adzan (Iqamat)"
        description="Sesuaikan waktu adzan dan jeda iqamah untuk setiap sholat fardhu."
      >
        <AdminPengaturanPrayerTable
          v-model:adj="adj"
          v-model:iq="iq"
          :rows="prayers"
        />
      </AdminFormSection>

      <AdminFormSection
        title="Jum'at & Imsak"
        description="Konfigurasi tambahan khusus untuk sholat Jum'at dan jadwal Ramadhan."
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">
          <AdminFormField
            label="Waktu Khutbah Jum'at"
            :help="`Jeda dari Dzuhur (otomatis: ${jumat}).`"
          >
            <input v-model="jumat" :class="inputCls" type="time">
          </AdminFormField>
          <AdminFormField label="Imsak (sebelum Subuh)">
            <AdminPengaturanSuffixInput v-model="imsak" suffix="menit" type="number" />
          </AdminFormField>
        </div>

        <AdminPengaturanToggleRow
          v-model="showImsak"
          title="Tampilkan Imsak saat Ramadhan"
          description="Otomatis aktif pada bulan Ramadhan menurut kalender hijriyah."
        />
        <AdminPengaturanToggleRow
          v-model="showTarawih"
          title="Tampilkan jadwal Tarawih"
          description="Setelah waktu Isya selama Ramadhan."
        />
        <AdminPengaturanToggleRow
          v-model="autoAdzan"
          title="Putar adzan otomatis di TV Display"
          description="Audio diputar 30 detik sebelum waktu adzan."
        />
      </AdminFormSection>

      <AdminFormSection
        title="Tampilan Jadwal"
        description="Format jam dan bahasa yang ditampilkan kepada jamaah."
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <AdminFormField label="Format Jam">
            <select :class="inputCls">
              <option value="24">24 jam (17:51)</option>
              <option value="12">12 jam (5:51 PM)</option>
            </select>
          </AdminFormField>
          <AdminFormField label="Bahasa Label">
            <select :class="inputCls">
              <option value="id_ar">Indonesia + Arab</option>
              <option value="id">Indonesia saja</option>
              <option value="ar">Arab saja</option>
            </select>
          </AdminFormField>
          <AdminFormField label="Tampilkan Hitung Mundur">
            <select :class="inputCls">
              <option value="next">Ke waktu berikutnya</option>
              <option value="all">Semua waktu</option>
              <option value="none">Tidak ditampilkan</option>
            </select>
          </AdminFormField>
        </div>
      </AdminFormSection>
    </div>

    <aside>
      <AdminFormSection
        title="Pratinjau TV Display"
        description="Tampilan langsung pada layar utama masjid."
      >
        <AdminPengaturanTVPreview
          place="Masjid Al-Hikmah · Bintaro"
          date="Ahad, 17 Mei 2026"
          hijri="3 Dzulqa'dah 1447 H"
          current="Ashar"
          current-time="15:18"
          countdown="02:14:32 menuju Maghrib"
          active-key="ashar"
          :cells="previewCells"
        />
      </AdminFormSection>

      <AdminFormSection title="Sumber Data">
        <div class="flex items-start gap-3 py-2.5 border-t border-dashed border-cms-border first:border-t-0 first:pt-1">
          <div class="w-2.5 h-2.5 rounded-full bg-cms-green-700 shadow-[0_0_0_3px_oklch(0.85_0.06_155_/_0.5)] mt-1 shrink-0" />
          <div>
            <div class="font-semibold text-[13px]">Sinkronisasi Otomatis</div>
            <div class="text-[12.5px] text-cms-muted mt-0.5">
              Diperbarui 12 menit yang lalu dari Kemenag RI · Akurasi koordinat ±50 m.
            </div>
          </div>
        </div>
        <div class="flex items-start gap-3 py-2.5 border-t border-dashed border-cms-border">
          <div class="w-2.5 h-2.5 rounded-full bg-cms-border-strong mt-1 shrink-0" />
          <div>
            <div class="font-semibold text-[13px]">Override Manual</div>
            <div class="text-[12.5px] text-cms-muted mt-0.5">
              Tidak ada override manual untuk pekan ini.
            </div>
          </div>
        </div>
        <AdminBtn size="sm" class="mt-2.5 w-full justify-center">
          <Icon name="lucide:download" size="13" /> Unduh jadwal sebulan (.csv)
        </AdminBtn>
      </AdminFormSection>
    </aside>
  </div>
</template>
