<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { computed, ref, onMounted } from "vue";

interface Props {
  modelValue?: string | Date | null;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: "Pilih Tanggal",
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: any];
}>();

const date = computed({
  get: () => {
    if (!props.modelValue) return null;
    return new Date(props.modelValue);
  },
  set: (val: any) => {
    if (!val) {
      emit("update:modelValue", null);
      return;
    }
    const d = new Date(val);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    emit("update:modelValue", `${year}-${month}-${day}`);
  },
});

// Manual formatter function to bypass the 'preprocessor' error and hide time
const formatManual = (d: Date) => {
  const day = d.getDate();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const isDark = ref(false);
onMounted(() => {
  if (typeof window !== "undefined") {
    isDark.value = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, { attributes: true });
  }
});
</script>

<template>
  <div class="space-y-2 date-only-wrapper">
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
        :enable-time-picker="false"
        :format="formatManual"
        :teleport="true"
        auto-apply
        :dark="isDark"
        menu-class-name="date-only-menu"
        class="dp-custom"
        :input-class-name="error ? 'dp-input-error' : ''"
        :placeholder="placeholder"
      />
    </div>

    <p v-if="error" class="text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<style>
/* CSS Global for teleported menu to prevent clipping and hide time */
.date-only-menu .dp__action_row, 
.date-only-menu .dp__button.dp__overlay_action {
  display: none !important;
}

.dp-custom {
  --dp-border-radius: 0.75rem;
  --dp-font-family: inherit;
  --dp-input-padding: 12px 30px 12px 12px;
}

.dp__input {
  padding-top: 12px;
  padding-bottom: 12px;
  border-radius: 0.75rem !important;
  background-color: transparent;
}

.dp-input-error {
  border-color: #ef4444 !important;
}
</style>
