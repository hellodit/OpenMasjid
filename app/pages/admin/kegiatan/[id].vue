<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const { EVENTS, CATEGORIES, ATTENDEES, SCHEDULE } = useAdminMock()
const ev = computed(() => EVENTS.find(e => e.id === route.params.id) ?? EVENTS[0]!)
const cat = computed(() => CATEGORIES.find(c => c.id === ev.value.cat))
const pct = computed(() => Math.round((ev.value.attended / ev.value.capacity) * 100))

useHead({ title: () => `${ev.value.title} — Masjidku CMS` })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-[18px]">
      <AdminBtn variant="ghost" to="/admin/kegiatan">
        <Icon name="lucide:arrow-left" size="16" /> Kembali ke Daftar
      </AdminBtn>
      <div class="flex gap-2">
        <AdminBtn><Icon name="lucide:share-2" size="16" /> Bagikan</AdminBtn>
        <AdminBtn><Icon name="lucide:pencil" size="16" /> Edit</AdminBtn>
        <AdminBtn variant="danger"><Icon name="lucide:trash-2" size="16" /> Hapus</AdminBtn>
      </div>
    </div>

    <AdminDetailHero :ev="ev" :category-icon="cat?.icon ?? 'lucide:tag'" />

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[18px] items-start">
      <div>
        <AdminDetailInfoBox title="Tentang Kegiatan">
          <p class="text-[15px] leading-[1.65] text-cms-ink-2 m-0">{{ ev.desc }}</p>

          <AdminMotifDivider class="mt-4">Detail</AdminMotifDivider>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <AdminDetailInfoCell
              icon="lucide:calendar"
              label="Tanggal"
              :value="`${ev.day}, ${ev.date}`"
              :sub="ev.time"
            />
            <AdminDetailInfoCell
              icon="lucide:map-pin"
              label="Lokasi"
              :value="ev.location"
              :sub="ev.address"
            />
            <AdminDetailInfoCell
              icon="lucide:users"
              label="Kapasitas"
              :value="`${ev.attended} dari ${ev.capacity} orang`"
              :sub="`${pct}% terisi`"
            />
            <AdminDetailInfoCell
              icon="lucide:mic"
              label="Pembicara"
              :value="ev.speaker"
              :sub="ev.role"
            />
          </div>
        </AdminDetailInfoBox>

        <AdminDetailInfoBox title="Susunan Acara">
          <AdminDetailScheduleList :items="SCHEDULE" />
        </AdminDetailInfoBox>

        <AdminDetailInfoBox title="Catatan untuk Jamaah">
          <ul class="m-0 pl-5 leading-[1.85] text-cms-ink-2">
            <li>Mohon hadir 10 menit sebelum acara dimulai.</li>
            <li>Membawa mushaf atau perangkat yang berisi mushaf digital.</li>
            <li>Disediakan ruang terpisah untuk jamaah ikhwan dan akhwat.</li>
            <li>Tersedia konsumsi ringan setelah sesi tanya jawab.</li>
          </ul>
        </AdminDetailInfoBox>
      </div>

      <div>
        <AdminDetailCapacitySideCard :attended="ev.attended" :capacity="ev.capacity" />

        <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
          <h4 class="font-serif text-[16px] m-0 mb-3 font-semibold flex items-center justify-between">
            Pendaftar Terbaru
            <button class="text-[13px] text-cms-green-700 font-semibold hover:underline">
              Lihat semua
            </button>
          </h4>
          <AdminDetailAttendeesList :items="ATTENDEES" />
        </div>

        <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
          <h4 class="font-serif text-[16px] m-0 mb-3 font-semibold">Kontak Penyelenggara</h4>
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center gap-2.5">
              <div class="w-[38px] h-[38px] rounded-[10px] bg-cms-green-100 text-cms-green-800 grid place-items-center">
                <Icon name="lucide:phone" size="16" />
              </div>
              <div>
                <div class="text-[11px] text-cms-muted uppercase tracking-[0.4px] font-semibold">Telepon</div>
                <div class="font-semibold">+62 812-3456-7890</div>
              </div>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-[38px] h-[38px] rounded-[10px] bg-cms-green-100 text-cms-green-800 grid place-items-center">
                <Icon name="lucide:mail" size="16" />
              </div>
              <div>
                <div class="text-[11px] text-cms-muted uppercase tracking-[0.4px] font-semibold">Email</div>
                <div class="font-semibold">dkm@masjidku.id</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
