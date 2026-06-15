<script setup lang="ts">
import hrdService from "~/services/hrd.service";
import { format } from "date-fns";
import { id } from "date-fns/locale";

definePageMeta({
  layout: "admin",
  permission: "MONITORING.VIEW", // Adjust permission as needed
});

const hrdSvc = hrdService();
const { t } = useTranslation();
const route = useRoute();

const isLoading = ref(false);
const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});

const headers = computed(() => [
  { key: "studentName", title: "Mahasiswa", sortable: true },
  { key: "university", title: "Asal Kampus", sortable: true },
  { key: "mentorName", title: "Mentor", sortable: true },
  { key: "attendanceStatus", title: "Kehadiran", align: "center" },
  { key: "logbookStatus", title: "Status Logbook", align: "center" },
]);

const filterSchema = computed(() => [
  {
    name: "date",
    type: "date" as const,
    placeholder: "Pilih Tanggal",
    default: format(new Date(), "yyyy-MM-dd"),
    colMd: 4,
  },
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari mahasiswa...",
    colMd: 8,
  },
]);

const getAttendanceVariant = (status: string) => {
  switch (status) {
    case "Hadir":
      return "success"; // Hijau
    case "Tidak Hadir":
    case "Izin":
    case "Sakit":
      return "danger"; // Merah
    case "Pending":
    case "Belum Tercatat":
      return "warning"; // Kuning
    default:
      return "neutral";
  }
};

const getLogbookVariant = (status: string) => {
  const s = status?.toLowerCase();
  if (["submitted", "already filled", "sudah mengisi"].includes(s))
    return "success"; // Hijau
  if (["pending", "belum mengisi"].includes(s)) return "warning"; // Kuning
  if (["late", "terlambat"].includes(s)) return "danger"; // Merah
  return "neutral";
};

const formattedDisplayDate = computed(() => {
  const dateStr =
    (route.query.date as string) || format(new Date(), "yyyy-MM-dd");
  try {
    return format(new Date(dateStr), "dd MMMM yyyy", { locale: id });
  } catch (e) {
    return dateStr;
  }
});

// Quick View Modal
const showQuickView = ref(false);
const selectedStudentId = ref<string | null>(null);
const isFirstLoad = ref(true);

const openQuickView = (studentId: string) => {
  selectedStudentId.value = studentId;
  showQuickView.value = true;
};

onMounted(() => {
  loadMonitoringData();
});

async function loadMonitoringData() {
  const { q, date } = route.query;
  isLoading.value = true;
  try {
    const res: any = await hrdSvc.getMonitoringData({
      search: q || "",
      date: date || format(new Date(), "yyyy-MM-dd"),
    });
    const items = res?.data || [];
    tableData.value = {
      items,
      meta: { totalItems: items.length },
    };
  } catch (error) {
    console.error("Failed to load monitoring data", error);
  } finally {
    isLoading.value = false;
    isFirstLoad.value = false;
  }
}
const { onEvent } = useSocket();

// Listen for monitoring updates from students
onEvent("monitoring_update", () => {
  refresh(); // Automatically refresh data without page reload
});
</script>

<template>
  <div class="space-y-6">
    <!-- Notifications -->
    <InternshipPendingRegistrationAlert />

    <!-- Header -->

    <div class="flex flex-col gap-1">
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        HRD Monitoring
      </p>
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        Monitoring Harian
        <span class="text-primary-600 dark:text-primary-400">{{
          formattedDisplayDate
        }}</span>
      </h1>
    </div>

    <!-- Summary Stats (Optional but would look premium) -->
    <!-- ... can add later ... -->

    <!-- Monitoring Table -->
    <TableList
      :showHeader="false"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      @fetchData="loadMonitoringData"
    >
      <template v-slot:[`item.studentName`]="{ item }">
        <button
          @click="openQuickView(item.studentId)"
          class="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left group"
        >
          <span
            class="border-b border-transparent group-hover:border-primary-500 transition-all"
          >
            {{ item.studentName }}
          </span>
          <i
            class="mdi mdi-information-outline ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          ></i>
        </button>
      </template>

      <template v-slot:[`item.mentorName`]="{ value }">
        <div class="flex items-center gap-2">
          <div
            class="h-7 w-7 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800"
          >
            {{ (value || "??").substring(0, 2).toUpperCase() }}
          </div>
          <span
            class="text-sm font-medium"
            :class="
              value
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-400 italic'
            "
          >
            {{ value || "Belum ditugaskan" }}
          </span>
        </div>
      </template>

      <template v-slot:[`item.attendanceStatus`]="{ value }">
        <UiBadge :variant="getAttendanceVariant(value)">
          {{ value }}
        </UiBadge>
      </template>

      <template v-slot:[`item.logbookStatus`]="{ value }">
        <UiBadge :variant="getLogbookVariant(value)">
          {{ value || "Pending" }}
        </UiBadge>
      </template>
    </TableList>

    <!-- Modals -->
    <PagesHrdStudentQuickViewModal
      v-model="showQuickView"
      :student-id="selectedStudentId"
      @finished="loadMonitoringData"
    />
  </div>
</template>
