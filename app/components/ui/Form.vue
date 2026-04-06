<script setup lang="ts">
/**
 * UiForm - Vuetify-style form wrapper powered by vee-validate
 * 
 * Combines the best of both worlds:
 * - Vuetify-style: rules prop on each field
 * - Vee-validate: form state management, validation, touched/dirty tracking
 * 
 * Usage:
 * <UiForm ref="formRef" v-model="isValid" @submit="onSubmit">
 *   <UiInput v-model="name" :rules="[v => !!v || 'Required']" />
 * </UiForm>
 */
import { useForm } from 'vee-validate';

interface Props {
  modelValue?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'submit': [values: Record<string, any>];
}>();

// Use vee-validate's form management
const { handleSubmit, resetForm, values, meta, setFieldError, validate } = useForm();

// Watch form validity and emit
watch(() => meta.value.valid, (valid) => {
  emit('update:modelValue', valid);
}, { immediate: true });

// Provide form context to child components
provide('uiFormContext', {
  disabled: computed(() => props.disabled),
  setFieldError,
});

// Handle form submit
const onFormSubmit = handleSubmit((formValues) => {
  emit('submit', formValues);
});

// Manual validation
const validateForm = async (): Promise<boolean> => {
  const result = await validate();
  return result.valid;
};

// Reset form
const reset = () => {
  resetForm();
};

// Reset validation only (clear errors)
const resetValidation = () => {
  resetForm({ values: values });
};

// Expose methods to parent
defineExpose({
  validate: validateForm,
  reset,
  resetValidation,
  values,
  isValid: computed(() => meta.value.valid),
});
</script>

<template>
  <form @submit.prevent="onFormSubmit" novalidate>
    <slot />
  </form>
</template>
