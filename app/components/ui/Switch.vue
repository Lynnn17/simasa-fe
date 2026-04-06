<script setup lang="ts">
/**
 * UiSwitch - Toggle switch component
 * Supports two layouts:
 * - inline: label next to switch (default)
 * - stacked: label above switch (for form consistency)
 */
interface Props {
  modelValue?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  layout?: 'inline' | 'stacked';
  valueText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
  color: 'primary',
  layout: 'inline',
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "change": [value: boolean];
}>();

const generatedId = useId();
const switchId = computed(() => props.id || `switch-${generatedId}`);

const isOn = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
    emit('change', val);
  },
});

// Size classes for the track
const trackSizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7',
  };
  return sizes[props.size] || sizes.md;
});

// Size classes for the thumb
const thumbSizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  return sizes[props.size] || sizes.md;
});

// Translate classes for the thumb when on
const thumbTranslateClasses = computed(() => {
  const translates: Record<string, string> = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-7',
  };
  return translates[props.size] || translates.md;
});

// Color classes for the track when on
const colorClasses = computed(() => {
  const colors: Record<string, string> = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
  };
  return colors[props.color] || colors.primary;
});
</script>

<template>
  <!-- Stacked layout (form-compatible) -->
  <div v-if="layout === 'stacked'" class="space-y-2">
    <label
      v-if="label"
      :for="switchId"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ label }}
    </label>
    <div class="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        :id="switchId"
        :aria-checked="isOn"
        :disabled="disabled"
        @click="isOn = !isOn"
        :class="[
          'relative inline-flex shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          trackSizeClasses,
          isOn ? colorClasses : 'bg-slate-200 dark:bg-slate-600',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ]"
      >
        <span
          :class="[
            'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            thumbSizeClasses,
            isOn ? thumbTranslateClasses : 'translate-x-0',
          ]"
        />
      </button>
      <span v-if="valueText" class="text-sm text-slate-600 dark:text-slate-400">
        {{ valueText }}
      </span>
    </div>
    <p v-if="hint" class="text-sm text-slate-500 dark:text-slate-400">
      {{ hint }}
    </p>
  </div>

  <!-- Inline layout (original) -->
  <label 
    v-else
    :for="switchId" 
    class="inline-flex items-center gap-3 cursor-pointer select-none" 
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <button
      type="button"
      role="switch"
      :id="switchId"
      :aria-checked="isOn"
      :disabled="disabled"
      @click="isOn = !isOn"
      :class="[
        'relative inline-flex shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        trackSizeClasses,
        isOn ? colorClasses : 'bg-slate-200 dark:bg-slate-600',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ]"
    >
      <span
        :class="[
          'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          thumbSizeClasses,
          isOn ? thumbTranslateClasses : 'translate-x-0',
        ]"
      />
    </button>
    <span 
      v-if="label" 
      class="text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {{ label }}
    </span>
  </label>
</template>
