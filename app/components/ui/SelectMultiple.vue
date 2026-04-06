<script setup lang="ts">
/**
 * UiSelectMultiple - Multi-select with chips display
 */
import { useField } from 'vee-validate';

export type ValidationRule = (value: any) => boolean | string;

interface Props {
  modelValue?: (string | number)[];
  name?: string;
  options?: any[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  itemValue?: string;
  itemTitle?: string;
  rules?: ValidationRule[];
  chipColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'slate';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  placeholder: "Pilih...",
  disabled: false,
  required: false,
  size: 'md',
  itemValue: 'value',
  itemTitle: 'label',
  rules: () => [],
  chipColor: 'primary',
});

const emit = defineEmits<{
  "update:modelValue": [value: (string | number)[]];
  "change": [value: (string | number)[]];
}>();

const isOpen = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

// Stable field name
const generatedId = useId();
const selectId = computed(() => props.id || `select-multi-${generatedId}`);
const fieldName = props.name || `select-multi-${generatedId}`;

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
} = useField<(string | number)[]>(fieldName, validateWithRules, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true,
  validateOnMount: false,
});

// Sync modelValue -> fieldValue
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(fieldValue.value)) {
    fieldValue.value = newVal || [];
  }
}, { immediate: true });

// Sync fieldValue -> modelValue
watch(fieldValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
    emit('update:modelValue', newVal || []);
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

// Get option value/title
const getOptionValue = (option: any): string | number => {
  if (typeof option === 'object' && option !== null) {
    return option[props.itemValue];
  }
  return option;
};

const getOptionTitle = (option: any): string => {
  if (typeof option === 'object' && option !== null) {
    return option[props.itemTitle];
  }
  return String(option);
};

// Selected items
const selectedItems = computed(() => {
  if (!fieldValue.value || fieldValue.value.length === 0) return [];
  
  return fieldValue.value.map((val) => {
    const option = props.options.find((opt) => getOptionValue(opt) === val);
    return {
      value: val,
      title: option ? getOptionTitle(option) : String(val),
    };
  });
});

// Check if option is selected
const isSelected = (option: any): boolean => {
  const val = getOptionValue(option);
  return fieldValue.value?.includes(val) || false;
};

// Toggle option selection
const toggleOption = (option: any) => {
  const val = getOptionValue(option);
  const currentValues = [...(fieldValue.value || [])];
  
  const index = currentValues.indexOf(val);
  if (index > -1) {
    currentValues.splice(index, 1);
  } else {
    currentValues.push(val);
  }
  
  fieldValue.value = currentValues;
  nextTick(() => {
    emit('change', currentValues);
  });
};

// Remove chip
const removeChip = (val: string | number, event: Event) => {
  event.stopPropagation();
  const currentValues = [...(fieldValue.value || [])];
  const index = currentValues.indexOf(val);
  if (index > -1) {
    currentValues.splice(index, 1);
    fieldValue.value = currentValues;
    nextTick(() => {
      emit('change', currentValues);
    });
  }
};

// Toggle dropdown
const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'min-h-[32px] text-sm',
    md: 'min-h-[40px] text-sm',
    lg: 'min-h-[48px] text-base',
  };
  return sizes[props.size];
});

// Chip color classes
const chipColorClasses = computed(() => {
  const colors = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  };
  return colors[props.chipColor];
});

// Input wrapper classes
const inputClasses = computed(() => {
  const base = 'w-full flex flex-wrap items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-all duration-200 cursor-pointer';
  
  let stateClass = '';
  if (errorMessage.value) {
    stateClass = 'border-red-500 ring-2 ring-red-500/20';
  } else if (isOpen.value) {
    stateClass = 'border-primary-500 ring-2 ring-primary-500/20';
  } else {
    stateClass = 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500';
  }
  
  const bgClass = props.disabled 
    ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed opacity-60'
    : 'bg-white dark:bg-slate-800';
  
  return `${base} ${stateClass} ${bgClass} ${sizeClasses.value}`;
});

// Expose for form
defineExpose({
  reset: resetField,
  validate: validateField,
  resetValidation: () => resetField({ value: fieldValue.value }),
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="selectId"
      class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    
    <!-- Select wrapper -->
    <div ref="wrapperRef" class="relative">
      <!-- Input display -->
      <div
        :id="selectId"
        :class="inputClasses"
        @click="toggleDropdown"
      >
        <!-- Selected chips -->
        <template v-if="selectedItems.length > 0">
          <span
            v-for="item in selectedItems"
            :key="item.value"
            :class="[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              chipColorClasses
            ]"
          >
            {{ item.title }}
            <button
              type="button"
              class="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
              @click="removeChip(item.value, $event)"
            >
              <i class="mdi mdi-close text-xs"></i>
            </button>
          </span>
        </template>
        
        <!-- Placeholder -->
        <span 
          v-else
          class="text-slate-400 dark:text-slate-500"
        >
          {{ placeholder }}
        </span>
        
        <!-- Dropdown arrow -->
        <span class="ml-auto flex-shrink-0">
          <i 
            :class="[
              'mdi text-slate-400 transition-transform duration-200',
              isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'
            ]"
          ></i>
        </span>
      </div>
      
      <!-- Dropdown -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-show="isOpen"
          class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          <div
            v-for="option in options"
            :key="getOptionValue(option)"
            :class="[
              'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors',
              isSelected(option) 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
            ]"
            @click="toggleOption(option)"
          >
            <!-- Checkbox indicator -->
            <span 
              :class="[
                'flex items-center justify-center w-4 h-4 border rounded transition-colors',
                isSelected(option)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              ]"
            >
              <i v-if="isSelected(option)" class="mdi mdi-check text-xs"></i>
            </span>
            
            <span class="text-sm">{{ getOptionTitle(option) }}</span>
          </div>
          
          <!-- Empty state -->
          <div 
            v-if="options.length === 0"
            class="px-3 py-4 text-center text-sm text-slate-400"
          >
            Tidak ada opsi
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Error message -->
    <p 
      v-if="errorMessage"
      class="mt-1 text-sm text-red-500"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
