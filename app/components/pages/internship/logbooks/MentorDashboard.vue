<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";

const authStore = useAuthStore();
const logbookService = internshipLogbookService();
const mentorId = computed(() => authStore.user?.id);

const logbooks = ref<any[]>([]);
const isLoading = ref(false);
const isInitialLoading = ref(true);
const isMoreLoading = ref(false);
const isQuickViewOpen = ref(false);
const selectedLogbook = ref<any>(null);
const isStatusUpdating = ref<string | null>(null);
const pendingReviewCount = ref<number | null>(null);

const swal = useSwal();

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

async function loadData(isLoadMore = false) {
  if (!mentorId.value) return;
  
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
    
    const res: any = await logbookService.getMentorDashboard(mentorId.value, params);
    const newData = res?.data?.items || [];
    const meta = res?.data?.meta || {};
    
    if (isLoadMore) {
      logbooks.value = [...logbooks.value, ...newData];
    } else {
      logbooks.value = newData;
      const pendingCount = newData.filter((l: any) => l.status === 'pending' || l.status === 'submitted').length;
      pendingReviewCount.value = pendingCount;
      if (pendingCount > 0) {
        swal.toast(`Terdapat ${pendingCount} logbook yang menunggu review Anda!`, "info");
      }
    }

    hasMore.value = meta.currentPage < meta.totalPage;
  } catch (error) {
    console.error("Failed to load mentor logbooks", error);
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

const handleUpdateStatus = async (item: any, newStatus: string) => {
  try {
    isStatusUpdating.value = item.id;
    await logbookService.updateLogbookStatus(item.id, { status: newStatus });
    swal.success("Berhasil", `Status logbook diubah menjadi ${newStatus}`);
    
    // Update local state to avoid full reload
    const index = logbooks.value.findIndex(l => l.id === item.id);
    if (index !== -1) {
      logbooks.value[index].status = newStatus;
    }
  } catch (error: any) {
    swal.error("Gagal", error?.response?._data?.message || "Gagal mengubah status logbook");
  } finally {
    isStatusUpdating.value = null;
  }
};

onMounted(() => {
  loadData();
});

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'submitted':
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'late':
    case 'rejected': return 'danger';
    default: return 'neutral';
  }
};

const openQuickView = (logbook: any) => {
  selectedLogbook.value = logbook;
  isQuickViewOpen.value = true;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400"> Mentor </p>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"> Monitoring Logbook </h1>
      </div>
    </div>

    <!-- Persistent Review Banner -->
    <div v-if="pendingReviewCount !== null" class="overflow-hidden rounded-2xl border shadow-sm transition-all duration-300"
      :class="pendingReviewCount > 0 
        ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
        : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'"
    >
      <div class="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full" 
            :class="pendingReviewCount > 0 ? 'bg-amber-100 dark:bg-amber-800' : 'bg-emerald-100 dark:bg-emerald-800'"
          >
            <UiIcon :name="pendingReviewCount > 0 ? 'mdi-clock-alert' : 'mdi-check-all'" 
              :class="pendingReviewCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'"
              size="md" 
            />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">
              Status Review Logbook: 
              <span :class="pendingReviewCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
                {{ pendingReviewCount > 0 ? `${pendingReviewCount} Menunggu Review` : 'Semua Beres' }}
              </span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ pendingReviewCount > 0 
                ? 'Mohon segera tinjau logbook mahasiswa bimbingan Anda.' 
                : 'Tidak ada logbook mahasiswa yang menunggu persetujuan saat ini.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex-1">
        <UiInput
          v-model="searchQuery"
          placeholder="Cari nama mahasiswa atau aktivitas..."
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
          class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <UiIcon name="mdi-refresh" :class="{ 'animate-spin': isInitialLoading }" size="md" />
          <span class="ml-2 md:hidden lg:inline text-sm font-medium">Refresh</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mahasiswa</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aktivitas</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rencana Besok</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Bukti</th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            <tr v-if="isInitialLoading">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat data logbook...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="logbooks.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                Tidak ada data logbook yang ditemukan.
              </td>
            </tr>
            <tr v-else v-for="item in logbooks" :key="item.id" class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-slate-900 dark:text-white">{{ item.student?.name || 'Mahasiswa' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ new Date(item.logDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                <p class="line-clamp-2">{{ item.activities }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                <p class="line-clamp-2">{{ item.planTomorrow }}</p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UiBadge :variant="getStatusBadgeVariant(item.status)">
                  {{ item.status || 'Pending' }}
                </UiBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                <a 
                  v-if="item.evidenceUrl" 
                  :href="item.evidenceUrl" 
                  target="_blank"
                  class="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <UiIcon name="mdi-link-variant" size="md" />
                </a>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <button 
                  @click="openQuickView(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                  title="Lihat Detail"
                >
                  <UiIcon name="mdi-eye" size="sm" />
                  <span class="hidden xl:inline">Review</span>
                </button>
                
                <template v-if="item.status === 'pending' || item.status === 'submitted'">
                  <button 
                    @click="handleUpdateStatus(item, 'rejected')"
                    :disabled="!!isStatusUpdating"
                    class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-medium text-sm disabled:opacity-50"
                    title="Tolak / Revisi"
                  >
                    <UiIcon v-if="isStatusUpdating === item.id" name="mdi-loading" class="animate-spin" size="sm" />
                    <UiIcon v-else name="mdi-close-circle" size="sm" />
                    <span class="hidden xl:inline">Revisi</span>
                  </button>
                  <button 
                    @click="handleUpdateStatus(item, 'approved')"
                    :disabled="!!isStatusUpdating"
                    class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors font-medium text-sm disabled:opacity-50"
                    title="Setujui"
                  >
                    <UiIcon v-if="isStatusUpdating === item.id" name="mdi-loading" class="animate-spin" size="sm" />
                    <UiIcon v-else name="mdi-check-circle" size="sm" />
                    <span class="hidden xl:inline">Approve</span>
                  </button>
                </template>
                <div v-else class="inline-flex items-center gap-1 text-xs text-slate-400 px-3">
                  <UiIcon name="mdi-check-all" size="sm" />
                  <span>Selesai</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Load More -->
      <div v-if="hasMore" class="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <button
          @click="loadMore"
          :disabled="isMoreLoading"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50 transition-colors"
        >
          <UiSpinner v-if="isMoreLoading" size="sm" />
          <span>{{ isMoreLoading ? 'Memuat...' : 'Muat Lebih Banyak' }}</span>
        </button>
      </div>
    </div>

    <!-- Quick View Modal -->
    <PagesInternshipLogbooksQuickViewModal
      v-model="isQuickViewOpen"
      :logbook="selectedLogbook"
      @refresh="loadData"
    />
  </div>
</template>
