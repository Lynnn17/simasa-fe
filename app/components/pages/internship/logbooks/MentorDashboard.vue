<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";

const authStore = useAuthStore();
const logbookService = internshipLogbookService();
const mentorId = computed(() => authStore.user?.id);
const route = useRoute();

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});
const isLoading = ref(false);
const isQuickViewOpen = ref(false);
const selectedLogbook = ref<any>(null);

const headers = computed(() => [
  { key: "studentName", title: "Mahasiswa", sortable: true },
  { key: "logDate", title: "Tanggal", sortable: true },
  { key: "activities", title: "Aktivitas" },
  { key: "progressStatus", title: "Status Progress", align: "center" },
  { key: "evidenceUrl", title: "Bukti", align: "center" },
  { key: "actions", title: "Aksi", align: "center", width: "10%" },
]);

const filterSchema = computed(() => [
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari mahasiswa atau aktivitas...",
    colMd: 4,
  },
  {
    name: "date",
    type: "date" as const,
    placeholder: "Filter Tanggal",
    colMd: 4,
  },
  {
    name: "progressStatus",
    type: "select" as const,
    placeholder: "Semua Status",
    items: "statusOptions",
    colMd: 4,
  },
]);

const filterList = {
  statusOptions: [
    { label: "Semua Status", value: "" },
    { label: "In Progress", value: "in_progress" },
    { label: "Done", value: "done" },
    { label: "Blocked", value: "blocked" },
  ],
};

async function loadData() {
  if (!mentorId.value) return;

  const { pageNumber, pageSize, q, progressStatus, date } = route.query;
  isLoading.value = true;

  try {
    const params = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      search: q || "",
      progressStatus: progressStatus || "",
      date: date || "",
    };

    const res: any = await logbookService.getMentorDashboard(mentorId.value, params);
    const items = res?.data?.items || [];
    tableData.value = {
      items,
      meta: res?.data?.meta || { totalItems: 0 },
    };
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

const openQuickView = (logbook: any) => {
  selectedLogbook.value = logbook;
  isQuickViewOpen.value = true;
};

const getProgressBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "done":
      return "success";
    case "in_progress":
      return "warning";
    case "blocked":
      return "danger";
    default:
      return "neutral";
  }
};

const getProgressLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case "done":
      return "Selesai";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Terhambat";
    default:
      return status || "-";
  }
};

// SSE: Auto-refresh when a student submits logbook
const { onEvent } = useSocket();
onEvent("refresh_logbooks", () => {
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
        Halaman ini hanya untuk melihat logbook mahasiswa bimbingan Anda.
      </p>
    </div>

    <!-- Table -->
    <TableList
      title="Daftar Logbook Mahasiswa"
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
          {{ item.studentName || item.student?.name || "Mahasiswa" }}
        </div>
      </template>

      <template v-slot:[`item.logDate`]="{ value }">
        {{
          new Date(value).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        }}
      </template>

      <template v-slot:[`item.activities`]="{ value }">
        <p class="line-clamp-2 text-sm">{{ value }}</p>
      </template>

      <template v-slot:[`item.progressStatus`]="{ value }">
        <UiBadge :variant="getProgressBadgeVariant(value)">
          {{ getProgressLabel(value) }}
        </UiBadge>
      </template>

      <template v-slot:[`item.evidenceUrl`]="{ value }">
        <a
          v-if="value"
          :href="value"
          target="_blank"
          class="text-primary-600 hover:text-primary-700"
        >
          <UiIcon name="mdi-link-variant" size="sm" />
        </a>
        <span v-else>-</span>
      </template>
    </TableList>

    <!-- Quick View Modal (Read-Only) -->
    <PagesInternshipLogbooksQuickViewModal
      v-model="isQuickViewOpen"
      :logbook="selectedLogbook"
    />
  </div>
</template>
