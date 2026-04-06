<script setup lang="ts">
/**
 * UiAutocomplete - Hybrid Vuetify-style + vee-validate autocomplete
 */
import { useField } from 'vee-validate';

export type ValidationRule = (value: any) => boolean | string;

interface Props {
  modelValue?: string | number | null;
  name?: string;
  options?: any[];
  label?: string;
  placeholder?: string;
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
  placeholder: "Cari...",
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
  "search": [query: string];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// Stable field name
const generatedId = useId();
const autocompleteId = computed(() => props.id || `autocomplete-${generatedId}`);
const fieldName = props.name || `autocomplete-${generatedId}`;

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

// Use vee-validate
const { 
  value: fieldValue, 
  errorMessage, 
  handleBlur: veeHandleBlur,
  resetField,
  validate: validateField,
  meta,
} = useField<string | number | null>(fieldName, validateWithRules, {
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

// Click outside - close and validate
const handleClickOutside = (event: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    if (isOpen.value) {
      isOpen.value = false;
      veeHandleBlur(new Event('blur'));
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
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
  if (!searchQuery.value) return props.options;
  
  if (selectedOption.value && searchQuery.value === getItemTitle(selectedOption.value)) {
    return props.options;
  }
  
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) =>
    getItemTitle(option).toLowerCase().includes(query)
  );
});

// Scroll to selected on open
watch(isOpen, async (val) => {
  if (val && fieldValue.value) {
    await nextTick();
    const selectedButton = wrapperRef.value?.querySelector('button[data-selected="true"]');
    selectedButton?.scrollIntoView({ block: 'nearest' });
  }
});

// Selected option
const selectedOption = computed(() => {
  return props.options.find((opt) => getItemValue(opt) === fieldValue.value) || null;
});

// Sync search query with selected value - watch both fieldValue and options
watch([() => fieldValue.value, () => props.options], ([newVal, options]) => {
  if (newVal && options.length > 0) {
    const selected = options.find((opt: any) => getItemValue(opt) === newVal);
    if (selected) {
      searchQuery.value = getItemTitle(selected);
    }
  } else if (!newVal) {
    searchQuery.value = "";
  }
}, { immediate: true });

const handleInput = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;
  isOpen.value = true;
  emit("search", query);
  
  if (query === '' && fieldValue.value) {
    fieldValue.value = null;
    emit("update:modelValue", null);
    nextTick(() => {
      emit("change", null);
    });
  }
};

const handleSelect = (option: any) => {
  const value = getItemValue(option);
  fieldValue.value = value;
  // Emit modelValue update FIRST (synchronous)
  emit("update:modelValue", value);
  // Then emit change after a tick to ensure parent gets the value
  nextTick(() => {
    emit("change", option);
  });
  isOpen.value = false;
  searchQuery.value = getItemTitle(option);
};

const handleClear = () => {
  fieldValue.value = null;
  emit("update:modelValue", null);
  nextTick(() => {
    emit("change", null);
  });
  searchQuery.value = "";
};

const handleFocus = () => {
  if (!props.disabled) {
    isOpen.value = true;
  }
};

// Size classes
const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  return sizes[props.size] || sizes.md;
});

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
      <div class="relative">
        <input
          ref="inputRef"
          type="text"
          :value="searchQuery"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :class="[
            'w-full rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses,
            // Error state - persistent red border
            errorMessage 
              ? 'border-red-500 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500/20',
            clearable && fieldValue ? 'pr-16' : 'pr-10'
          ]"
          @input="handleInput"
          @focus="handleFocus"
        />
        
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            v-if="clearable && fieldValue && !isDisabled"
            type="button"
            class="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            @click="handleClear"
          >
            <i class="mdi mdi-close text-lg" />
          </button>
          
          <svg
            class="w-5 h-5 text-slate-400 transition-transform duration-200 pointer-events-none"
            :class="{ 'rotate-180': isOpen }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
             <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen && filteredOptions.length > 0"
          class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto"
        >
          <ul class="py-1">
            <li v-for="(option, index) in filteredOptions" :key="getItemValue(option) || index">
              <button
                type="button"
                :data-selected="fieldValue === getItemValue(option)"
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
