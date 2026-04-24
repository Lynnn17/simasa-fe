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
    const res: any = await assignmentSvc.getMentorAssignments();
    assignments.value = res?.data?.items || res?.data || [];
  } catch (error) {
    console.error("Failed to load assignments", error);
  } finally {
    isLoading.value = false;
  }
}

async function handleAssign() {
  if (!form.value.studentId || !form.value.mentorId) {
    swal.toast("Pilih mahasiswa dan mentor terlebih dahulu", "warning");
    return;
  }

  try {
    isSubmitting.value = true;
    await assignmentSvc.assignMentor({
      studentId: form.value.studentId,
      mentorId: form.value.mentorId,
    });

    swal.success("Berhasil", "Mentor berhasil ditugaskan");
    showAssignModal.value = false;
    form.value = { studentId: null, mentorId: null };

    // Refresh data
    await Promise.all([loadAssignments(), loadStudents()]);
  } catch (error: any) {
    swal.error(
      "Gagal",
      error?.response?._data?.message || "Gagal menugaskan mentor",
    );
  } finally {
    isSubmitting.value = false;
  }
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
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        @click="showAssignModal = true"
      >
        <UiIcon name="mdi-plus" size="md" />
        <span>Tugaskan Mentor</span>
      </button>
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
            </tr>
          </thead>
          <tbody
            class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900"
          >
            <tr v-if="isLoading">
              <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <UiSpinner size="lg" />
                  <span>Memuat data riwayat...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="assignments.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-slate-500">
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Assignment Modal -->
    <UiModal v-model="showAssignModal" title="Tugaskan Mentor Baru" size="lg">
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
