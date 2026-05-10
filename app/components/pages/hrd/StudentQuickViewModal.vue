<script setup lang="ts">
import { ref, watch } from "vue";
import hrdService from "@/services/hrd.service";
import userService from "@/services/user.service";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const props = defineProps<{
  modelValue: boolean;
  studentId: string | null;
}>();

const emit = defineEmits(["update:modelValue", "finished"]);

const { getStudentQuickView } = hrdService();
const { updateActiveStatus } = userService();
const swal = useSwal();
const toast = useToast();

const detail = ref<any>(null);
const isLoading = ref(false);
const isFinishing = ref(false);

watch(
  () => props.modelValue,
  async (val) => {
    if (val && props.studentId) {
      isLoading.value = true;
      try {
        const res = await getStudentQuickView(props.studentId);
        detail.value = res.data;
      } catch (error) {
        console.error("Failed to fetch student quick view:", error);
      } finally {
        isLoading.value = false;
      }
    } else {
      detail.value = null;
    }
  },
);

const closeModal = () => emit("update:modelValue", false);

const handleFinishInternship = async () => {
  const result = await swal.confirmDelete(detail.value.studentName, {
    title: "Selesaikan Magang",
    text: `Apakah Anda yakin ingin menyelesaikan masa magang ${detail.value.studentName}? Setelah diselesaikan, mahasiswa ini tidak akan muncul lagi di tabel monitoring.`,
    confirmText: "Ya, Selesaikan",
  });

  if (result.isConfirmed) {
    isFinishing.value = true;
    try {
      await updateActiveStatus({
        id: props.studentId,
        active: false,
      });
      toast.success("Masa magang berhasil diselesaikan");
      emit("finished");
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyelesaikan magang");
    } finally {
      isFinishing.value = false;
    }
  }
};
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Detail Mahasiswa"
    size="lg"
  >
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-12"
    >
      <UiSpinner size="lg" />
      <p class="mt-4 text-slate-500 animate-pulse text-sm font-medium">
        Memuat data mahasiswa...
      </p>
    </div>

    <div v-else-if="detail" class="space-y-8">
      <!-- Profile Header -->
      <div
        class="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700"
      >
        <div
          class="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-200/50 dark:shadow-none"
        >
          {{ detail.studentName?.substring(0, 1).toUpperCase() }}
        </div>
        <div class="text-center sm:text-left flex-1">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ detail.studentName }}
          </h3>
          <p
            class="text-primary-600 dark:text-primary-400 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1"
          >
            <i class="mdi mdi-school text-lg"></i>
            {{ detail.university }}
          </p>
          <div
            class="mt-3 flex flex-wrap justify-center sm:justify-start gap-2"
          >
            <UiBadge variant="success" class="!px-3 !py-1">
              <i class="mdi mdi-check-decagram mr-1"></i>
              Active Student
            </UiBadge>
            <UiBadge
              variant="neutral"
              class="!px-3 !py-1 !bg-slate-100 !text-slate-600 border-none"
            >
              <i class="mdi mdi-account-tie mr-1"></i>
              Mentor: {{ detail.mentorName }}
            </UiBadge>
          </div>
        </div>
      </div>

      <!-- Information Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Biodata Section -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Biodata & Kontak
          </h4>
          <div
            class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4"
          >
            <div class="flex items-start gap-3">
              <div
                class="mt-1 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <i class="mdi mdi-book-education-outline text-primary-500"></i>
              </div>
              <div>
                <p class="text-[10px] text-slate-400 uppercase font-bold">
                  Program Studi
                </p>
                <p
                  class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  {{ detail.major || "-" }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="mt-1 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <i class="mdi mdi-email-outline text-primary-500"></i>
              </div>
              <div>
                <p class="text-[10px] text-slate-400 uppercase font-bold">
                  Email
                </p>
                <p
                  class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  {{ detail.email || "-" }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="mt-1 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <i class="mdi mdi-phone-outline text-primary-500"></i>
              </div>
              <div>
                <p class="text-[10px] text-slate-400 uppercase font-bold">
                  No. HP
                </p>
                <p
                  class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  {{ detail.phone || "-" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Summary Section -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Ringkasan Aktivitas
          </h4>
          <div class="grid grid-cols-1 gap-4">
            <!-- Attendance Card -->
            <div
              class="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-4 border border-primary-100/50 dark:border-primary-800/30"
            >
              <div class="flex items-center justify-between mb-2">
                <p
                  class="text-xs font-medium text-primary-600 dark:text-primary-400"
                >
                  Total Kehadiran
                </p>
                <i class="mdi mdi-calendar-check text-primary-500"></i>
              </div>
              <p
                class="text-2xl font-bold text-primary-700 dark:text-primary-300"
              >
                {{ detail.totalAttendance }}
                <span class="text-sm font-normal opacity-70">Hari</span>
              </p>
            </div>

            <!-- Last Logbook Snippet -->
            <div
              class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
            >
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-medium text-slate-500">
                  Logbook Terakhir
                </p>
                <UiBadge
                  v-if="detail.lastLogbook"
                  size="sm"
                  :variant="
                    detail.lastLogbook.status === 'approved'
                      ? 'success'
                      : 'warning'
                  "
                >
                  {{ detail.lastLogbook.status }}
                </UiBadge>
              </div>
              <div v-if="detail.lastLogbook">
                <p
                  class="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 italic"
                >
                  "{{ detail.lastLogbook.activities }}"
                </p>
                <p
                  class="mt-2 text-[10px] text-slate-400 flex items-center gap-1"
                >
                  <i class="mdi mdi-clock-outline"></i>
                  {{
                    format(
                      new Date(detail.lastLogbook.submittedAt),
                      "dd MMM yyyy HH:mm",
                      { locale: id },
                    )
                  }}
                </p>
              </div>
              <div v-else class="text-sm text-slate-400 italic py-2">
                Belum ada logbook yang diisi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <div class="flex items-center justify-between w-full">
        <UiButton
          v-if="detail"
          variant="danger"
          outline
          :loading="isFinishing"
          @click="handleFinishInternship"
        >
          <i class="mdi mdi-account-off-outline mr-2"></i>
          Selesaikan Magang
        </UiButton>
        <div class="flex gap-2 ml-auto">
          <UiButton variant="ghost" @click="closeModal">Tutup</UiButton>
        </div>
      </div>
    </template>
  </UiModal>
</template>
