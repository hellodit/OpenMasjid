<script setup lang="ts">
type Tone = 'default' | 'gold' | 'rose'
interface Activity { icon: string, html: string, when: string, tone?: Tone }

const items: Activity[] = [
  { icon: 'lucide:plus',  html: '<b>Ust. Faris</b> menambah kegiatan baru: <b>Kelas Bahasa Arab</b>', when: '5 menit lalu' },
  { icon: 'lucide:users', html: '<b>Sdr. Rifki</b> mendaftar pada <b>Kajian Tafsir Al-Mulk</b>', when: '22 menit lalu', tone: 'gold' },
  { icon: 'lucide:check', html: '<b>Tahsin Tilawah Pemula</b> kapasitas mencapai 95%', when: '1 jam lalu' },
  { icon: 'lucide:heart', html: 'Donasi <b>Rp 2.500.000</b> diterima dari Bapak Ahmad', when: '3 jam lalu', tone: 'rose' },
  { icon: 'lucide:pencil', html: '<b>H. Sulaiman</b> memperbarui <b>Tabligh Akbar</b>', when: '5 jam lalu' },
]

const tone: Record<Tone, string> = {
  default: 'bg-cms-green-100 text-cms-green-800',
  gold:    'bg-cms-gold-soft text-cms-gold-ink',
  rose:    'bg-cms-rose-soft text-cms-rose',
}
</script>

<template>
  <div class="flex flex-col">
    <div
      v-for="(it, i) in items"
      :key="i"
      :class="['flex gap-3 py-3', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div :class="['w-8 h-8 rounded-full grid place-items-center shrink-0', tone[it.tone ?? 'default']]">
        <Icon :name="it.icon" size="14" />
      </div>
      <div>
        <div class="text-[13.5px] leading-snug [&_b]:text-cms-ink [&_b]:font-semibold" v-html="it.html" />
        <div class="text-[11.5px] text-cms-muted mt-0.5">{{ it.when }}</div>
      </div>
    </div>
  </div>
</template>
