<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipTaskService from "@/services/internship-task.service";

const authStore = useAuthStore();
const taskSvc = internshipTaskService();
const studentId = computed(() => authStore.user?.id);
const route = useRoute();
const swal = useSwal();

const hasFilter = computed(() => {
  return !!(route.query.q || route.query.status);
});

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});
const isLoading = ref(false);

const isSubmitModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedTask = ref<any>(null);

const headers = computed(() => [
  { key: "title", title: "Judul Tugas", sortable: true },
  { key: "mentorName", title: "Mentor", sortable: true },
  { key: "deadline", title: "Deadline", sortable: true },
  { key: "status", title: "Status", align: "center" },
  { key: "grade", title: "Nilai", align: "center" },
  { key: "submissionUrl", title: "Link Bukti", align: "center" },
  { key: "actions", title: "Aksi", align: "center", width: "15%" },
]);

const filterSchema = computed(() => [
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari judul tugas...",
    colMd: 8,
  },
  {
    name: "status",
    type: "select" as const,
    placeholder: "Semua Status",
    items: "statusOptions",
    colMd: 4,
  },
]);

const filterList = {
  statusOptions: [
    { label: "Semua Status", value: "" },
    { label: "Baru Ditugaskan", value: "assigned" },
    { label: "Menunggu Penilaian", value: "submitted" },
    { label: "Lulus/Dinilai", value: "graded" },
    { label: "Butuh Revisi", value: "revision_needed" },
  ],
};

async function loadData() {
  if (!studentId.value) return;

  const { pageNumber, pageSize, q, status } = route.query;
  isLoading.value = true;

  try {
    const params = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      search: q || "",
      status: status || "",
    };

    const res: any = await taskSvc.getTasksByStudent(studentId.value, params);
    tableData.value = {
      items: res?.data?.items || [],
      meta: res?.data?.meta || { totalItems: 0 },
    };
  } catch (error) {
    console.error("Failed to load student tasks", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

const handleAction = (task: any) => {
  selectedTask.value = task;
  if (
    !task.forceDetail &&
    (task.status === "assigned" || task.status === "revision_needed")
  ) {
    isSubmitModalOpen.value = true;
  } else {
    isDetailModalOpen.value = true;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "graded":
      return "success";
    case "submitted":
      return "warning";
    case "revision_needed":
      return "danger";
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
const actions = computed(() => [
  {
    key: "detail",
    icon: "mdi-eye",
    color: "#64748b",
    tooltip: "Detail",
    emit: "viewDetail",
  },
  {
    key: "submit",
    icon: "mdi-upload",
    color: "#2563eb",
    tooltip: "Kumpulkan",
    emit: "submitTask",
    show: (item: any) =>
      item.status === "assigned" || item.status === "revision_needed",
  },
]);

const handleDetail = (task: any) => {
  selectedTask.value = task;
  isDetailModalOpen.value = true;
};

const handleSubmit = (task: any) => {
  selectedTask.value = task;
  isSubmitModalOpen.value = true;
};

// SSE: Auto-refresh when Mentor assigns new task or grades
const { onEvent } = useSocket();
onEvent("new_notification", (data: any) => {
  if (
    data.type === "task" ||
    data.type === "task_graded" ||
    data.type === "task_revision"
  ) {
    loadData();

    if (data.type === "task_graded") {
      swal.success(data.title || "Tugas Dinilai", data.message);
    } else if (data.type === "task_revision") {
      swal.warning(data.title || "Tugas Perlu Direvisi", data.message);
    } else if (data.type === "task") {
      swal.info(data.title || "Tugas Baru", data.message);
    }
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        Mahasiswa
      </p>
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        Tugas Magang
      </h1>
    </div>

    <!-- Table -->
    <TableList
      :showHeader="false"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :filterList="filterList"
      :actions="actions"
      @fetchData="loadData"
      @viewDetail="handleDetail"
      @submitTask="handleSubmit"
    >
      <template v-slot:[`item.mentorName`]="{ item }">
        <div class="text-sm text-slate-900 dark:text-slate-300">
          {{ item.mentor?.name || item.mentorName || "-" }}
        </div>
      </template>

      <template v-slot:[`item.submissionUrl`]="{ value }">
        <a
          v-if="value"
          :href="value"
          target="_blank"
          class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          title="Lihat Bukti"
        >
          <UiIcon name="mdi-link-variant" size="sm" />
        </a>
        <span v-else class="text-slate-400 text-sm">-</span>
      </template>

      <template v-slot:[`item.deadline`]="{ value, item }">
        <div
          :class="
            new Date(value) < new Date() &&
            item.status !== 'graded' &&
            item.status !== 'submitted'
              ? 'text-red-600 font-medium'
              : 'text-slate-500'
          "
        >
          {{
            value
              ? new Date(value).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"
          }}
        </div>
      </template>

      <template v-slot:[`item.status`]="{ value }">
        <UiBadge :variant="getStatusBadgeVariant(value)">
          {{ getStatusLabel(value) }}
        </UiBadge>
      </template>

      <template v-slot:[`item.grade`]="{ value, item }">
        <span
          v-if="item.status === 'graded'"
          class="text-emerald-600 font-semibold"
          >{{ value }}</span
        >
        <span
          v-else-if="item.status === 'revision_needed'"
          class="text-red-600 font-semibold"
          >{{ value || 0 }}</span
        >
        <span v-else>-</span>
      </template>
    </TableList>

    <!-- Modals -->
    <PagesInternshipTasksSubmitTaskModal
      v-model="isSubmitModalOpen"
      :task="selectedTask"
      @refresh="loadData"
    />

    <PagesInternshipTasksTaskDetailModal
      v-model="isDetailModalOpen"
      :task="selectedTask"
    />
  </div>
</template>
