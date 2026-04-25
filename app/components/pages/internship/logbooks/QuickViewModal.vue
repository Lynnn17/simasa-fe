<script setup lang="ts">
import internshipLogbookService from "@/services/internship-logbook.service";

const props = defineProps<{
  modelValue: boolean;
  logbook: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
}>();

const logbookService = internshipLogbookService();
const swal = useSwal();
const isSubmitting = ref(false);

const close = () => {
  emit("update:modelValue", false);
};

const handleUpdateStatus = async (status: string) => {
  if (!props.logbook?.id) return;
  
  try {
    isSubmitting.value = true;
    await logbookService.updateLogbookStatus(props.logbook.id, { status });
    swal.success("Berhasil", `Status logbook diubah menjadi ${status}`);
    emit("refresh");
    close();
  } catch (error: any) {
    swal.error("Gagal", error?.response?._data?.message || "Gagal mengubah status logbook");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Detail Logbook Harian"
    size="xl"
  >
    <div v-if="logbook" class="space-y-6">
      
      <!-- Profil & Waktu Singkat -->
      <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="font-medium text-slate-900 dark:text-white text-lg">
            {{ logbook.student?.name || 'Mahasiswa' }}
          </h3>
          <p class="text-sm text-slate-500">
            {{ new Date(logbook.logDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <UiBadge :variant="logbook.status === 'approved' || logbook.status === 'submitted' ? 'success' : logbook.status === 'pending' ? 'warning' : 'danger'">
          {{ logbook.status || 'Pending' }}
        </UiBadge>
      </div>

      <!-- Detail Konten -->
      <div class="space-y-5">
        <div>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Aktivitas Hari Ini</h4>
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {{ logbook.activities || '-' }}
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Kendala (Blockers)</h4>
          <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap leading-relaxed">
            {{ logbook.blockers || '-' }}
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Rencana Besok</h4>
          <div class="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap leading-relaxed">
            {{ logbook.planTomorrow || '-' }}
          </div>
        </div>
        
        <div v-if="logbook.evidenceUrl">
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Lampiran / Bukti</h4>
          <a :href="logbook.evidenceUrl" target="_blank" class="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <UiIcon name="mdi-paperclip" size="sm" />
            Lihat Lampiran
          </a>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <div class="flex items-center justify-end w-full">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="close"
        >
          Tutup
        </button>
      </div>
    </template>
  </UiModal>
</template>
