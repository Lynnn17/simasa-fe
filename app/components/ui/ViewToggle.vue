<template>
  <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
    <button
      v-for="option in options"
      :key="option.value"
      @click="$emit('update:modelValue', option.value)"
      :class="[
        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center',
        modelValue === option.value
          ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      ]"
    >
      <i v-if="option.icon" :class="[option.icon, 'mr-1']"></i>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface ViewToggleOption {
  label: string;
  value: string;
  icon?: string;
}

defineProps<{
  modelValue: string;
  options: ViewToggleOption[];
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
