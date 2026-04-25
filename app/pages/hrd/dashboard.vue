<script setup lang="ts">
import hrdService from "~/services/hrd.service";

definePageMeta({
  layout: "admin",
  permission: "MONITORING.VIEW", // Adjust permission as needed
});

const hrdSvc = hrdService();
const swal = useSwal();

const monitoringData = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");
const search = ref("");

async function loadMonitoringData() {
  isLoading.value = true;
  try {
    const res: any = await hrdSvc.getMonitoringData({
      search: search.value,
    });
    monitoringData.value = res?.data || [];
  } catch (error) {
    console.error("Failed to load monitoring data", error);
  } finally {
    isLoading.value = false;
  }
}

// Debounce search
let searchTimeout: any;
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    search.value = val;
    loadMonitoringData();
  }, 500);
});

onMounted(() => {
  loadMonitoringData();
});

function getAttendanceVariant(status: string) {
  switch (status) {
    case "Hadir":
      return "success";
    case "Tidak Hadir":
      return "danger";
    case "Belum Tercatat":
      return "neutral";
    default:
      return "neutral";
  }
}

function getLogbookStatus(item: any) {
  if (item.logbookStatus) return "Submitted";
  return item.attendanceStatus === "Belum Tercatat" ? "Pending" : "Late";
}

function getLogbookVariant(status: string) {
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
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          HRD Monitoring
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Dashboard Monitoring Harian
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative w-full sm:w-64">
          <UiInput
            v-model="searchQuery"
            placeholder="Cari mahasiswa..."
            icon="mdi-magnify"
          />
        </div>
        <button
          @click="loadMonitoringData"
          class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <UiIcon
            name="mdi-refresh"
            :class="{ 'animate-spin': isLoading }"
            size="sm"
            class="mr-2"
          />
          Refresh
        </button>
      </div>
    </div>

    <!-- Monitoring Table -->
    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 class="font-semibold text-slate-900 dark:text-white">
          Rekapitulasi Hari Ini
        </h3>
        <p class="text-sm text-slate-500">
          Pemantauan kehadiran dan pengisian logbook mahasiswa secara real-time.
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Mahasiswa
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Asal Kampus
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Mentor
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Kehadiran
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Status Logbook
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900"
          >
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat data monitoring...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="monitoringData.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                Belum ada data mahasiswa aktif.
              </td>
            </tr>
            <tr
              v-else
              v-for="item in monitoringData"
              :key="item.studentId"
              class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-slate-900 dark:text-white">
                  {{ item.studentName }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-600 dark:text-slate-400">
                  {{ item.university }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div
                    class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600"
                  >
                    {{
                      (item.mentorName || "??").substring(0, 2).toUpperCase()
                    }}
                  </div>
                  <span
                    class="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {{ item.mentorName || "Belum ditugaskan" }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <UiBadge :variant="getAttendanceVariant(item.attendanceStatus)">
                  {{ item.attendanceStatus }}
                </UiBadge>
              </td>
              <td class="px-6 py-4">
                <UiBadge :variant="getLogbookVariant(getLogbookStatus(item))">
                  {{ getLogbookStatus(item) }}
                </UiBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
