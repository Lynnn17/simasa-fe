<script setup lang="ts">
interface FilterField {
  name: string
  label?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

interface Props {
  modelValue?: number | null
  field: FilterField
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'apply': []
}>()

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    emit('apply')
  }
}

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value === '' ? null : Number(value))
}
</script>

<template>
  <div class="space-y-1">
    <label 
      v-if="field.label" 
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ field.label }}
    </label>
    <input
      type="number"
      :value="modelValue"
      :placeholder="field.placeholder || ''"
      :disabled="disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step || 1"
      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      @input="handleInput"
      @keydown="handleKeydown"
    />
  </div>
</template>
