<script setup lang="ts">
/**
 * UiTextarea - Reusable textarea component with validation
 * 
 * Features:
 * - Vuetify-style: rules prop for inline validation
 * - Vee-validate: useField for form integration & real-time validation
 * - Auto-registers with UiForm when used inside one
 * - Auto-resize option
 */
import { useField } from 'vee-validate';

// Type for validation rule (same as Vuetify)
export type ValidationRule = (value: any) => boolean | string;

interface Props {
  modelValue?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  rows?: number;
  maxRows?: number;
  autoResize?: boolean;
  rules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  disabled: false,
  required: false,
  rows: 3,
  maxRows: 10,
  autoResize: false,
  rules: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// Use Vue's useId() for SSR-safe ID generation
const generatedId = useId();
const inputId = computed(() => props.id || `textarea-${generatedId}`);

// Field name must be stable - use name prop or generated id
const fieldName = props.name || `field-${generatedId}`;

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
  handleBlur: veeHandleBlur, 
  handleChange: veeHandleChange,
  resetField,
  validate: validateField,
  meta,
} = useField<string>(fieldName, validateWithRules, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true,
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

// Textarea ref for auto-resize
const textareaRef = ref<HTMLTextAreaElement>();

// Auto-resize logic
const adjustHeight = () => {
  if (!props.autoResize || !textareaRef.value) return;
  
  const textarea = textareaRef.value;
  textarea.style.height = 'auto';
  
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
  const maxHeight = lineHeight * props.maxRows;
  const minHeight = lineHeight * props.rows;
  
  const scrollHeight = textarea.scrollHeight;
  const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
  
  textarea.style.height = `${newHeight}px`;
};

// Handle input event
const onInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  fieldValue.value = value;
  veeHandleChange(event, true);
  nextTick(adjustHeight);
};

// Handle blur event
const onBlur = (event: Event) => {
  veeHandleBlur(event, true);
};

// Inject form context if available
const formContext = inject<{
  disabled: ComputedRef<boolean>;
} | null>('uiFormContext', null);

const isDisabled = computed(() => props.disabled || formContext?.disabled.value);

// Initial height adjustment
onMounted(() => {
  nextTick(adjustHeight);
});

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
    <textarea
      ref="textareaRef"
      :id="inputId"
      :name="fieldName"
      :value="fieldValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :required="required"
      :rows="rows"
      :class="[
        'w-full rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none px-4 py-2.5 text-sm',
        autoResize ? 'overflow-hidden' : 'overflow-auto',
        errorMessage 
          ? 'border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20' 
          : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500/20',
      ]"
      @input="onInput"
      @blur="onBlur"
    />
    <p v-if="errorMessage" class="text-sm text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>
