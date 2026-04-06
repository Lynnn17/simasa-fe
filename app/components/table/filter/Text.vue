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
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
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
</script>

<template>
  <!-- <div class="space-y-1"> -->
    <div></div>
  <!-- </div> -->
</template>
