<script setup lang="ts">
interface Option {
  label?: string
  value: string | number
  [key: string]: any
}

interface FilterField {
  name: string
  label?: string
  placeholder?: string
  valueKey?: string
  textKey?: string
}

interface Props {
  modelValue?: string | number | null
  field: FilterField
  items?: Option[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  items: () => [],
  disabled: false,
  size: 'md',
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'apply': []
}>()



const handleChange = (option: { label: string; value: string | number } | null) => {
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
    
    <UiAutocomplete
      :model-value="modelValue"
      :options="items"
      :placeholder="field.placeholder || 'Cari...'"
      :disabled="disabled"
      :size="size"
      :clearable="clearable"
      :item-value="field.valueKey || 'value'"
      :item-title="field.textKey || 'label'"
      @update:model-value="emit('update:modelValue', $event)"
      @change="handleChange"
    />
  </div>
</template>
