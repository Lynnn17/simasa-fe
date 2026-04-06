<script setup lang="ts">
/**
 * UiCheckbox - Styled checkbox component
 */
interface Props {
  modelValue?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
  color: 'primary',
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "change": [value: boolean];
}>();

const generatedId = useId();
const checkboxId = computed(() => props.id || `checkbox-${generatedId}`);

const isChecked = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});

// Size classes
const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  return sizes[props.size] || sizes.md;
});

// Color classes
const colorClasses = computed(() => {
  const colors: Record<string, string> = {
    primary: 'text-primary-600 focus:ring-primary-500',
    success: 'text-green-600 focus:ring-green-500',
    warning: 'text-amber-600 focus:ring-amber-500',
    danger: 'text-red-600 focus:ring-red-500',
  };
  return colors[props.color] || colors.primary;
});
</script>

<template>
  <label :for="checkboxId" class="inline-flex items-center gap-2 cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
    <input
      :id="checkboxId"
      type="checkbox"
      v-model="isChecked"
      :disabled="disabled"
      :class="[
        'rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-offset-0 transition-colors cursor-pointer disabled:cursor-not-allowed',
        sizeClasses,
        colorClasses,
      ]"
    />
    <span 
      v-if="label" 
      class="text-sm text-slate-700 dark:text-slate-200 select-none"
    >
      {{ label }}
    </span>
  </label>
</template>
