<script setup lang="ts">
interface FilterField {
  name: string
  label?: string
  placeholder?: string
}

interface Props {
  modelValue?: string | null
  field: FilterField
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'apply': []
}>()

const handleChange = (value: string | null) => {
  emit('update:modelValue', value)
  emit('apply')
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
    <UiDatePicker
      :model-value="modelValue"
      :placeholder="field.placeholder || 'Pilih tanggal'"
      :disabled="disabled"
      @update:model-value="handleChange"
    />
  </div>
</template>
