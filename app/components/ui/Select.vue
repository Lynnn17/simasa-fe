<script setup lang="ts">
/**
 * UiSelect - Hybrid Vuetify-style + vee-validate select
 */
import { useField } from 'vee-validate';

export type ValidationRule = (value: any) => boolean | string;

interface Props {
  modelValue?: string | number | null;
  name?: string;
  options?: any[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  itemValue?: string;
  itemTitle?: string;
  rules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  placeholder: "Pilih...",
  searchable: false,
  disabled: false,
  required: false,
  size: 'md',
  clearable: false,
  itemValue: 'value',
  itemTitle: 'label',
  rules: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  "change": [option: any | null];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const wrapperRef = ref<HTMLElement | null>(null);

// Stable field name
const generatedId = useId();
const selectId = computed(() => props.id || `select-${generatedId}`);
const fieldName = props.name || `select-${generatedId}`;

// Validation function
const validateWithRules = (value: any): boolean | string => {
  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      return typeof result === 'string' ? result : 'Invalid value';
    }
  }
  return true;
};

const fieldValidator = props.rules.length > 0 ? validateWithRules : undefined;

// Use vee-validate
const { 
  value: fieldValue, 
  errorMessage, 
  handleBlur: veeHandleBlur,
  resetField,
  validate: validateField,
  meta,
} = useField<string | number | null>(fieldName, fieldValidator, {
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

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
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

// Helpers
const getItemValue = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.itemValue];
  }
  return option;
};

const getItemTitle = (option: any) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.itemTitle];
  }
  return String(option);
};

// Filtered options
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) =>
    getItemTitle(option).toLowerCase().includes(query)
  );
});

// Selected option
const selectedOption = computed(() => {
  if (fieldValue.value === null || fieldValue.value === undefined) return null;
  return props.options.find((opt) => getItemValue(opt) === fieldValue.value) || null;
});

const displayText = computed(() => {
  const opt = selectedOption.value;
  if (opt) return getItemTitle(opt);
  return props.placeholder;
});

const hasValue = computed(() => {
  return fieldValue.value !== null && fieldValue.value !== undefined && fieldValue.value !== '';
});

const handleSelect = (option: any) => {
  const value = getItemValue(option);
  if (value === fieldValue.value) {
    isOpen.value = false;
    return;
  }
  fieldValue.value = value;
  emit("update:modelValue", value);
  nextTick(() => {
    emit("change", option);
  });
  isOpen.value = false;
  searchQuery.value = "";
};

const handleClear = (event: MouseEvent) => {
  event.stopPropagation();
  if (fieldValue.value === null) return;
  fieldValue.value = null;
  emit("update:modelValue", null);
  nextTick(() => {
    emit("change", null);
  });
};

const toggleDropdown = () => {
  if (props.disabled) return;
  
  // Validate on close (blur-like)
  if (isOpen.value) {
    veeHandleBlur(new Event('blur'));
  }
  
  isOpen.value = !isOpen.value;
  
  if (isOpen.value && props.searchable) {
    setTimeout(() => {
      const searchInput = wrapperRef.value?.querySelector("input");
      searchInput?.focus();
    }, 50);
  }
};

// Form context
const formContext = inject<{
  disabled: ComputedRef<boolean>;
} | null>('uiFormContext', null);

const isDisabled = computed(() => props.disabled || formContext?.disabled.value);

defineExpose({ validate: validateField, reset: resetField, meta });
</script>

<template>
  <div ref="wrapperRef" class="space-y-2 relative">
    <label v-if="label" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <button
        type="button"
        @click="toggleDropdown"
        :disabled="isDisabled"
        :class="[
          'w-full flex items-center justify-between rounded-lg border bg-white dark:bg-slate-800 text-left transition-all duration-200 focus:outline-none focus:ring-2',
          sizeClasses,
          // Error state - persistent red border
          errorMessage
            ? 'border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500/20 focus:border-primary-500',
          isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-500',
          selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500',
          clearable && hasValue ? 'pr-16' : 'pr-10',
        ]"
      >
        <span class="truncate block">{{ displayText }}</span>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            v-if="clearable && hasValue && !isDisabled"
            type="button"
            class="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            @click="handleClear"
          >
            <i class="mdi mdi-close text-lg" />
          </button>
          <svg
            class="w-5 h-5 text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-hidden flex flex-col"
        >
          <div v-if="searchable" class="p-2 border-b border-slate-100 dark:border-slate-700">
            <input
              v-model="searchQuery"
              type="text"
              class="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Cari..."
              @click.stop
            />
          </div>

          <ul class="flex-1 overflow-y-auto py-1">
            <li v-if="filteredOptions.length === 0" class="px-4 py-3 text-sm text-slate-500 text-center">
              Tidak ditemukan
            </li>
            <li v-for="option in filteredOptions" :key="getItemValue(option)">
              <button
                type="button"
                @click="handleSelect(option)"
                :class="[
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left',
                  fieldValue === getItemValue(option)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                ]"
              >
                <span>{{ getItemTitle(option) }}</span>
                <i v-if="fieldValue === getItemValue(option)" class="mdi mdi-check text-primary-500" />
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
  </div>
</template>
