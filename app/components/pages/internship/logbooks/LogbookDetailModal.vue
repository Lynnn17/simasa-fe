<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  logbook: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const close = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Detail Logbook"
    size="lg"
  >
    <div v-if="logbook" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tanggal Logbook</p>
          <p class="text-sm font-medium text-slate-900 dark:text-white">
            {{ new Date(logbook.logDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status Progress</p>
          <UiBadge :variant="logbook.progressStatus === 'done' ? 'success' : (logbook.progressStatus === 'blocked' ? 'danger' : 'warning')">
            {{ logbook.progressStatus === 'done' ? 'Selesai' : logbook.progressStatus === 'blocked' ? 'Terhambat' : 'In Progress' }}
          </UiBadge>
        </div>
      </div>

      <div class="space-y-4">
        <section>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <div class="w-1.5 h-4 bg-primary-500 rounded-full"></div>
            Aktivitas Hari Ini
          </h4>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {{ logbook.activities }}
          </div>
        </section>

        <section>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
            <div class="w-1.5 h-4 bg-red-500 rounded-full"></div>
            Kendala (Blockers)
          </h4>
          <div class="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {{ logbook.blockers || 'Tidak ada kendala' }}
          </div>
        </section>

        <section>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div class="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            Rencana Besok
          </h4>
          <div class="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {{ logbook.planTomorrow }}
          </div>
        </section>

        <section v-if="logbook.evidenceURL || logbook.evidenceUrl">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
            Link Bukti (Evidence)
          </h4>
          <a 
            :href="logbook.evidenceURL || logbook.evidenceUrl" 
            target="_blank" 
            class="inline-flex items-center gap-2 p-4 w-full rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 text-sm text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
          >
            <UiIcon name="mdi-link-variant" size="sm" />
            {{ logbook.evidenceURL || logbook.evidenceUrl }}
          </a>
        </section>
      </div>

      <div class="pt-6 flex justify-end">
        <button
          @click="close"
          class="px-6 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </UiModal>
</template>
