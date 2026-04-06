<script setup lang="ts">
/**
 * UiRadio - Reusable radio button component
 * 
 * Features:
 * - Single radio button with label
 * - Custom styling
 * - Disabled state
 * - Works with v-model on parent RadioGroup
 */

interface Props {
  modelValue?: string | number | boolean;
  value: string | number | boolean;
  label?: string;
  name?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
  color: 'primary',
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | boolean];
}>();

const generatedId = useId();
const radioId = computed(() => `radio-${generatedId}`);

const isChecked = computed(() => props.modelValue === props.value);

const handleChange = () => {
  if (!props.disabled) {
    emit('update:modelValue', props.value);
  }
};

// Size classes
const sizeClasses = computed((): { radio: string; label: string } => {
  const sizes = {
    sm: { radio: 'w-4 h-4', label: 'text-sm' },
    md: { radio: 'w-5 h-5', label: 'text-sm' },
    lg: { radio: 'w-6 h-6', label: 'text-base' },
  };
  return sizes[props.size];
});

// Color classes
const colorClasses = computed(() => {
  const colors: Record<string, string> = {
    primary: 'text-primary-600 focus:ring-primary-500',
    success: 'text-emerald-600 focus:ring-emerald-500',
    warning: 'text-amber-600 focus:ring-amber-500',
    error: 'text-red-600 focus:ring-red-500',
  };
  return colors[props.color] || colors.primary;
});
</script>

<template>
  <label 
    :for="radioId"
    :class="[
      'inline-flex items-center gap-3 cursor-pointer',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <input
      :id="radioId"
      type="radio"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :class="[
        'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-slate-900 transition-colors',
        sizeClasses.radio,
        colorClasses,
      ]"
      @change="handleChange"
    />
    <span 
      v-if="label || $slots.default" 
      :class="[
        'text-slate-700 dark:text-slate-300',
        sizeClasses.label,
      ]"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
