<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";

const authStore = useAuthStore();
const logbookService = internshipLogbookService();
const swal = useSwal();
const studentId = computed(() => authStore.user?.id);

const logbooks = ref<any[]>([]);
const isLoading = ref(false);
const isInitialLoading = ref(true);
const isMoreLoading = ref(false);
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedLogbook = ref<any>(null);
const viewingLogbook = ref<any>(null);
const hasFilledToday = ref<boolean | null>(null);

// Pagination & Filters
const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");
const search = ref("");
const status = ref("");
const hasMore = ref(true);

// Debounce search
watch(searchQuery, (val) => {
  const timeout = setTimeout(() => {
    if (val === searchQuery.value) {
      search.value = val;
    }
  }, 500);
  return () => clearTimeout(timeout);
});

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

async function loadData(isLoadMore = false) {
  if (!studentId.value) return;

  if (isLoadMore) {
    isMoreLoading.value = true;
  } else {
    isInitialLoading.value = true;
    pageNumber.value = 1;
    logbooks.value = [];
  }

  try {
    const params = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      search: search.value,
      status: status.value,
    };

    const res: any = await logbookService.getStudentHistory(studentId.value, params);
    const newData = res?.data?.items || [];
    const meta = res?.data?.meta || {};
    
    if (isLoadMore) {
      logbooks.value = [...logbooks.value, ...newData];
    } else {
      logbooks.value = newData;
      
      // Check if today's logbook is filled (only on initial load without filters)
      if (pageNumber.value === 1 && !search.value && !status.value) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const hasFilled = newData.some((l: any) => {
          const logDate = new Date(l.logDate);
          const logDateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
          return logDateStr === todayStr;
        });

        hasFilledToday.value = hasFilled;

        if (!hasFilled) {
          swal.toast("Anda belum mengisi logbook untuk hari ini!", "warning");
        }
      }
    }
    
    hasMore.value = meta.currentPage < meta.totalPage;
  } catch (error) {
    console.error("Failed to load logbooks", error);
  } finally {
    isInitialLoading.value = false;
    isMoreLoading.value = false;
  }
}

function loadMore() {
  if (hasMore.value && !isMoreLoading.value) {
    pageNumber.value++;
    loadData(true);
  }
}

// Watch filters
watch([search, status], () => {
  loadData();
});

const route = useRoute();

onMounted(() => {
  loadData();

  if (route.query.create === "true") {
    handleCreate();

    // Remove query param to clean URL
    const query = { ...route.query };
    delete query.create;
    useRouter().replace({ query });
  }
});

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
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400"> Mahasiswa </p>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"> Riwayat Logbook </h1>
      </div>
    </div>

    <!-- Persistent Status Banner (SRS FR-13 / UC 4) -->
    <div v-if="hasFilledToday !== null" class="overflow-hidden rounded-2xl border shadow-sm transition-all duration-300"
      :class="hasFilledToday 
        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
        : 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'"
    >
      <div class="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full" 
            :class="hasFilledToday ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-rose-100 dark:bg-rose-800'"
          >
            <UiIcon :name="hasFilledToday ? 'mdi-check-circle' : 'mdi-alert-circle'" 
              :class="hasFilledToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
              size="md" 
            />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">
              Status Logbook Hari Ini: 
              <span :class="hasFilledToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ hasFilledToday ? 'Sudah Mengisi' : 'Belum Mengisi' }}
              </span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ hasFilledToday 
                ? 'Terima kasih telah mengisi logbook hari ini. Tetap semangat!' 
                : 'Sesuai aturan (FR-13), Anda wajib mengisi logbook setiap hari kerja.' }}
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

    <!-- Filters -->
    <div
      class="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div class="flex-1">
        <UiInput
          v-model="searchQuery"
          placeholder="Cari aktivitas atau rencana..."
          icon="mdi-magnify"
        />
      </div>
      <div class="w-full md:w-48">
        <UiSelect
          v-model="status"
          placeholder="Semua Status"
          :options="[
            { label: 'Semua Status', value: '' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]"
        />
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="loadData()"
          :disabled="isInitialLoading"
          class="inline-flex items-center justify-center p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <UiIcon
            name="mdi-refresh"
            :class="{ 'animate-spin': isInitialLoading }"
            size="md"
          />
          <span>Refresh</span>
        </button>
        <button
          @click="handleCreate"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 whitespace-nowrap"
        >
          <UiIcon name="mdi-plus" size="md" />
          <span>Tambah</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Tanggal
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Aktivitas
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Rencana Besok
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Bukti
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Dikirim Pada
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900"
          >
            <tr v-if="isInitialLoading">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat riwayat logbook...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="logbooks.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                Tidak ada data logbook yang ditemukan.
              </td>
            </tr>
            <tr
              v-else
              v-for="item in logbooks"
              :key="item.id"
              class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white"
              >
                {{
                  new Date(item.logDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                }}
              </td>
              <td
                class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs"
              >
                <p class="line-clamp-2">
                  {{ item.activities }}
                </p>
              </td>
              <td
                class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs"
              >
                <p class="line-clamp-2">
                  {{ item.planTomorrow }}
                </p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UiBadge :variant="getStatusBadgeVariant(item.status)">
                  {{ item.status || "Pending" }}
                </UiBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <a
                  v-if="item.evidenceUrl"
                  :href="item.evidenceUrl"
                  target="_blank"
                  class="text-primary-600 cursor-pointer hover:text-primary-700 dark:text-primary-400"
                  title="Lihat Bukti"
                >
                  <UiIcon name="mdi-link-variant" size="md" />
                </a>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{
                  item.submittedAt
                    ? new Date(item.submittedAt).toLocaleString("id-ID")
                    : "-"
                }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"
              >
                <button
                  @click="handleViewDetail(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <UiIcon name="mdi-eye" size="sm" />
                  <span>Detail</span>
                </button>
                <button
                  v-if="item.status === 'pending' || item.status === 'rejected'"
                  @click="handleEdit(item)"
                  class="inline-flex cursor-pointer border-1 items-center gap-1.5 rounded-lg px-3 py-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <UiIcon name="mdi-pencil" size="sm" />
                  <span>Edit</span>
                </button>
                <div
                  v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-400"
                >
                  <UiIcon name="mdi-lock" size="sm" />
                  <span>Locked</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Load More -->
      <div
        v-if="hasMore"
        class="p-4 border-t border-slate-200 dark:border-slate-800 text-center"
      >
        <button
          @click="loadMore"
          :disabled="isMoreLoading"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50 transition-colors"
        >
          <UiSpinner v-if="isMoreLoading" size="sm" />
          <span>{{ isMoreLoading ? "Memuat..." : "Muat Lebih Banyak" }}</span>
        </button>
      </div>
    </div>

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
