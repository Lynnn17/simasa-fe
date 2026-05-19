<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipTaskService from "@/services/internship-task.service";
import internshipAssignmentService from "@/services/internship-assignment.service";

const authStore = useAuthStore();
const taskSvc = internshipTaskService();
const assignmentSvc = internshipAssignmentService();
const mentorId = computed(() => authStore.user?.id);
const route = useRoute();
const swal = useSwal();

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});
const students = ref<any[]>([]);
const isLoading = ref(false);

const isCreateModalOpen = ref(false);
const isGradeModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedTask = ref<any>(null);

const headers = computed(() => [
  { key: "title", title: "Judul Tugas", sortable: true },
  { key: "studentName", title: "Mahasiswa", sortable: true },
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
    colMd: 4,
  },
  {
    name: "studentSearch",
    type: "select" as const,
    placeholder: "Filter Mahasiswa",
    items: "studentOptions",
    colMd: 4,
  },
  {
    name: "status",
    type: "select" as const,
    placeholder: "Semua Status",
    items: "statusOptions",
    colMd: 4,
  },
]);

const filterList = computed(() => ({
  studentOptions: [
    { label: "Semua Mahasiswa", value: "" },
    ...students.value.map((s) => ({
      label: s.studentName || s.name || s.student?.name,
      value: s.studentName || s.name || s.student?.name,
    })),
  ],
  statusOptions: [
    { label: "Semua Status", value: "" },
    { label: "Ditugaskan", value: "assigned" },
    { label: "Menunggu Penilaian", value: "submitted" },
    { label: "Dinilai", value: "graded" },
    { label: "Revisi", value: "revision_needed" },
  ],
}));

const actionToolbars = computed(() => [
  {
    key: "addItem",
    icon: "mdi-plus-circle-outline",
    tooltip: "Tambah Tugas",
    emit: "addItem",
    type: "default" as const,
  },
]);

async function loadData() {
  if (!mentorId.value) return;

  const { pageNumber, pageSize, q, status, studentSearch } = route.query;
  isLoading.value = true;

  try {
    const params = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      search: q || "",
      studentSearch: studentSearch || "",
      status: status || "",
    };

    const res: any = await taskSvc.getTasksByMentor(mentorId.value, params);
    tableData.value = {
      items: res?.data?.items || [],
      meta: res?.data?.meta || { totalItems: 0 },
    };
  } catch (error) {
    console.error("Failed to load mentor tasks", error);
  } finally {
    isLoading.value = false;
  }
}

const loadStudents = async () => {
  if (!mentorId.value) return;
  try {
    const res: any = await assignmentSvc.getStudentsByMentor(mentorId.value);
    students.value = res?.data?.items || res?.data || [];
  } catch (error) {
    console.error("Failed to load students", error);
  }
};

const handleGrade = (task: any) => {
  selectedTask.value = task;
  isGradeModalOpen.value = true;
};

const handleEdit = (task: any) => {
  selectedTask.value = task;
  isCreateModalOpen.value = true;
};

const handleCreateNew = () => {
  selectedTask.value = null;
  isCreateModalOpen.value = true;
};

const handleDetail = (task: any) => {
  selectedTask.value = task;
  isDetailModalOpen.value = true;
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
      return "Ditugaskan";
    case "submitted":
      return "Menunggu Penilaian";
    case "graded":
      return "Lulus / Dinilai";
    case "revision_needed":
      return "Butuh Revisi";
    default:
      return status || "Assigned";
  }
};

onMounted(() => {
  loadData(); // Ensure initial data load
  loadStudents();
});
const actions = computed(() => [
  {
    key: "detail",
    icon: "mdi-eye",
    color: "#64748b",
    tooltip: "Detail",
    emit: "viewDetail",
  },
  {
    key: "edit",
    icon: "mdi-pencil",
    color: "#2563eb",
    tooltip: "Edit",
    emit: "editItem",
    show: (item: any) =>
      item.status === "assigned" || item.status === "revision_needed",
  },
  {
    key: "grade",
    icon: "mdi-star",
    color: "#d97706",
    tooltip: "Nilai",
    emit: "gradeItem",
    show: (item: any) => item.status === "submitted",
  },
]);

// SSE: Auto-refresh when student submits a task
const { onEvent } = useSocket();
onEvent("new_notification", (data: any) => {
  if (data.type === "task_submission") {
    loadData();
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        Mentor
      </p>
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        Manajemen Tugas
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
      :actionToolbars="actionToolbars"
      :actions="actions"
      @fetchData="loadData"
      @addItem="handleCreateNew"
      @viewDetail="handleDetail"
      @editItem="handleEdit"
      @gradeItem="handleGrade"
    >
      <template v-slot:[`item.studentName`]="{ item }">
        <div class="font-medium text-slate-900 dark:text-slate-300">
          {{ item.student?.name || item.studentName || "Mahasiswa" }}
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

      <template v-slot:[`item.deadline`]="{ value }">
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
      </template>

      <template v-slot:[`item.status`]="{ value }">
        <UiBadge :variant="getStatusBadgeVariant(value)">
          {{ getStatusLabel(value) }}
        </UiBadge>
      </template>

      <template v-slot:[`item.grade`]="{ value }">
        <span class="font-semibold">{{
          value !== null && value !== undefined ? value : "-"
        }}</span>
      </template>
    </TableList>

    <!-- Modals -->
    <PagesInternshipTasksCreateTaskModal
      v-model="isCreateModalOpen"
      :task="selectedTask"
      @refresh="loadData"
    />

    <PagesInternshipTasksGradeTaskModal
      v-model="isGradeModalOpen"
      :task="selectedTask"
      @refresh="loadData"
    />

    <PagesInternshipTasksTaskDetailModal
      v-model="isDetailModalOpen"
      :task="selectedTask"
    />
  </div>
</template>
