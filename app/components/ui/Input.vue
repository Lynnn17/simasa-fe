<script setup lang="ts">
/**
 * UiInput - Hybrid Vuetify-style + vee-validate input
 * 
 * Features:
 * - Vuetify-style: rules prop for inline validation
 * - Vee-validate: useField for form integration & real-time validation
 * - Auto-registers with UiForm when used inside one
 */
import { useField } from 'vee-validate';

// Type for validation rule (same as Vuetify)
export type ValidationRule = (value: any) => boolean | string;

interface Props {
  modelValue?: string | number;
  name?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  rules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  modelValue: "",
  disabled: false,
  required: false,
  size: 'md',
  clearable: false,
  rules: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  "clear": [];
}>();

// Use Vue's useId() for SSR-safe ID generation
const generatedId = useId();
const inputId = computed(() => props.id || `input-${generatedId}`);

// Field name must be stable - use name prop or generated id
const fieldName = props.name || `field-${generatedId}`;

// Convert Vuetify-style rules to vee-validate validator
const validateWithRules = (value: any): boolean | string => {
  // Re-evaluate rules each time (they might be reactive/computed)
  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      return typeof result === 'string' ? result : 'Invalid value';
    }
  }
  return true;
};

// Use vee-validate's useField for form integration
const { 
  value: fieldValue, 
  errorMessage, 
  handleBlur: veeHandleBlur, 
  handleChange: veeHandleChange,
  resetField,
  validate: validateField,
  meta,
} = useField<string | number>(fieldName, validateWithRules, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true, // Enable real-time validation
  validateOnMount: false,
});

// Sync modelValue -> fieldValue
watch(() => props.modelValue, (newVal) => {
  if (newVal !== fieldValue.value) {
    fieldValue.value = newVal;
  }
}, { immediate: true });

// Sync fieldValue -> modelValue
watch(fieldValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

// Size classes
const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  return sizes[props.size] || sizes.md;
});

// Check if value is not empty
const hasValue = computed(() => {
  return fieldValue.value !== '' && fieldValue.value !== null && fieldValue.value !== undefined;
});

// Handle input event
const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  fieldValue.value = value;
  veeHandleChange(event, true); // true = should validate
};

// Handle blur event
const onBlur = (event: Event) => {
  veeHandleBlur(event, true); // true = should validate
};

// Clear input value
const handleClear = () => {
  fieldValue.value = '';
  emit('update:modelValue', '');
  emit('clear');
};

// Inject form context if available
const formContext = inject<{
  disabled: ComputedRef<boolean>;
} | null>('uiFormContext', null);

const isDisabled = computed(() => props.disabled || formContext?.disabled.value);

// Expose methods
defineExpose({ 
  validate: validateField, 
  reset: resetField,
  meta,
});
</script>

<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div v-if="$slots.prefix" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <slot name="prefix" />
      </div>
      <input
        :id="inputId"
        :name="fieldName"
        :type="type"
        :value="fieldValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :required="required"
        :class="[
          'w-full rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses,
          { 'pl-11': $slots.prefix },
          { 'pr-11': $slots.suffix && !(clearable && hasValue) },
          { 'pr-20': $slots.suffix && clearable && hasValue },
          { 'pr-10': clearable && hasValue && !$slots.suffix },
          // Error state - always show red border when error exists
          errorMessage 
            ? 'border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500/20',
        ]"
        @input="onInput"
        @blur="onBlur"
      />
      <!-- Right side icons container -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <!-- Clear button -->
        <button
          v-if="clearable && hasValue && !isDisabled"
          type="button"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          @click="handleClear"
        >
          <i class="mdi mdi-close text-lg" />
        </button>
        <!-- Suffix slot -->
        <div v-if="$slots.suffix" class="text-slate-400">
          <slot name="suffix" />
        </div>
      </div>
    </div>
    <p v-if="errorMessage" class="text-sm text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>
