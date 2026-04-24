<script setup lang="ts">
import internshipTaskService from "@/services/internship-task.service";
import internshipAssignmentService from "@/services/internship-assignment.service";
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  layout: "admin",
  permission: "REGISTRATION.VIEW", // Adjust permission as needed
});

useHead({
  title: "Tugas Mentor",
});

const taskSvc = internshipTaskService();
const assignmentSvc = internshipAssignmentService();
const authStore = useAuthStore();
const swal = useSwal();

// State
const isLoading = ref(false);
const isSubmitting = ref(false);
const showCreateModal = ref(false);

const tasks = ref<any[]>([]);
const students = ref<any[]>([]);

// Form State
const form = ref({
  studentId: null as string | null,
  title: "",
  description: "",
  deadline: null as string | null,
});

const isMentor = computed(() => authStore.user?.roleId === "HA03");
const isHRD = computed(() => authStore.user?.roleId === "HA01");

// Load Data
async function loadStudents() {
  if (!isMentor.value || !authStore.user?.id) return;
  
  try {
    const res: any = await assignmentSvc.getStudentsByMentor(authStore.user.id);
    students.value = res?.data || [];
  } catch (error) {
    console.error("Failed to load students", error);
  }
}

async function loadTasks() {
  if (!authStore.user?.id) return;
  
  isLoading.value = true;
  try {
    let res: any;
    if (isMentor.value) {
      res = await taskSvc.getTasksByMentor(authStore.user.id);
    } else if (isHRD.value) {
      // Backend doesn't have GetAll tasks, maybe we'll just show nothing or add it later
      tasks.value = [];
      return;
    } else {
      res = await taskSvc.getTasksByStudent(authStore.user.id);
    }
    tasks.value = res?.data || [];
  } catch (error) {
    console.error("Failed to load tasks", error);
  } finally {
    isLoading.value = false;
  }
}

async function handleCreateTask() {
  if (!form.value.studentId || !form.value.title || !form.value.deadline) {
    swal.toast("Lengkapi data tugas terlebih dahulu", "warning");
    return;
  }

  try {
    isSubmitting.value = true;
    await taskSvc.createTask({
      mentorId: authStore.user?.id,
      studentId: form.value.studentId,
      title: form.value.title,
      description: form.value.description,
      deadline: form.value.deadline,
    });
    
    swal.success("Berhasil", "Tugas baru telah dibuat");
    showCreateModal.value = false;
    resetForm();
    await loadTasks();
  } catch (error: any) {
    swal.error("Gagal", error?.response?._data?.message || "Gagal membuat tugas");
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  form.value = {
    studentId: null,
    title: "",
    description: "",
    deadline: null,
  };
}

function getStatusClass(status: string) {
  switch (status) {
    case 'assigned': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'submitted': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'graded': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'assigned': return 'Ditugaskan';
    case 'submitted': return 'Menunggu Penilaian';
    case 'graded': return 'Dinilai';
    default: return status;
  }
}

onMounted(() => {
  loadTasks();
  if (isMentor.value) {
    loadStudents();
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          Internship Management
        </p>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Tugas Peserta Magang
        </h1>
      </div>
      <button
        v-if="isMentor"
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        @click="showCreateModal = true"
      >
        <UiIcon name="mdi-plus" size="md" />
        <span>Buat Tugas Baru</span>
      </button>
    </div>

    <!-- Table Content -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 class="font-semibold text-slate-900 dark:text-white">Daftar Tugas</h3>
        <p class="text-sm text-slate-500">Kelola tugas yang diberikan kepada peserta magang.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Judul Tugas</th>
              <th v-if="!isMentor" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mentor</th>
              <th v-if="isMentor" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mahasiswa</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deadline</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nilai</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat daftar tugas...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="tasks.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                Belum ada tugas yang dibuat.
              </td>
            </tr>
            <tr 
              v-else 
              v-for="item in tasks" 
              :key="item.id"
              class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-slate-900 dark:text-white">{{ item.title }}</div>
                <div class="text-xs text-slate-500 line-clamp-1">{{ item.description }}</div>
              </td>
              <td v-if="!isMentor" class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                {{ item.mentorName || '-' }}
              </td>
              <td v-if="isMentor" class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                {{ item.studentName || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' }}
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="getStatusClass(item.status)"
                >
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                {{ item.grade !== null ? item.grade : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Task Modal -->
    <UiModal
      v-model="showCreateModal"
      title="Buat Tugas Baru"
      size="lg"
    >
      <div class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <UiAutocomplete
            v-model="form.studentId"
            label="Mahasiswa"
            placeholder="Pilih mahasiswa..."
            :options="students"
            item-value="studentId"
            item-title="studentName"
            required
          />
          
          <UiDatePicker
            v-model="form.deadline"
            label="Deadline"
            mode="datetime"
            required
          />
        </div>

        <UiInput
          v-model="form.title"
          label="Judul Tugas"
          placeholder="Masukkan judul tugas..."
          required
        />

        <UiTextarea
          v-model="form.description"
          label="Deskripsi Tugas"
          placeholder="Masukkan deskripsi atau instruksi tugas..."
          rows="4"
          required
        />
      </div>

      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="showCreateModal = false"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-500 disabled:opacity-50"
          @click="handleCreateTask"
        >
          <UiSpinner v-if="isSubmitting" size="sm" />
          <span>{{ isSubmitting ? 'Memproses...' : 'Buat Tugas' }}</span>
        </button>
      </template>
    </UiModal>
  </div>
</template>
