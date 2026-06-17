<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";
import internshipAssignmentService from "@/services/internship-assignment.service";

const authStore = useAuthStore();
const logbookService = internshipLogbookService();
const assignmentService = internshipAssignmentService();
const { notify } = useNotification();
const mentorId = computed(() => authStore.user?.id);
const route = useRoute();

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});
const isLoading = ref(false);
const isQuickViewOpen = ref(false);
const selectedLogbook = ref<any>(null);

const submittedCount = ref(0);
const belumMengisiCount = ref(0);

const headers = computed(() => [
  { key: "studentName", title: "Mahasiswa" },
  { key: "todayStatus", title: "Status Hari Ini", align: "center" },
  { key: "activities", title: "Aktivitas" },
  { key: "actions", title: "Aksi", align: "center", width: "10%" },
]);

const filterSchema = computed(() => [
  {
    name: "date",
    type: "date" as const,
    placeholder: "Pilih Tanggal",
    default: new Date().toISOString().split("T")[0],
    colMd: 4,
  },
  {
    name: "status",
    type: "select" as const,
    placeholder: "Semua Status",
    items: "statusOptions",
    colMd: 4,
  },
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari mahasiswa...",
    colMd: 4,
  },
]);

const filterList = {
  statusOptions: [
    { label: "Semua Status", value: "" },
    { label: "Submitted", value: "Submitted" },
    { label: "Pending", value: "Pending" },
    { label: "Late", value: "Late" },
  ],
};

const hasNoStudents = ref(false);

async function loadData() {
  if (!mentorId.value) return;

  const { q, date, status: filterStatus } = route.query;
  isLoading.value = true;

  try {
    // 1. Fetch logbooks for specific date (API returns all students with status)
    const selectedDate =
      (date as string) || new Date().toISOString().split("T")[0];
    const logbooksRes = await logbookService.getMentorDashboard(
      mentorId.value,
      { date: selectedDate },
    );
    const logbooks = logbooksRes?.data?.items || [];

    // We no longer use hasNoStudents because backend filters by date, 
    // which causes the empty state to appear incorrectly. We will just show the empty table.
    hasNoStudents.value = false;

    // 2. Map items directly from API
    let items = logbooks.map((item: any) => {
      let status = "Pending";
      let color = "warning";

      const progressStatus = item.progressStatus?.toLowerCase();

      // Jika sudah disubmit (ada tanggal submit), atau statusnya 'done', atau ID-nya bukan dummy 0000...
      if (item.submittedAt || progressStatus === "done") {
        status = "Submitted";
        color = "success";
      } else if (progressStatus === "late") {
        status = "Late";
        color = "danger";
      } else if (progressStatus === "pending") {
        status = "Pending";
        color = "warning";
      }

      return {
        ...item,
        studentName: item.studentName || "Mahasiswa",
        todayStatus: status,
        statusColor: color,
        activities: item.activities || "-",
        logbook: item,
      };
    });

    // Apply filters in frontend
    if (q) {
      const searchStr = (q as string).toLowerCase();
      items = items.filter((item: any) =>
        item.studentName.toLowerCase().includes(searchStr),
      );
    }

    if (filterStatus) {
      items = items.filter((item: any) => item.todayStatus === filterStatus);
    }

    tableData.value = {
      items,
      meta: { totalItems: items.length },
    };

    // Calculate summary
    submittedCount.value = items.filter(
      (i: any) => i.todayStatus === "Submitted",
    ).length;
    belumMengisiCount.value = items.filter(
      (i: any) => i.todayStatus !== "Submitted",
    ).length;
  } catch (error) {
    console.error("Failed to load mentor logbooks", error);
  } finally {
    isLoading.value = false;
  }
}

const actions = computed(() => [
  {
    key: "view",
    icon: "mdi-eye",
    color: "#64748b",
    tooltip: "Lihat Detail",
    emit: "viewDetail",
  },
]);

const openQuickView = (row: any) => {
  if (row.logbook) {
    selectedLogbook.value = row.logbook;
    isQuickViewOpen.value = true;
  } else {
    notify({
      title: "Informasi",
      message: "Mahasiswa ini belum mengisi logbook hari ini.",
      type: "info",
      category: "logbook",
    });
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Submitted":
      return "success";
    case "Pending":
      return "warning";
    case "Late":
      return "danger";
    default:
      return "neutral";
  }
};

// SSE: Auto-refresh when data changes
const { onEvent } = useSocket();
onEvent("refresh_logbooks", () => {
  loadData();
});
onEvent("refresh_students", () => {
  loadData();
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
        Monitoring Logbook
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Halaman ini menampilkan status logbook mahasiswa bimbingan Anda hari
        ini.
      </p>
    </div>

    <!-- Empty State: No Students Assigned -->
    <div
      v-if="hasNoStudents"
      class="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/20 mb-4">
        <UiIcon name="mdi-account-group-outline" size="lg" />
      </div>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Belum ada mahasiswa yang ditugaskan kepada Anda.
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        Hubungi HRD untuk melakukan penugasan mahasiswa agar Anda dapat memantau logbook mereka di sini.
      </p>
    </div>

    <!-- Summary Badges -->
    <div class="flex gap-4" v-if="!hasNoStudents">
      <div
        class="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 font-medium"
      >
        <UiIcon name="mdi-check-circle" class="text-emerald-500" />
        <span>{{ submittedCount }} Submitted</span>
      </div>
      <div
        class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-800/50 font-medium"
      >
        <UiIcon name="mdi-alert-circle" class="text-amber-500" />
        <span>{{ belumMengisiCount }} Belum Mengisi</span>
      </div>
    </div>

    <!-- Table -->
    <TableList
      v-if="!hasNoStudents"
      title="Daftar Mahasiswa Bimbingan"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :filterList="filterList"
      :actions="actions"
      @fetchData="loadData"
      @viewDetail="openQuickView"
    >
      <template v-slot:[`item.studentName`]="{ item }">
        <div class="font-medium text-slate-900 dark:text-white">
          {{ item.studentName }}
        </div>
      </template>

      <template v-slot:[`item.todayStatus`]="{ value }">
        <UiBadge :variant="getStatusBadgeVariant(value)">
          {{ value }}
        </UiBadge>
      </template>

      <template v-slot:[`item.activities`]="{ value }">
        <p class="line-clamp-2 text-sm">{{ value }}</p>
      </template>
    </TableList>

    <!-- Quick View Modal (Read-Only) -->
    <PagesInternshipLogbooksQuickViewModal
      v-model="isQuickViewOpen"
      :logbook="selectedLogbook"
    />
  </div>
</template>
