<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipTaskService from "@/services/internship-task.service";
import internshipAssignmentService from "@/services/internship-assignment.service";

const authStore = useAuthStore();
const taskSvc = internshipTaskService();
const assignmentSvc = internshipAssignmentService();
const mentorId = computed(() => authStore.user?.id);

const tasks = ref<any[]>([]);
const students = ref<any[]>([]);

const searchQuery = ref("");
const search = ref("");
const studentSearch = ref("");
const status = ref("");
const date = ref("");
const pageNumber = ref(1);
const pageSize = ref(10);
const hasMore = ref(false);

const isInitialLoading = ref(true);
const isMoreLoading = ref(false);

const isCreateModalOpen = ref(false);
const isGradeModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const selectedTask = ref<any>(null);

async function loadData(isLoadMore = false) {
  if (!mentorId.value) return;
  
  if (isLoadMore) {
    isMoreLoading.value = true;
  } else {
    isInitialLoading.value = true;
    pageNumber.value = 1;
    tasks.value = [];
  }

  try {
    const params = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      search: search.value,
      studentSearch: studentSearch.value,
      status: status.value,
      date: date.value,
    };
    
    const res: any = await taskSvc.getTasksByMentor(mentorId.value, params);
    const newData = res?.data?.items || [];
    const meta = res?.data?.meta || {};
    
    if (isLoadMore) {
      tasks.value = [...tasks.value, ...newData];
    } else {
      tasks.value = newData;
    }
    
    hasMore.value = meta.currentPage < meta.totalPage;
  } catch (error) {
    console.error("Failed to load mentor tasks", error);
  } finally {
    isInitialLoading.value = false;
    isMoreLoading.value = false;
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

watch(status, () => loadData(false));
watch(date, () => loadData(false));
watch(studentSearch, () => loadData(false));

watch(searchQuery, (newVal) => {
  const timeout = setTimeout(() => {
    if (newVal === searchQuery.value) {
      search.value = newVal;
      loadData(false);
    }
  }, 500);
  return () => clearTimeout(timeout);
});

onMounted(() => {
  loadData();
  loadStudents();
});

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'graded': return 'success';
    case 'submitted': return 'warning';
    case 'revision_needed': return 'danger';
    case 'assigned':
    default: return 'neutral';
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'assigned': return 'Ditugaskan';
    case 'submitted': return 'Menunggu Penilaian';
    case 'graded': return 'Lulus / Dinilai';
    case 'revision_needed': return 'Butuh Revisi';
    default: return status || 'Assigned';
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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          Mentor
        </p>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Manajemen Tugas
        </h1>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col md:flex-row flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div class="flex-1 min-w-[200px]">
        <UiInput
          v-model="searchQuery"
          placeholder="Cari judul tugas..."
          icon="mdi-magnify"
        />
      </div>
      <div class="flex-1 min-w-[200px]">
        <UiAutocomplete
          v-model="studentSearch"
          placeholder="Cari mahasiswa..."
          icon="mdi-account-search"
          :options="students.map(s => ({ label: s.studentName || s.name || s.student?.name, value: s.studentName || s.name || s.student?.name }))"
          clearable
        />
      </div>
      <div class="w-full md:w-40">
        <UiSelect
          v-model="status"
          placeholder="Semua Status"
          :options="[
            { label: 'Semua Status', value: '' },
            { label: 'Ditugaskan', value: 'assigned' },
            { label: 'Menunggu Penilaian', value: 'submitted' },
            { label: 'Dinilai', value: 'graded' },
            { label: 'Revisi', value: 'revision_needed' },
          ]"
        />
      </div>
      <div class="w-full md:w-40">
        <input
          v-model="date"
          type="date"
          class="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="loadData(false)"
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
          @click="handleCreateNew"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 whitespace-nowrap"
        >
          <UiIcon name="mdi-plus" size="md" />
          <span>Tambah</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Judul Tugas</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mahasiswa</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deadline</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th class="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Nilai</th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            <tr v-if="isInitialLoading">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat daftar tugas...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="tasks.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                Belum ada tugas yang Anda berikan kepada mahasiswa.
              </td>
            </tr>
            <tr v-else v-for="item in tasks" :key="item.id" class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4">
                <div class="font-medium text-slate-900 dark:text-white">{{ item.title }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-xs text-slate-500 line-clamp-2 max-w-xs">{{ item.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-900 dark:text-slate-300">{{ item.student?.name || item.studentName || 'Mahasiswa' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UiBadge :variant="getStatusBadgeVariant(item.status)">
                  {{ getStatusLabel(item.status) }}
                </UiBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-slate-900 dark:text-white">
                {{ item.grade !== null && item.grade !== undefined ? item.grade : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button 
                  v-if="item.status === 'assigned' || item.status === 'revision_needed'"
                  @click="handleEdit(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors font-medium text-sm mr-2"
                >
                  <UiIcon name="mdi-pencil-outline" size="sm" />
                  <span>Edit</span>
                </button>
                <button 
                  v-if="item.status === 'submitted'"
                  @click="handleGrade(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors font-medium text-sm"
                >
                  <UiIcon name="mdi-pencil-outline" size="sm" />
                  <span>Nilai Tugas</span>
                </button>
                <button 
                  @click="handleDetail(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  <UiIcon name="mdi-eye" size="sm" />
                  <span>Detail</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination / Load More -->
      <div v-if="hasMore" class="border-t border-slate-200 p-4 text-center dark:border-slate-800">
        <button
          type="button"
          :disabled="isMoreLoading"
          @click="() => { pageNumber++; loadData(true); }"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
        >
          <UiSpinner v-if="isMoreLoading" size="sm" />
          <span>{{ isMoreLoading ? 'Memuat...' : 'Muat Lebih Banyak' }}</span>
        </button>
      </div>
    </div>

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
