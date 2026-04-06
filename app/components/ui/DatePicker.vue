<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface Props {
  modelValue?: any;
  mode?: 'date' | 'datetime' | 'time' | 'month' | 'year';
  range?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  mode: 'date',
  range: false,
  placeholder: "Select Date",
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
}>();

const date = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Sync dark mode
const isDark = ref(false);

onMounted(() => {
    if (typeof window !== 'undefined') {
        isDark.value = document.documentElement.classList.contains('dark');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    isDark.value = document.documentElement.classList.contains('dark');
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    }
});

const dpTheme = computed(() => {
    return isDark.value ? 'dark' : 'light';
});

const formats = computed(() => {
    const isDate = props.mode === 'date';
    const isDatetime = props.mode === 'datetime';
    const isTime = props.mode === 'time';
    const isMonth = props.mode === 'month';
    const isYear = props.mode === 'year';

    const formatStr = isDate ? 'yyyy-MM-dd' : (isDatetime ? 'yyyy-MM-dd HH:mm' : (isTime ? 'HH:mm' : (isMonth ? 'MM/yyyy' : 'yyyy')));

    return {
        input: formatStr,
    };
});

const flow = computed<any>(() => {
    if (props.mode === 'date') return ['calendar'];
    if (props.mode === 'month') return ['month', 'year'];
    if (props.mode === 'year') return ['year'];
    if (props.mode === 'time') return ['time'];
    return ['calendar', 'time'];
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

    <div :class="{ 'has-error': error }">
        <VueDatePicker
            v-model="date"
            :enable-time-picker="mode === 'datetime' || mode === 'time'"
            :time-picker="mode === 'time'"
            :month-picker="mode === 'month'"
            :year-picker="mode === 'year'"
            :range="range"
            :placeholder="placeholder"
            :dark="dpTheme === 'dark'"
            :formats="formats"
            :flow="flow"
            :model-type="mode === 'date' ? 'yyyy-MM-dd' : (mode === 'datetime' ? 'yyyy-MM-dd HH:mm:ss' : undefined)"
            auto-apply
            class="dp-custom"
            :class="{ 'hide-time-icon': mode === 'date' }"
            :input-class-name="error ? 'dp-input-error' : ''"
        >
        </VueDatePicker>
    </div>

    <p v-if="error" class="text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<style>
/* Custom overrides to match theme better if needed */
.dp-custom {
    --dp-border-radius: 0.75rem; /* rounded-xl */
    --dp-font-family: inherit;
    --dp-input-padding: 12px 30px 12px 12px;
}

.dp-input-error {
    border-color: #ef4444 !important; /* red-500 */
}

/* Fix input height to match other inputs (py-3 approx 46-48px) */
.dp__input {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: transparent;
}

/* Force hide time icon in date mode if it appears */
.hide-time-icon .dp__action_row svg {
    display: none !important;
}

/* Clean up input icon padding */
.dp__input_icon_pad {
    padding-left: 35px;
}
</style>
