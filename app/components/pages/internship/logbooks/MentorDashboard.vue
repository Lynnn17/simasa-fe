<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";

const authStore = useAuthStore();
const logbookService = internshipLogbookService();
const mentorId = computed(() => authStore.user?.id);
const route = useRoute();
const swal = useSwal();

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});
const isLoading = ref(false);
const isQuickViewOpen = ref(false);
const selectedLogbook = ref<any>(null);
const isStatusUpdating = ref<string | null>(null);
const pendingReviewCount = ref<number | null>(null);

const headers = computed(() => [
  { key: "studentName", title: "Mahasiswa", sortable: true },
  { key: "logDate", title: "Tanggal", sortable: true },
  { key: "activities", title: "Aktivitas" },
  { key: "status", title: "Status", align: "center" },
  { key: "evidenceUrl", title: "Bukti", align: "center" },
  { key: "actions", title: "Aksi", align: "center", width: "15%" },
]);

const filterSchema = computed(() => [
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari mahasiswa atau aktivitas...",
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
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ],
};

async function loadData() {
  if (!mentorId.value) return;

  const { pageNumber, pageSize, q, status } = route.query;
  isLoading.value = true;

  try {
    const params = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      search: q || "",
      status: status || "",
    };

    const res: any = await logbookService.getMentorDashboard(mentorId.value, params);
    const items = res?.data?.items || [];
    tableData.value = {
      items,
      meta: res?.data?.meta || { totalItems: 0 },
    };

    if (!q && !status) {
      const pendingCount = items.filter((l: any) => l.status === "pending" || l.status === "submitted").length;
      pendingReviewCount.value = pendingCount;
    }
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
    tooltip: "Review",
    emit: "viewDetail",
  },
  {
    key: "approve",
    icon: "mdi-check-circle",
    color: "#10b981",
    tooltip: "Approve",
    emit: "approveItem",
    show: (item: any) => item.status === "pending" || item.status === "submitted",
  },
  {
    key: "reject",
    icon: "mdi-close-circle",
    color: "#ef4444",
    tooltip: "Revisi",
    emit: "rejectItem",
    show: (item: any) => item.status === "pending" || item.status === "submitted",
  },
]);

const handleUpdateStatus = async (item: any, newStatus: string) => {
  try {
    isStatusUpdating.value = item.id;
    await logbookService.updateLogbookStatus(item.id, { status: newStatus });
    swal.success("Berhasil", `Status logbook diubah menjadi ${newStatus}`);
    loadData();
  } catch (error: any) {
    swal.error(
      "Gagal",
      error?.response?._data?.message || "Gagal mengubah status logbook"
    );
  } finally {
    isStatusUpdating.value = null;
  }
};

const openQuickView = (logbook: any) => {
  selectedLogbook.value = logbook;
  isQuickViewOpen.value = true;
};

const handleApprove = (item: any) => handleUpdateStatus(item, "approved");
const handleReject = (item: any) => handleUpdateStatus(item, "rejected");

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "submitted":
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "late":
    case "rejected":
      return "danger";
    default:
      return "neutral";
  }
};
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
    </div>

    <!-- Persistent Review Banner -->
    <div
      v-if="pendingReviewCount !== null"
      class="overflow-hidden rounded-2xl border shadow-sm transition-all duration-300"
      :class="
        pendingReviewCount > 0
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
          : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
      "
    >
      <div
        class="flex flex-col sm:flex-row items-center justify-between p-4 gap-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="p-2 rounded-full"
            :class="
              pendingReviewCount > 0
                ? 'bg-amber-100 dark:bg-amber-800'
                : 'bg-emerald-100 dark:bg-emerald-800'
            "
          >
            <UiIcon
              :name="pendingReviewCount > 0 ? 'mdi-clock-alert' : 'mdi-check-all'"
              :class="
                pendingReviewCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              "
              size="md"
            />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">
              Status Review Logbook:
              <span
                :class="
                  pendingReviewCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                "
              >
                {{
                  pendingReviewCount > 0
                    ? `${pendingReviewCount} Menunggu Review`
                    : "Semua Beres"
                }}
              </span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{
                pendingReviewCount > 0
                  ? "Mohon segera tinjau logbook mahasiswa bimbingan Anda."
                  : "Tidak ada logbook mahasiswa yang menunggu persetujuan saat ini."
              }}
            </p>
          </div>
        </div>
      </div>
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
      @approveItem="handleApprove"
      @rejectItem="handleReject"
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

      <template v-slot:[`item.status`]="{ value }">
        <UiBadge :variant="getStatusBadgeVariant(value)">
          {{ value || "Pending" }}
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

    <!-- Quick View Modal -->
    <PagesInternshipLogbooksQuickViewModal
      v-model="isQuickViewOpen"
      :logbook="selectedLogbook"
      @refresh="loadData"
    />
  </div>
</template>
