<script setup lang="ts">
import internshipRegistrationService from "@/services/internship-registration.service";

definePageMeta({
  layout: "admin",
  permission: "REGISTRATION.VIEW",
});

useHead({
  title: "Dashboard Pendaftar Magang",
});

type RegistrationRow = {
  id?: string | number;
  fullName?: string;
  name?: string;
  university?: string;
  major?: string;
  semester?: string | number;
  phone?: string;
  email?: string;
  period?: string;
  cvFilePath?: string;
  cvUrl?: string;
  status?: string;
  appliedAt?: string;
  user?: any;
  applicant?: any;
  institution?: { name?: string };
  studyProgram?: { name?: string };
};

const registrationSvc = internshipRegistrationService();
const { t } = useTranslation();
const swalSvc = useSwal();
const route = useRoute();
const { hasPermission } = usePermission();

const isLoading = ref(false);
const isSubmitting = ref(false);
const showModal = ref(false);
const selectedData = ref<RegistrationRow | null>(null);

const tableData = ref({
  items: [],
  meta: { totalItems: 0 },
});

const headers = computed(() => [
  { key: "name", title: "Nama", sortable: true },
  { key: "university", title: "Universitas", sortable: true },
  { key: "major", title: "Jurusan", sortable: true },
  { key: "status", title: "Status", align: "center" },
  { key: "actions", title: "Aksi", align: "center", width: "15%" },
]);

const filterSchema = computed(() => [
  {
    name: "q",
    type: "search" as const,
    placeholder: "Cari nama, universitas...",
    colMd: 6,
  },
  {
    name: "status",
    type: "select" as const,
    placeholder: "Semua Status",
    items: "statusOptions",
    colMd: 6,
  },
]);

const filterList = {
  statusOptions: [
    { label: "Semua Status", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Diterima", value: "accepted" },
    { label: "Ditolak", value: "rejected" },
  ],
};

const actions = computed(() => [
  {
    key: "detail",
    icon: "mdi-eye",
    color: "#64748b",
    tooltip: "Detail",
    emit: "viewDetail",
  },
  {
    key: "approve",
    icon: "mdi-check",
    color: "#10b981",
    tooltip: "Terima",
    emit: "approveItem",
    show: (item: any) =>
      item.status === "pending" && hasPermission("REGISTRATION.UPDATE"),
  },
  {
    key: "reject",
    icon: "mdi-close",
    color: "#ef4444",
    tooltip: "Tolak",
    emit: "rejectItem",
    show: (item: any) =>
      item.status === "pending" && hasPermission("REGISTRATION.UPDATE"),
  },
]);

async function loadRegistrations() {
  const { pageNumber, pageSize, q, status } = route.query;
  isLoading.value = true;
  try {
    const params = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      search: q || "",
      status: status || "",
    };
    const res: any = await registrationSvc.getRegistrations(params);
    tableData.value = {
      items: res.data?.items || [],
      meta: res.data?.meta || { totalItems: 0 },
    };
  } catch (error) {
    console.error("Failed to load registrations", error);
  } finally {
    isLoading.value = false;
  }
}

function viewDetail(item: any) {
  selectedData.value = item;
  showModal.value = true;
}

// Handled by PendingRegistrationAlert component
const alertRef = ref();

async function handleStatusUpdate(item: any, status: string) {
  const isAccept = status === "accepted";
  const result = await swalSvc.confirm(
    isAccept ? "Terima Pendaftaran?" : "Tolak Pendaftaran?",
    isAccept
      ? "Anda akan menerima pendaftar ini."
      : "Anda akan menolak pendaftar ini.",
  );

  if (!result.isConfirmed) return;

  try {
    swalSvc.loading("Memproses...");
    await registrationSvc.updateRegistrationStatus(String(item.id), status);
    swalSvc.success("Berhasil", "Status pendaftaran berhasil diperbarui.");
    loadRegistrations();
    alertRef.value?.refresh();
  } catch (error: any) {
    swalSvc.error("Gagal", error?.message || "Gagal memperbarui status.");
  }
}

function getStatusLabel(status?: string) {
  if (!status) return "-";
  return status.replace(/_/g, " ");
}

function getStatusVariant(status?: string) {
  const value = (status || "").toLowerCase();
  if (["accepted", "diterima", "approved"].includes(value)) return "success";
  if (["rejected", "ditolak", "failed"].includes(value)) return "danger";
  if (["pending", "proses"].includes(value)) return "warning";
  return "neutral";
}

function getCvUrl(row: RegistrationRow) {
  const path = row.cvFilePath || row.cvUrl || row.user?.cvFilePath || "";
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `/api/files/${path.startsWith("/") ? path.slice(1) : path}`;
}

const { onEvent } = useSocket();

// Listen for new registration notifications
onEvent("new_notification", (data: any) => {
  if (data.type === "registration") {
    swalSvc.toast(data.message, "info");
  }
});

// Listen for data refresh trigger
onEvent("refresh_registrations", () => {
  refresh(); // This calls the useFetch refresh function
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">HRD</p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Dashboard Pendaftar Magang
        </h1>
      </div>

      <InternshipPendingRegistrationAlert ref="alertRef" />

    </div>


    <TableList
      :show-header="false"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :filterList="filterList"
      :actions="actions"
      @fetchData="loadRegistrations"
      @viewDetail="viewDetail"
      @approveItem="(item) => handleStatusUpdate(item, 'accepted')"
      @rejectItem="(item) => handleStatusUpdate(item, 'rejected')"
    >
      <template v-slot:[`item.name`]="{ item }">
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <span class="font-medium text-slate-900 dark:text-white">
              {{
                item.fullName ||
                item.name ||
                item.user?.fullName ||
                item.applicant?.fullName ||
                "-"
              }}
            </span>
            <UiBadge
              v-if="item.isEmailSent === false"
              variant="danger"
              size="sm"
              class="!px-1.5 !py-0.5 animate-pulse"
              title="Sistem gagal mengirimkan email ke pendaftar ini setelah 3x percobaan."
            >
              <i class="mdi mdi-email-alert-outline mr-1"></i>
              Email Gagal
            </UiBadge>
          </div>
          <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            {{ item.email }}
          </span>
        </div>
      </template>

      <template v-slot:[`item.university`]="{ item }">
        {{ item.university || item.institution?.name || "-" }}
      </template>

      <template v-slot:[`item.major`]="{ item }">
        {{ item.major || item.studyProgram?.name || "-" }}
      </template>

      <template v-slot:[`item.status`]="{ value }">
        <UiBadge :variant="getStatusVariant(value)">
          {{ getStatusLabel(value) }}
        </UiBadge>
      </template>
    </TableList>

    <UiModal v-model="showModal" title="Detail Pendaftar" size="lg">
      <div v-if="selectedData" class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">Nama</p>
          <p class="text-sm font-medium">
            {{
              selectedData.fullName ||
              selectedData.name ||
              selectedData.user?.fullName ||
              "-"
            }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">
            Universitas
          </p>
          <p class="text-sm font-medium">
            {{
              selectedData.university || selectedData.institution?.name || "-"
            }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">Jurusan</p>
          <p class="text-sm font-medium">
            {{ selectedData.major || selectedData.studyProgram?.name || "-" }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">Semester</p>
          <p class="text-sm font-medium">
            {{ selectedData.semester || selectedData.user?.semester || "-" }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">No HP</p>
          <p class="text-sm font-medium">
            {{ selectedData.phone || selectedData.user?.phone || "-" }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">Email</p>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium">
              {{ selectedData.email || selectedData.user?.email || "-" }}
            </p>
            <UiBadge
              v-if="selectedData.isEmailSent === false"
              variant="danger"
              size="sm"
            >
              ⚠️ Gagal Terkirim
            </UiBadge>
          </div>
        </div>
        <div class="sm:col-span-2 space-y-1">
          <p class="text-xs font-medium uppercase text-slate-400">Periode</p>
          <p class="text-sm font-medium">
            {{ selectedData.period || selectedData.user?.period || "-" }}
          </p>
        </div>
        <div class="sm:col-span-2 space-y-2">
          <p class="text-xs font-medium uppercase text-slate-400">CV</p>
          <div v-if="getCvUrl(selectedData)">
            <a
              :href="getCvUrl(selectedData)"
              target="_blank"
              class="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100"
            >
              <UiIcon name="mdi-file-pdf-box" size="md" />
              Lihat CV (PDF)
            </a>
          </div>
          <p v-else class="text-sm text-slate-500">CV tidak tersedia.</p>
        </div>
      </div>
      <template #footer>
        <UiButton color="secondary" @click="showModal = false">Tutup</UiButton>
        <template
          v-if="
            selectedData?.status === 'pending' &&
            hasPermission('REGISTRATION.UPDATE')
          "
        >
          <UiButton
            color="danger"
            @click="handleStatusUpdate(selectedData, 'rejected')"
          >
            Tolak
          </UiButton>
          <UiButton
            color="primary"
            @click="handleStatusUpdate(selectedData, 'accepted')"
          >
            Terima
          </UiButton>
        </template>
      </template>
    </UiModal>
  </div>
</template>

<!-- Force re-parse -->
