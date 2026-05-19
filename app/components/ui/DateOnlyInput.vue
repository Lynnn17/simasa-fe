<script setup lang="ts">
interface Props {
  modelValue?: string | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
}>();

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value || null);
};
</script>

<template>
  <div class="space-y-1">
    <label
      v-if="label"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      type="date"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 text-sm transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      @input="onInput"
    />
  </div>
</template>
