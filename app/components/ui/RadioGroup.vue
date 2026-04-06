<script setup lang="ts">
/**
 * UiRadioGroup - Reusable radio group component with validation
 * 
 * Features:
 * - Groups multiple radio buttons
 * - Validation support with rules prop
 * - Horizontal or vertical layout
 * - vee-validate integration
 */
import { useField } from 'vee-validate';

export type ValidationRule = (value: any) => boolean | string;

interface RadioOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number | boolean;
  name?: string;
  label?: string;
  options?: RadioOption[];
  disabled?: boolean;
  required?: boolean;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  rules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  inline: false,
  size: 'md',
  color: 'primary',
  options: () => [],
  rules: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | boolean];
}>();

const generatedId = useId();
const fieldName = props.name || `radiogroup-${generatedId}`;

// Convert Vuetify-style rules to vee-validate validator
const validateWithRules = (value: any): boolean | string => {
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
  resetField,
  validate: validateField,
  meta,
} = useField<string | number | boolean>(fieldName, validateWithRules, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true,
  validateOnMount: false,
});

// Sync modelValue -> fieldValue
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined && newVal !== fieldValue.value) {
    fieldValue.value = newVal;
  }
}, { immediate: true });

// Sync fieldValue -> modelValue
watch(fieldValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

const handleChange = (value: string | number | boolean) => {
  fieldValue.value = value;
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
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Slot for custom radio buttons -->
    <div 
      :class="[
        inline ? 'flex flex-wrap gap-4' : 'space-y-2',
      ]"
    >
      <!-- Default slot for custom content -->
      <slot :value="fieldValue" :on-change="handleChange">
        <!-- Render options if provided -->
        <UiRadio
          v-for="option in options"
          :key="String(option.value)"
          :model-value="fieldValue"
          :value="option.value"
          :label="option.label"
          :name="fieldName"
          :disabled="isDisabled || option.disabled"
          :size="size"
          :color="color"
          @update:model-value="handleChange"
        />
      </slot>
    </div>
    
    <p v-if="errorMessage" class="text-sm text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>
