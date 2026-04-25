<script setup lang="ts">
import internshipRegistrationService from "@/services/internship-registration.service";
import internshipAssignmentService from "@/services/internship-assignment.service";
import userService from "@/services/user.service";

definePageMeta({
  layout: "admin",
  permission: "ASSEMENT_MENTOR.VIEW", // Adjust permission as needed
});

useHead({
  title: "Penugasan Mentor",
});

const registrationSvc = internshipRegistrationService();
const assignmentSvc = internshipAssignmentService();
const userSvc = userService();
const swal = useSwal();

// State
const isLoading = ref(false);
const isSubmitting = ref(false);
const showAssignModal = ref(false);

const students = ref<any[]>([]);
const mentors = ref<any[]>([]);
const assignments = ref<any[]>([]);
const selectedAssignment = ref<any>(null);

// Pagination & Filters
const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");
const search = ref("");
const statusFilter = ref("");
const mentorFilter = ref("");
const studentFilter = ref("");
const paginationMeta = ref<any>({
  totalData: 0,
  totalPage: 0,
  currentPage: 1,
  pageSize: 10,
});

// Debounce search
watch(searchQuery, (val) => {
  const timeout = setTimeout(() => {
    if (val === searchQuery.value) {
      search.value = val;
    }
  }, 500);
  return () => clearTimeout(timeout);
});

// Form State
const form = ref({
  studentId: null as string | null,
  mentorId: null as string | null,
});

// Load Data
async function loadStudents() {
  try {
    const res: any = await userSvc.retrieveAll({ roleId: "HA02" });
    const data = res?.data;
    students.value = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    console.log("Loaded accepted students:", students.value);
  } catch (error) {
    console.error("Failed to load students", error);
  }
}

async function loadMentors() {
  try {
    const res: any = await userSvc.retrieveAll({ roleId: "HA04" });
    const data = res?.data;
    mentors.value = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    console.log("Loaded mentors:", mentors.value);
  } catch (error) {
    console.error("Failed to load mentors", error);
  }
}

async function loadAssignments() {
  isLoading.value = true;
  try {
    const params = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      search: search.value,
      status: statusFilter.value,
      mentorId: mentorFilter.value,
      studentId: studentFilter.value,
      isActive:
        statusFilter.value === "" ? undefined : statusFilter.value === "true",
    };

    const res: any = await assignmentSvc.getMentorAssignments(params);
    const data = res?.data;

    if (data?.items) {
      assignments.value = data.items;
      paginationMeta.value = data.meta;
    } else if (Array.isArray(data)) {
      assignments.value = data;
      paginationMeta.value = {
        totalData: data.length,
        totalPage: 1,
        currentPage: 1,
        pageSize: data.length,
      };
    } else {
      assignments.value = [];
    }
  } catch (error) {
    console.error("Failed to load assignments", error);
  } finally {
    isLoading.value = false;
  }
}

// Watch filters
watch([search, statusFilter, mentorFilter, studentFilter, pageNumber], () => {
  loadAssignments();
});

function handlePageChange(page: number) {
  pageNumber.value = page;
}

async function handleAssign() {
  if (!form.value.studentId || !form.value.mentorId) {
    swal.toast("Pilih mahasiswa dan mentor terlebih dahulu", "warning");
    return;
  }

  try {
    isSubmitting.value = true;
    swal.loading("Memproses...");

    const payload = {
      studentId: form.value.studentId,
      mentorId: form.value.mentorId,
    };

    if (selectedAssignment.value) {
      await assignmentSvc.updateMentorAssignment(selectedAssignment.value.id, payload);
      swal.success("Berhasil", "Penugasan mentor berhasil diperbarui");
    } else {
      await assignmentSvc.assignMentor(payload);
      swal.success("Berhasil", "Mentor berhasil ditugaskan");
    }

    showAssignModal.value = false;
    resetForm();

    // Refresh data
    await Promise.all([loadAssignments(), loadStudents()]);
  } catch (error: any) {
    swal.error(
      "Gagal",
      error?.response?._data?.message || "Gagal memproses penugasan mentor",
    );
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  form.value = { studentId: null, mentorId: null };
  selectedAssignment.value = null;
}

function openAssignModal() {
  resetForm();
  showAssignModal.value = true;
}

function openEditModal(item: any) {
  selectedAssignment.value = item;

  // Pastikan mahasiswa ada di daftar agar label muncul di autocomplete
  if (!students.value.find((s) => s.id === item.studentId)) {
    students.value.push({
      id: item.studentId,
      name: item.studentName,
    });
  }

  // Pastikan mentor ada di daftar
  if (!mentors.value.find((m) => m.id === item.mentorId)) {
    mentors.value.push({
      id: item.mentorId,
      name: item.mentorName,
    });
  }

  form.value = {
    studentId: item.studentId,
    mentorId: item.mentorId,
  };
  showAssignModal.value = true;
}

onMounted(() => {
  loadAssignments();
  loadStudents();
  loadMentors();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          HRD
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Penugasan Mentor
        </h1>
      </div>
    </div>

    <!-- Stats or Info (Optional) -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20"
          >
            <UiIcon name="mdi-account-group" size="lg" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Total Penugasan</p>
            <p class="text-2xl font-semibold text-slate-900 dark:text-white">
              {{ assignments.length }}
            </p>
          </div>
        </div>
      </div>
      <!-- Add more stats as needed -->
    </div>

    <!-- Filters Bar -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div class="lg:col-span-2">
        <UiInput
          v-model="searchQuery"
          placeholder="Cari nama mahasiswa atau mentor..."
          icon="mdi-magnify"
        />
      </div>
      <div>
        <UiSelect
          v-model="mentorFilter"
          placeholder="Filter Mentor"
          :options="[
            { label: 'Semua Mentor', value: '' },
            ...mentors.map((m) => ({ label: m.name, value: m.id })),
          ]"
        />
      </div>
      <div>
        <UiSelect
          v-model="statusFilter"
          placeholder="Status"
          :options="[
            { label: 'Semua Status', value: '' },
            { label: 'Aktif', value: 'true' },
            { label: 'Non-aktif', value: 'false' },
          ]"
        />
      </div>

      <button
        @click="loadAssignments"
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
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        @click="openAssignModal"
      >
        <UiIcon name="mdi-plus" size="md" />
        <span>Tugaskan Mentor</span>
      </button>
    </div>

    <!-- Table Content -->
    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 class="font-semibold text-slate-900 dark:text-white">
          Riwayat Penugasan
        </h3>
        <p class="text-sm text-slate-500">
          Daftar mahasiswa yang sudah dipasangkan dengan mentor.
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
                Mentor
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Tanggal Penugasan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Status
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
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat data riwayat...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="assignments.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                Belum ada data penugasan.
              </td>
            </tr>
            <tr
              v-else
              v-for="item in assignments"
              :key="item.id"
              class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-slate-900 dark:text-white">
                  {{ item.studentName }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ item.studentEmail || "-" }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                {{ item.mentorName }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{
                  item.assignedAt
                    ? new Date(item.assignedAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"
                }}
              </td>
              <td class="px-6 py-4">
                <UiBadge :variant="item.isActive ? 'success' : 'neutral'">
                  {{ item.isActive ? "Aktif" : "Non-aktif" }}
                </UiBadge>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="openEditModal(item)"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm"
                >
                  <UiIcon name="mdi-pencil" size="sm" />
                  <span>Edit</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="paginationMeta.totalPage > 1"
        class="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row"
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Menampilkan
          <span class="font-medium text-slate-900 dark:text-white">{{
            assignments.length
          }}</span>
          dari
          <span class="font-medium text-slate-900 dark:text-white">{{
            paginationMeta.totalData
          }}</span>
          penugasan
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="pageNumber === 1 || isLoading"
            class="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            @click="handlePageChange(pageNumber - 1)"
          >
            <UiIcon name="mdi-chevron-left" size="sm" />
          </button>

          <div class="flex items-center gap-1">
            <template v-for="p in paginationMeta.totalPage" :key="p">
              <button
                v-if="
                  p === 1 ||
                  p === paginationMeta.totalPage ||
                  (p >= pageNumber - 1 && p <= pageNumber + 1)
                "
                type="button"
                :class="[
                  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition',
                  p === pageNumber
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                ]"
                @click="handlePageChange(p)"
              >
                {{ p }}
              </button>
              <span
                v-else-if="
                  (p === 2 && pageNumber > 3) ||
                  (p === paginationMeta.totalPage - 1 &&
                    pageNumber < paginationMeta.totalPage - 2)
                "
                class="px-1 text-slate-400"
              >
                ...
              </span>
            </template>
          </div>

          <button
            type="button"
            :disabled="pageNumber === paginationMeta.totalPage || isLoading"
            class="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            @click="handlePageChange(pageNumber + 1)"
          >
            <UiIcon name="mdi-chevron-right" size="sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <UiModal v-model="showAssignModal" :title="selectedAssignment ? 'Edit Penugasan Mentor' : 'Tugaskan Mentor Baru'" size="lg">
      <div class="space-y-6">
        <p class="text-sm text-slate-500">
          Pilih mahasiswa yang sudah diterima dan tentukan mentor yang akan
          mendampingi mereka.
        </p>

        <div class="grid gap-6 sm:grid-cols-2">
          <UiAutocomplete
            v-model="form.studentId"
            label="Mahasiswa"
            placeholder="Pilih mahasiswa..."
            :options="students"
            item-value="id"
            item-title="name"
            required
          />

          <UiAutocomplete
            v-model="form.mentorId"
            label="Mentor"
            placeholder="Pilih mentor..."
            :options="mentors"
            item-value="id"
            item-title="name"
            required
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="showAssignModal = false"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-500 disabled:opacity-50"
          @click="handleAssign"
        >
          <UiSpinner v-if="isSubmitting" size="sm" />
          <span>{{ isSubmitting ? "Memproses..." : "Tugaskan" }}</span>
        </button>
      </template>
    </UiModal>
  </div>
</template>
