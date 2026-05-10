<script setup lang="ts">
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import internshipLogbookService from "@/services/internship-logbook.service";

const props = defineProps<{
  modelValue: boolean;
  logbook?: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
}>();

const logbookService = internshipLogbookService();
const swal = useSwal();

const isSubmitting = ref(false);

const close = () => {
  emit("update:modelValue", false);
};

// Validation Schema
const schema = toTypedSchema(
  z.object({
    logDate: z
      .string()
      .or(z.date())
      .refine((val) => val !== null && val !== "", {
        message: "Tanggal wajib diisi",
      }),
    activities: z.string().min(10, "Aktivitas minimal 10 karakter"),
    progressStatus: z.enum(["in_progress", "done", "blocked"], {
      required_error: "Status progress wajib dipilih",
    }),
    blockers: z
      .string()
      .min(
        5,
        "Kendala wajib diisi, minimal 5 karakter (tulis 'Tidak ada' jika tidak ada)",
      ),
    planTomorrow: z.string().min(10, "Rencana besok minimal 10 karakter"),
    evidenceURL: z
      .string()
      .min(1, "Link bukti wajib diisi")
      .url("Format URL tidak valid"),
  }),
);

const { handleSubmit, errors, defineField, resetForm, setFieldValue } = useForm(
  {
    validationSchema: schema,
    initialValues: {
      logDate: new Date().toISOString().split("T")[0],
      activities: "",
      progressStatus: "in_progress" as "in_progress" | "done" | "blocked",
      blockers: "",
      planTomorrow: "",
      evidenceURL: "",
    },
  },
);

const [activities] = defineField("activities");
const [progressStatus] = defineField("progressStatus");
const [blockers] = defineField("blockers");
const [planTomorrow] = defineField("planTomorrow");
const [evidenceURL] = defineField("evidenceURL");

// Today's date (read-only for create mode)
const todayFormatted = computed(() => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
});

const progressStatusOptions = [
  { label: "In Progress (Sedang Dikerjakan)", value: "in_progress" },
  { label: "Done (Selesai)", value: "done" },
  { label: "Blocked (Terhambat)", value: "blocked" },
];

// Reset or populate form when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.logbook) {
        // Edit Mode
        setFieldValue("logDate", props.logbook.logDate);
        setFieldValue("activities", props.logbook.activities);
        setFieldValue("progressStatus", props.logbook.progressStatus || "in_progress");
        setFieldValue("blockers", props.logbook.blockers);
        setFieldValue("planTomorrow", props.logbook.planTomorrow);
        setFieldValue("evidenceURL", props.logbook.evidenceURL || props.logbook.evidenceUrl || "");
      } else {
        // Create Mode — date is auto today
        resetForm();
        setFieldValue("logDate", new Date().toISOString().split("T")[0]);
        setFieldValue("progressStatus", "in_progress");
      }
    }
  },
);

const onSubmit = handleSubmit(async (values) => {
  try {
    isSubmitting.value = true;

    const payload = {
      ...values,
      logDate:
        typeof values.logDate === "string"
          ? values.logDate
          : values.logDate.toISOString().split("T")[0],
    };

    if (props.logbook?.id) {
      await logbookService.updateLogbook(props.logbook.id, payload);
      swal.success("Berhasil", "Logbook berhasil diperbarui!");
    } else {
      await logbookService.submitLogbook(payload);
      swal.success("Berhasil", "Logbook berhasil disubmit!");
    }
    emit("refresh");
    close();
  } catch (error: any) {
    swal.error(
      "Gagal",
      error?.response?._data?.message || "Gagal submit logbook",
    );
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="props.logbook ? 'Edit Logbook Harian' : 'Isi Logbook Harian'"
    size="lg"
  >
    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Tanggal (Read-only, auto-filled) -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Tanggal Logbook
        </label>
        <div
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
        >
          <UiIcon
            name="mdi-calendar-check"
            size="sm"
            class="text-primary-500"
          />
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ todayFormatted }}
          </span>
        </div>
        <p class="text-xs text-slate-400">
          Tanggal diisi otomatis oleh sistem dan tidak dapat diubah.
        </p>
      </div>

      <!-- Aktivitas -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Aktivitas Hari Ini <span class="text-red-500">*</span>
        </label>
        <p class="text-xs text-slate-500 mb-2">
          Jelaskan apa saja yang Anda kerjakan hari ini secara detail.
        </p>
        <UiTextarea
          v-model="activities"
          placeholder="Contoh: Membuat tampilan frontend untuk fitur dashboard..."
          rows="3"
          :error="!!errors.activities"
        />
        <p v-if="errors.activities" class="text-sm text-red-500">
          {{ errors.activities }}
        </p>
      </div>

      <!-- Status Progress -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Status Progress <span class="text-red-500">*</span>
        </label>
        <UiSelect
          v-model="progressStatus"
          placeholder="Pilih status progress..."
          :options="progressStatusOptions"
          :error="!!errors.progressStatus"
        />
        <p v-if="errors.progressStatus" class="text-sm text-red-500">
          {{ errors.progressStatus }}
        </p>
      </div>

      <!-- Kendala -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Kendala (Blockers) <span class="text-red-500">*</span>
        </label>
        <p class="text-xs text-slate-500 mb-2">
          Ceritakan kendala yang dihadapi (jika tidak ada, tulis "Tidak ada").
        </p>
        <UiTextarea
          v-model="blockers"
          placeholder="Contoh: Kesulitan mengintegrasikan API pihak ketiga..."
          rows="2"
          :error="!!errors.blockers"
        />
        <p v-if="errors.blockers" class="text-sm text-red-500">
          {{ errors.blockers }}
        </p>
      </div>

      <!-- Rencana Besok -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Rencana Besok <span class="text-red-500">*</span>
        </label>
        <UiTextarea
          v-model="planTomorrow"
          placeholder="Contoh: Melanjutkan fitur X, testing fitur Y..."
          rows="2"
          :error="!!errors.planTomorrow"
        />
        <p v-if="errors.planTomorrow" class="text-sm text-red-500">
          {{ errors.planTomorrow }}
        </p>
      </div>

      <!-- Evidence URL -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Link Bukti (Evidence URL) <span class="text-red-500">*</span>
        </label>
        <UiInput
          v-model="evidenceURL"
          placeholder="https://..."
          :error="!!errors.evidenceURL"
        />
        <p v-if="errors.evidenceURL" class="text-sm text-red-500">
          {{ errors.evidenceURL }}
        </p>
      </div>

      <div
        class="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6 pt-6"
      >
        <button
          type="button"
          @click="close"
          class="px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-500 disabled:opacity-50"
        >
          <UiSpinner v-if="isSubmitting" size="sm" />
          <span>{{
            isSubmitting
              ? "Menyimpan..."
              : props.logbook
                ? "Simpan Perubahan"
                : "Submit Logbook"
          }}</span>
        </button>
      </div>
    </form>
  </UiModal>
</template>
