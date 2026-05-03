<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";

const authStore = useAuthStore();
const logbookService = internshipLogbookService();
const swal = useSwal();
const route = useRoute();
const { t } = useTranslation();

const studentId = computed(() => authStore.user?.id);
const logbooksData = ref({
  items: [],
  meta: { totalItems: 0 },
});
const isLoading = ref(false);
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedLogbook = ref<any>(null);
const viewingLogbook = ref<any>(null);
const hasFilledToday = ref<boolean | null>(null);

const headers = computed(() => [
  { key: "logDate", title: "Tanggal", sortable: true },
  { key: "activities", title: "Aktivitas", sortable: true },
  { key: "planTomorrow", title: "Rencana Besok", sortable: true },
  { key: "status", title: "Status", align: "center" },
  { key: "submittedAt", title: "Dikirim Pada", align: "center" },
  { key: "actions", title: "Aksi", align: "center", width: "15%" },
]);

const filterSchema = computed(() => [
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari aktivitas...",
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

const actionToolbars = computed(() => [
  {
    key: "addItem",
    icon: "mdi-plus-circle-outline",
    color: "primary",
    tooltip: "Tambah",
    emit: "addItem",
    type: "default" as const,
  },
]);

const actions = computed(() => [
  {
    key: "view",
    icon: "mdi-eye",
    color: "#64748b",
    tooltip: "Detail",
    emit: "viewDetail",
  },
  {
    key: "edit",
    icon: "mdi-pencil",
    color: "#0284c7",
    tooltip: "Edit",
    emit: "editItem",
    show: (item: any) =>
      item.status === "pending" || item.status === "rejected",
  },
]);

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

    const res: any = await logbookService.getStudentHistory(
      studentId.value,
      params,
    );
    const items = res?.data?.items || [];
    logbooksData.value = {
      items,
      meta: res?.data?.meta || { totalItems: 0 },
    };

    // Check if today's logbook is filled (only on initial load without filters)
    if (!q && !status) {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const dayOfWeek = today.getDay();

      const hasFilled = items.some((l: any) => {
        return l.logDate.split("T")[0] === todayStr;
      });

      hasFilledToday.value = hasFilled;

      const isWorkDay = dayOfWeek > 0 && dayOfWeek < 6;
      if (!hasFilled && isWorkDay) {
        swal.toast("Anda belum mengisi logbook untuk hari ini!", "warning");
      }
    }
  } catch (error) {
    console.error("Failed to load logbooks", error);
  } finally {
    isLoading.value = false;
  }
}

function handleCreate() {
  selectedLogbook.value = null;
  isFormModalOpen.value = true;
}

function handleEdit(item: any) {
  selectedLogbook.value = item;
  isFormModalOpen.value = true;
}

function handleViewDetail(item: any) {
  viewingLogbook.value = item;
  isDetailModalOpen.value = true;
}

function getStatusBadgeVariant(status: string) {
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
}

onMounted(() => {
  if (route.query.create === "true") {
    handleCreate();
    const query = { ...route.query };
    delete query.create;
    useRouter().replace({ query });
  }
});
const isWorkDay = computed(() => {
  const today = new Date();
  const day = today.getDay();
  return day > 0 && day < 6;
});
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          Mahasiswa
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Riwayat Logbook
        </h1>
      </div>
    </div>

    <!-- Persistent Status Banner -->
    <div
      v-if="hasFilledToday !== null && (hasFilledToday || isWorkDay)"
      class="overflow-hidden rounded-2xl border shadow-sm transition-all duration-300"
      :class="
        hasFilledToday
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
          : 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
      "
    >
      <div
        class="flex flex-col sm:flex-row items-center justify-between p-4 gap-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="p-2 rounded-full"
            :class="
              hasFilledToday
                ? 'bg-emerald-100 dark:bg-emerald-800'
                : 'bg-rose-100 dark:bg-rose-800'
            "
          >
            <UiIcon
              :name="hasFilledToday ? 'mdi-check-circle' : 'mdi-alert-circle'"
              :class="
                hasFilledToday
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
              size="md"
            />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">
              Status Logbook Hari Ini:
              <span
                :class="
                  hasFilledToday
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ hasFilledToday ? "Sudah Mengisi" : "Belum Mengisi" }}
              </span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{
                hasFilledToday
                  ? "Terima kasih telah mengisi logbook hari ini. Tetap semangat!"
                  : "Anda wajib mengisi logbook setiap hari kerja."
              }}
            </p>
          </div>
        </div>
        <button
          v-if="!hasFilledToday"
          @click="handleCreate"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-all active:scale-95"
        >
          <UiIcon name="mdi-pencil-plus" size="sm" />
          <span>Isi Logbook Sekarang</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <TableList
      title="Daftar Logbook"
      :headers="headers"
      :tableData="logbooksData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :filterList="filterList"
      :actions="actions"
      :actionToolbars="actionToolbars"
      @fetchData="loadData"
      @addItem="handleCreate"
      @viewDetail="handleViewDetail"
      @editItem="handleEdit"
    >
      <template v-slot:[`item.logDate`]="{ value }">
        {{
          new Date(value).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }}
      </template>

      <template v-slot:[`item.activities`]="{ value }">
        <p class="line-clamp-2 text-sm">{{ value }}</p>
      </template>

      <template v-slot:[`item.planTomorrow`]="{ value }">
        <p class="line-clamp-2 text-sm">{{ value }}</p>
      </template>

      <template v-slot:[`item.status`]="{ value }">
        <UiBadge :variant="getStatusBadgeVariant(value)">
          {{ value || "Pending" }}
        </UiBadge>
      </template>

      <template v-slot:[`item.submittedAt`]="{ value }">
        {{ value ? new Date(value).toLocaleString("id-ID") : "-" }}
      </template>
    </TableList>

    <!-- Form Modal -->
    <PagesInternshipLogbooksLogbookFormModal
      v-model="isFormModalOpen"
      :logbook="selectedLogbook"
      @refresh="loadData"
    />

    <!-- Detail Modal -->
    <PagesInternshipLogbooksLogbookDetailModal
      v-model="isDetailModalOpen"
      :logbook="viewingLogbook"
    />
  </div>
</template>
