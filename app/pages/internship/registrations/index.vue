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
  user?: {
    name?: string;
    fullName?: string;
    university?: string;
    major?: string;
    semester?: string | number;
    phone?: string;
    email?: string;
    period?: string;
    cvFilePath?: string;
    cvUrl?: string;
  };
  applicant?: {
    name?: string;
    fullName?: string;
    university?: string;
    major?: string;
    semester?: string | number;
    phone?: string;
    email?: string;
    period?: string;
    cvFilePath?: string;
    cvUrl?: string;
  };
  institution?: {
    name?: string;
  };
  studyProgram?: {
    name?: string;
  };
};

const registrationSvc = internshipRegistrationService();
const registrations = ref<RegistrationRow[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");
const isModalOpen = ref(false);
const selectedData = ref<RegistrationRow | null>(null);
const { hasPermission } = usePermission();
const swal = useSwal();

function getRegistrationName(row: RegistrationRow) {
  return (
    row.fullName ||
    row.name ||
    row.user?.fullName ||
    row.user?.name ||
    row.applicant?.fullName ||
    row.applicant?.name ||
    "-"
  );
}

function getUniversity(row: RegistrationRow) {
  return (
    row.university ||
    row.user?.university ||
    row.applicant?.university ||
    row.institution?.name ||
    "-"
  );
}

function getMajor(row: RegistrationRow) {
  return (
    row.major ||
    row.user?.major ||
    row.applicant?.major ||
    row.studyProgram?.name ||
    "-"
  );
}

function getSemester(row: RegistrationRow) {
  return row.semester || row.user?.semester || row.applicant?.semester || "-";
}

function getPhone(row: RegistrationRow) {
  return row.phone || row.user?.phone || row.applicant?.phone || "-";
}

function getEmail(row: RegistrationRow) {
  return row.email || row.user?.email || row.applicant?.email || "-";
}

function getPeriod(row: RegistrationRow) {
  return row.period || row.user?.period || row.applicant?.period || "-";
}

function getCvUrl(row: RegistrationRow) {
  const path =
    row.cvFilePath ||
    row.cvUrl ||
    row.user?.cvFilePath ||
    row.user?.cvUrl ||
    row.applicant?.cvFilePath ||
    row.applicant?.cvUrl ||
    "";

  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Prefix with /api/files/ if it's a relative path
  return `/api/files/${path.startsWith("/") ? path.slice(1) : path}`;
}

function getStatusLabel(status?: string) {
  if (!status) return "-";
  return status.replace(/_/g, " ");
}

function getStatusClass(status?: string) {
  const value = (status || "").toLowerCase();

  if (["approved", "diterima", "accepted", "lolos"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
  }

  if (["rejected", "ditolak", "declined", "failed"].includes(value)) {
    return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20";
  }

  if (["pending", "proses", "review", "waiting"].includes(value)) {
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
}

function closeModal() {
  isModalOpen.value = false;
  selectedData.value = null;
}

function openModal(row: RegistrationRow) {
  selectedData.value = row;
  isModalOpen.value = true;
}

async function loadRegistrations() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response: any = await registrationSvc.getRegistrations();
    const data = response?.data;
    registrations.value = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
  } catch (error: any) {
    errorMessage.value =
      error?.response?._data?.message ||
      error?.response?._data?.error ||
      error?.message ||
      "Gagal memuat data pendaftaran magang.";
  } finally {
    isLoading.value = false;
  }
}

async function updateStatus(
  status: string,
  row: RegistrationRow | null = selectedData.value,
) {
  if (!row?.id) return;

  const confirmationText =
    status === "accepted"
      ? "Anda akan menerima pendaftar ini. Email konfirmasi akan dikirim ke email pendaftar"
      : "Anda akan menolak pendaftar ini. Email akan dikirim ke email pendaftar";

  const result = await swal.confirm(
    status === "accepted" ? "Terima Pendaftaran?" : "Tolak Pendaftaran?",
    confirmationText,
  );

  if (!result.isConfirmed) return;

  try {
    isSubmitting.value = true;
    swal.loading("Memproses...");
    await registrationSvc.updateRegistrationStatus(String(row.id), status);
    swal.closeLoading();
    swal.success(
      "Berhasil",
      `Pendaftaran berhasil ${status === "accepted" ? "Diterima" : "Ditolak"}.`,
    );
    if (selectedData.value?.id === row.id) {
      closeModal();
    }
    await loadRegistrations();
  } catch (error: any) {
    swal.closeLoading();
    swal.error(
      "Gagal",
      error?.response?._data?.message ||
        error?.response?._data?.error ||
        error?.message ||
        "Gagal memperbarui status pendaftaran.",
    );
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  loadRegistrations();
});
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          HRD
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Dashboard Pendaftar Magang
        </h1>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        @click="loadRegistrations"
      >
        Muat Ulang
      </button>
    </div>

    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="overflow-x-auto">
        <table
          class="min-w-full divide-y divide-slate-200 dark:divide-slate-800"
        >
          <thead class="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Nama
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Universitas
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Jurusan
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Status
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody
            class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900"
          >
            <tr v-if="isLoading">
              <td
                colspan="5"
                class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Memuat data...
              </td>
            </tr>

            <tr v-else-if="errorMessage">
              <td
                colspan="5"
                class="px-4 py-10 text-center text-sm text-rose-600 dark:text-rose-400"
              >
                {{ errorMessage }}
              </td>
            </tr>

            <tr v-else-if="!registrations.length">
              <td
                colspan="5"
                class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Belum ada data pendaftar magang.
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="(registration, index) in registrations"
                :key="registration.id ?? index"
                class="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td
                  class="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900 dark:text-white"
                >
                  {{ getRegistrationName(registration) }}
                </td>
                <td
                  class="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-300"
                >
                  {{ getUniversity(registration) }}
                </td>
                <td
                  class="whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-300"
                >
                  {{ getMajor(registration) }}
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize"
                    :class="getStatusClass(registration.status)"
                  >
                    {{ getStatusLabel(registration.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      @click="openModal(registration)"
                    >
                      Detail
                    </button>
                    <template
                      v-if="
                        hasPermission('REGISTRATION.UPDATE') &&
                        registration.status === 'pending'
                      "
                    >
                      <button
                        type="button"
                        :disabled="isSubmitting"
                        class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        @click="updateStatus('accepted', registration)"
                      >
                        Terima
                      </button>
                      <button
                        type="button"
                        :disabled="isSubmitting"
                        class="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                        @click="updateStatus('rejected', registration)"
                      >
                        Tolak
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800"
        >
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Detail Pendaftar
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Informasi lengkap mahasiswa yang mengajukan magang.
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <div class="grid gap-4 px-6 py-6 sm:grid-cols-2">
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Nama
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getRegistrationName(selectedData) : "-" }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Universitas
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getUniversity(selectedData) : "-" }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Jurusan
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getMajor(selectedData) : "-" }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Semester
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getSemester(selectedData) : "-" }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              No HP
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getPhone(selectedData) : "-" }}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Email
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getEmail(selectedData) : "-" }}
            </p>
          </div>
          <div class="sm:col-span-2">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Periode
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {{ selectedData ? getPeriod(selectedData) : "-" }}
            </p>
          </div>
          <div class="sm:col-span-2">
            <p
              class="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              CV
            </p>
            <div class="mt-2 flex items-center gap-3">
              <a
                v-if="selectedData && getCvUrl(selectedData)"
                :href="getCvUrl(selectedData)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20"
              >
                <UiIcon name="mdi-file-pdf-box" size="md" />
                <span>Lihat CV (PDF)</span>
              </a>
              <p v-else class="text-sm text-slate-500 dark:text-slate-400">
                CV tidak tersedia.
              </p>
            </div>
          </div>
        </div>

        <div
          class="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800"
        >
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="closeModal"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
