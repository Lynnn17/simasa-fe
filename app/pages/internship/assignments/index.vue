<script setup lang="ts">
import internshipRegistrationService from "@/services/internship-registration.service";
import internshipAssignmentService from "@/services/internship-assignment.service";
import userService from "@/services/user.service";

definePageMeta({
  layout: "admin",
  permission: "ASSEMENT_MENTOR.VIEW",
});

useHead({
  title: "Penugasan Mentor",
});

const assignmentSvc = internshipAssignmentService();
const userSvc = userService();
const swal = useSwal();
const route = useRoute();
const { t } = useTranslation();

// State
const isLoading = ref(false);
const isSubmitting = ref(false);
const showAssignModal = ref(false);

const students = ref<any[]>([]);
const mentors = ref<any[]>([]);
const selectedAssignment = ref<any>(null);

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});

const headers = computed(() => [
  { key: "studentName", title: "Mahasiswa", sortable: true },
  { key: "mentorName", title: "Mentor", sortable: true },
  { key: "assignedAt", title: "Tanggal Penugasan", align: "center" },
  { key: "status", title: "Status", align: "center" },
  { key: "actions", title: "Aksi", align: "center", width: "10%" },
]);

const filterSchema = computed(() => [
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari mahasiswa...",
    colMd: 4,
  },
  {
    name: "mentorId",
    type: "select" as const,
    placeholder: "Filter Mentor",
    items: "mentorOptions",
    colMd: 4,
  },
  {
    name: "status",
    type: "select" as const,
    placeholder: "Semua Status",
    items: "statusOptions",
    colMd: 4,
  },
]);

const filterList = computed(() => ({
  mentorOptions: [
    { label: "Semua Mentor", value: "" },
    ...mentors.value.map((m) => ({ label: m.name, value: m.id })),
  ],
  statusOptions: [
    { label: "Semua Status", value: "" },
    { label: "Aktif", value: "true" },
    { label: "Non-aktif", value: "false" },
  ],
}));

const actions = computed(() => [
  {
    key: "edit",
    icon: "mdi-pencil",
    color: "#0284c7",
    tooltip: "Edit",
    emit: "editItem",
  },
]);

const actionToolbars = computed(() => [
  {
    key: "addItem",
    icon: "mdi-plus-circle-outline",
    color: "primary",
    tooltip: "Tugaskan Mentor",
    emit: "addItem",
    type: "default" as const,
  },
]);

// Form State
const form = ref({
  studentId: null as string | null,
  mentorId: null as string | null,
});

async function loadAssignments() {
  const { pageNumber, pageSize, q, status, mentorId } = route.query;
  isLoading.value = true;
  try {
    const params = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      search: q || "",
      mentorId: mentorId || "",
      isActive: status || "",
    };

    const res: any = await assignmentSvc.getMentorAssignments(params);
    tableData.value = {
      items: res?.data?.items || [],
      meta: res?.data?.meta || { totalItems: 0 },
    };
  } catch (error) {
    console.error("Failed to load assignments", error);
  } finally {
    isLoading.value = false;
  }
}

const registrationSvc = internshipRegistrationService();

// Load only accepted students who are NOT yet assigned to a mentor
async function loadStudents() {
  try {
    // Get accepted registrations
    const regRes: any = await registrationSvc.getAcceptedStudents();
    const registrations = regRes?.data?.items || regRes?.data || [];

    // Get existing assignments to filter out already-assigned students
    const assignRes: any = await assignmentSvc.getMentorAssignments({ pageSize: 999 });
    const assignments = assignRes?.data?.items || [];
    const assignedStudentIds = new Set(assignments.map((a: any) => a.studentId));

    // Only show students who are accepted but NOT yet assigned
    students.value = registrations
      .filter((r: any) => !assignedStudentIds.has(r.userId || r.studentId || r.id))
      .map((r: any) => ({
        id: r.userId || r.studentId || r.id,
        name: r.fullName || r.name || r.user?.name || '-',
      }));
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
  } catch (error) {
    console.error("Failed to load mentors", error);
  }
}

const noMentorsAvailable = computed(() => mentors.value.length === 0);

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
      await assignmentSvc.updateMentorAssignment(
        selectedAssignment.value.id,
        payload,
      );
      swal.success("Berhasil", "Penugasan mentor berhasil diperbarui");
    } else {
      await assignmentSvc.assignMentor(payload);
      swal.success("Berhasil", "Mentor berhasil ditugaskan");
    }

    showAssignModal.value = false;
    loadAssignments();
    loadStudents();
  } catch (error: any) {
    const errorMsg =
      error?.response?._data?.message ||
      error?.response?._data?.error ||
      "Gagal memproses penugasan mentor";

    if (errorMsg === "student already has a mentor assignment") {
      const confirm = await swal.confirm(
        "Mahasiswa Sudah Memiliki Mentor",
        "Mahasiswa ini sudah memiliki mentor aktif. Apakah Anda yakin ingin menggantinya dengan mentor baru?",
        "warning",
        "Ya, Ganti Mentor",
      );

      if (confirm) {
        try {
          isSubmitting.value = true;
          swal.loading("Memperbarui Mentor...");
          await assignmentSvc.assignMentor({ ...payload, force: true });
          swal.success("Berhasil", "Mentor berhasil diperbarui");
          showAssignModal.value = false;
          loadAssignments();
          loadStudents();
          return;
        } catch (innerError: any) {
          swal.error(
            "Gagal",
            innerError?.response?._data?.message || "Gagal mengganti mentor",
          );
          return;
        } finally {
          isSubmitting.value = false;
        }
      }
    }

    swal.error("Gagal", errorMsg);
  } finally {
    isSubmitting.value = false;
  }
}

function openEditModal(item: any) {
  selectedAssignment.value = item;

  // Ensure the student exists in list for label
  if (item.studentId && !students.value.find((s) => s.id === item.studentId)) {
    students.value.push({ id: item.studentId, name: item.studentName });
  }

  // Ensure the mentor exists in list for label
  if (item.mentorId && !mentors.value.find((m) => m.id === item.mentorId)) {
    mentors.value.push({ id: item.mentorId, name: item.mentorName });
  }

  form.value = {
    studentId: item.studentId,
    mentorId: item.mentorId,
  };
  showAssignModal.value = true;
}

function openAddModal() {
  selectedAssignment.value = null;
  form.value = { studentId: null, mentorId: null };
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
    <div>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">HRD</p>
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
      >
        Penugasan Mentor
      </h1>
    </div>

    <!-- Warning: No Mentors -->
    <div
      v-if="noMentorsAvailable"
      class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
    >
      <UiIcon name="mdi-alert-circle-outline" size="lg" />
      <div>
        <p class="font-semibold">Belum ada data Mentor aktif dalam sistem</p>
        <p class="text-sm">Silakan tambahkan data Mentor terlebih dahulu sebelum melakukan penugasan.</p>
      </div>
    </div>

    <!-- Stats -->
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
              {{ tableData.meta.totalItems }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <TableList
      title="Daftar Penugasan"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :filterList="filterList"
      :actions="actions"
      :actionToolbars="actionToolbars"
      @fetchData="loadAssignments"
      @addItem="openAddModal"
      @editItem="openEditModal"
    >
      <template v-slot:[`item.studentName`]="{ item }">
        <div class="font-medium text-slate-900 dark:text-white">
          {{ item.studentName }}
        </div>
        <div class="text-xs text-slate-500">
          {{ item.studentEmail || "-" }}
        </div>
      </template>

      <template v-slot:[`item.assignedAt`]="{ value }">
        {{
          value
            ? new Date(value).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "-"
        }}
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <UiBadge :variant="item.isActive ? 'success' : 'neutral'">
          {{ item.isActive ? "Aktif" : "Non-aktif" }}
        </UiBadge>
      </template>
    </TableList>

    <!-- Assignment Modal -->
    <UiModal
      v-model="showAssignModal"
      :title="
        selectedAssignment ? 'Edit Penugasan Mentor' : 'Tugaskan Mentor Baru'
      "
      size="lg"
    >
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
            :disabled="!!selectedAssignment"
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
        <UiButton color="secondary" @click="showAssignModal = false"
          >Batal</UiButton
        >
        <UiButton color="primary" :loading="isSubmitting" @click="handleAssign">
          {{ selectedAssignment ? "Simpan" : "Tugaskan" }}
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>
