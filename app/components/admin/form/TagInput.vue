<script setup lang="ts">
const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [v: string[]] }>()

const draft = ref('')

const add = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && draft.value.trim()) {
    e.preventDefault()
    emit('update:modelValue', [...props.modelValue, draft.value.trim()])
    draft.value = ''
  }
}
const remove = (i: number) => {
  emit('update:modelValue', props.modelValue.filter((_, j) => j !== i))
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5 px-2.5 py-2 border border-cms-border rounded-cms bg-cms-surface min-h-[42px] items-center">
    <span
      v-for="(t, i) in modelValue"
      :key="i"
      class="bg-cms-green-100 text-cms-green-800 text-[12px] font-semibold pl-2.5 pr-2 py-0.5 rounded-full inline-flex items-center gap-1"
    >
      #{{ t }}
      <button type="button" class="bg-transparent border-0 text-cms-green-800 opacity-60 grid place-items-center p-0 w-4 h-4 hover:opacity-100" @click="remove(i)">
        <Icon name="lucide:x" size="12" />
      </button>
    </span>
    <input
      v-model="draft"
      type="text"
      placeholder="Tambah tag…"
      class="border-0 outline-none bg-transparent flex-1 min-w-[80px] text-[13px]"
      @keydown="add"
    >
  </div>
</template>
