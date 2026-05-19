<script setup lang="ts">
import internshipTaskService from "@/services/internship-task.service";

const props = defineProps<{
  modelValue: boolean;
  task: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const close = () => {
  emit("update:modelValue", false);
};

const taskSvc = internshipTaskService();
const taskFiles = ref<any[]>([]);
const isLoadingFiles = ref(false);

const loadTaskFiles = async () => {
  if (!props.task?.id) return;
  try {
    isLoadingFiles.value = true;
    const res: any = await taskSvc.getTaskFiles(props.task.id);
    taskFiles.value = res?.data || [];
  } catch (error) {
    console.error("Failed to load task files", error);
  } finally {
    isLoadingFiles.value = false;
  }
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadTaskFiles();
    }
  },
);

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "graded":
      return "success";
    case "submitted":
      return "warning";
    case "revision_needed":
      return "danger";
    case "assigned":
    default:
      return "neutral";
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case "assigned":
      return "Baru Ditugaskan";
    case "submitted":
      return "Menunggu Penilaian";
    case "graded":
      return "Lulus/Dinilai";
    case "revision_needed":
      return "Butuh Revisi";
    default:
      return status || "Assigned";
  }
};

const linkify = (text: string) => {
  if (!text) return "-";
  // Escape HTML first for security
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return escapedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">${url}</a>`;
  });
};
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Detail Tugas"
    size="lg"
  >
    <div v-if="task" class="space-y-6">
      <!-- Header Info -->
      <div
        class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800"
      >
        <div>
          <h3 class="font-medium text-slate-900 dark:text-white text-lg">
            {{ task.title }}
          </h3>

          <p class="text-sm text-slate-500">
            Tenggat Waktu:
            <span class="font-medium text-slate-700 dark:text-slate-300">{{
              task.deadline
                ? new Date(task.deadline).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"
            }}</span>
          </p>
        </div>
        <UiBadge :variant="getStatusBadgeVariant(task.status)">
          {{ getStatusLabel(task.status) }}
        </UiBadge>
      </div>

      <!-- Deskripsi -->
      <div>
        <h4
          class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2"
        >
          Instruksi Tugas
        </h4>
        <div
          class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed"
          v-html="linkify(task.description)"
        ></div>
      </div>

      <!-- File yang dikumpulkan -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h4
            class="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white"
          >
            File yang Dikumpulkan
          </h4>
          <button
            v-if="taskFiles.length > 0"
            @click="taskSvc.downloadAll(task.id)"
            class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <UiIcon name="mdi-download" size="sm" />
            Download Semua (.zip)
          </button>
        </div>

        <div v-if="isLoadingFiles" class="flex justify-center py-8">
          <UiSpinner size="md" />
        </div>

        <div
          v-else-if="taskFiles.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          <div
            v-for="(file, index) in taskFiles"
            :key="index"
            class="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
          >
            <img
              :src="taskSvc.getFileUrl(file.fileUrl)"
              class="w-full h-full object-cover cursor-pointer"
              @click="window.open(taskSvc.getFileUrl(file.fileUrl), '_blank')"
            />
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
            >
              <a
                :href="taskSvc.getFileUrl(file.fileUrl)"
                target="_blank"
                class="p-1.5 bg-white text-slate-900 rounded-full hover:bg-slate-100 shadow-lg"
                title="Lihat Full"
              >
                <UiIcon name="mdi-eye" size="sm" />
              </a>
              <a
                :href="taskSvc.getFileUrl(file.fileUrl)"
                download
                class="p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 shadow-lg"
                title="Download"
              >
                <UiIcon name="mdi-download" size="sm" />
              </a>
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-sm text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
        >
          Belum ada file yang dikumpulkan.
        </div>
      </div>

      <!-- Area Penilaian (Feedback & Score) -->
      <div v-if="task.status === 'graded' || task.status === 'revision_needed'">
        <h4
          class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2"
        >
          Hasil Penilaian
        </h4>
        <div
          class="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-700"
        >
          <div
            class="bg-slate-50 px-4 py-3 border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 flex justify-between items-center"
          >
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300"
              >Skor Penilaian:</span
            >
            <span
              class="text-lg font-bold"
              :class="
                task.status === 'graded'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              "
            >
              {{
                task.grade !== null && task.grade !== undefined
                  ? task.grade
                  : "0"
              }}
              / 100
            </span>
          </div>
          <div class="p-4 bg-white dark:bg-slate-900">
            <p
              class="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold"
            >
              Feedback Mentor:
            </p>
            <p
              class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
            >
              {{ task.feedback || "Tidak ada catatan." }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end w-full">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="close"
        >
          Tutup
        </button>
      </div>
    </template>
  </UiModal>
</template>
