<script setup lang="ts">
interface FilterField {
  name: string
  label?: string
  placeholder?: string
}

interface Props {
  modelValue?: string
  field: FilterField
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'apply': []
}>()

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    emit('apply')
  }
}

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val as string)
})
</script>

<template>
  <div class="space-y-1">
    <label 
      v-if="field.label" 
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ field.label }}
    </label>
    <div class="flex gap-2 w-full">
      <div class="flex-1 min-w-0">
        <UiInput
          v-model="localValue"
          type="text"
          :placeholder="field.placeholder || 'Cari <enter>'"
          :disabled="disabled"
          :size="size"
          clearable
          @keydown="handleKeydown"
          @clear="emit('apply')"
        >
          <template #suffix>
            <i class="mdi mdi-magnify text-lg" />
          </template>
        </UiInput>
      </div>
      <slot name="append" />
    </div>
  </div>
</template>
