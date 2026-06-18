<script setup lang="ts">
import internshipTaskService from "@/services/internship-task.service";

const props = defineProps<{
  modelValue: boolean;
  task: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
}>();

const taskSvc = internshipTaskService();
const swal = useSwal();
const isSubmitting = ref<string | null>(null);

interface Aspect {
  nama: string;
  skor: number | null;
  feedback_aspek: string;
}

const form = ref({
  aspects: [] as Aspect[],
  feedback: "",
});

const taskFiles = ref<any[]>([]);
const isLoadingFiles = ref(false);

const loadTaskFiles = async () => {
  if (!props.task?.id) return;
  try {
    isLoadingFiles.value = true;
    const res: any = await taskSvc.getTaskFiles(props.task.id);
    taskFiles.value = res?.data || [];
  } catch (error) {
    console.error("Failed to load task files", error);
  } finally {
    isLoadingFiles.value = false;
  }
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.task) {
    const isNewSubmission = props.task.status === 'submitted';
    
    let initialAspects: Aspect[] = [];
    if (!isNewSubmission && props.task.grade) {
      try {
        const parsed = typeof props.task.grade === 'string' ? JSON.parse(props.task.grade) : props.task.grade;
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          initialAspects = Object.keys(parsed).map(k => ({
            nama: parsed[k].nama || '',
            skor: parsed[k].skor !== undefined ? parsed[k].skor : null,
            feedback_aspek: parsed[k].feedback_aspek || '',
          }));
        } else {
          initialAspects = [{ nama: 'Penilaian Umum', skor: Number(parsed), feedback_aspek: '' }];
        }
      } catch (e) {
        initialAspects = [{ nama: 'Penilaian Umum', skor: Number(props.task.grade), feedback_aspek: '' }];
      }
    } else {
      initialAspects = [{ nama: '', skor: null, feedback_aspek: '' }];
    }

    form.value = {
      aspects: initialAspects,
      feedback: isNewSubmission ? "" : (props.task.feedback || ""),
    };
    loadTaskFiles();
  }
});

const close = () => {
  emit("update:modelValue", false);
};

const addAspect = () => {
  form.value.aspects.push({ nama: '', skor: null, feedback_aspek: '' });
};

const removeAspect = (index: number) => {
  if (form.value.aspects.length > 1) {
    form.value.aspects.splice(index, 1);
  }
};

const handleGrade = async (status: string) => {
  let gradeData: any = null;

  if (status === 'graded') {
    if (form.value.aspects.length === 0) {
      swal.toast("Minimal harus ada 1 aspek penilaian", "warning");
      return;
    }
    
    gradeData = {};
    for (let i = 0; i < form.value.aspects.length; i++) {
      const a = form.value.aspects[i];
      if (!a.nama || a.skor === null || a.skor === undefined) {
        swal.toast("Mohon lengkapi nama dan skor pada semua aspek penilaian", "warning");
        return;
      }
      if (a.skor < 0 || a.skor > 100) {
        swal.toast("Skor aspek harus antara 0 - 100", "warning");
        return;
      }
      
      const key = `aspek_${i + 1}`;
      gradeData[key] = {
        nama: a.nama,
        skor: Number(a.skor),
        feedback_aspek: a.feedback_aspek || ""
      };
    }
  }

  if (status === 'revision_needed' && !form.value.feedback) {
    swal.toast("Mohon berikan feedback alasan revisi", "warning");
    return;
  }

  try {
    isSubmitting.value = status;
    await taskSvc.gradeTask(props.task.id, {
      grade: gradeData,
      feedback: form.value.feedback,
      status: status,
    });
    
    swal.success("Berhasil", status === 'graded' ? "Tugas berhasil dinilai" : "Tugas dikembalikan untuk revisi");
    emit("refresh");
    close();
  } catch (error: any) {
    swal.error("Gagal", error?.response?._data?.message || "Gagal memproses penilaian");
  } finally {
    isSubmitting.value = null;
  }
};

const linkify = (text: string) => {
  if (!text) return '-';
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
    
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return escapedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">${url}</a>`;
  });
};
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Penilaian Tugas"
    size="lg"
  >
    <div v-if="task" class="space-y-6">
      
      <!-- Info Tugas Singkat -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <h4 class="font-semibold text-slate-900 dark:text-white">{{ task.title }}</h4>
        <p class="mt-1 text-sm text-slate-500">Mahasiswa: <span class="font-medium text-slate-700 dark:text-slate-300">{{ task.student?.name || task.studentName || 'Mahasiswa' }}</span></p>
        <p v-if="task.submissionUrl" class="mt-1 text-sm text-slate-500">
          Link Bukti: 
          <a 
            :href="task.submissionUrl" 
            target="_blank" 
            class="text-primary-600 hover:underline dark:text-primary-400 font-medium"
          >
            {{ task.submissionUrl }}
          </a>
        </p>
        <div 
          class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
          v-html="linkify(task.description)"
        ></div>
      </div>

      <!-- Download File -->
      <!-- File Pengumpulan -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            File Pengumpulan
          </h4>
          <button
            v-if="taskFiles.length > 0"
            @click="taskSvc.downloadAll(task.id)"
            class="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <UiIcon name="mdi-download" size="sm" />
            Download Semua (.zip)
          </button>
        </div>

        <div v-if="isLoadingFiles" class="flex justify-center py-8">
          <UiSpinner size="md" />
        </div>
        
        <div v-else-if="taskFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div 
            v-for="(file, index) in taskFiles" 
            :key="index"
            class="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
          >
            <img 
              :src="taskSvc.getFileUrl(file.fileUrl)" 
              class="w-full h-full object-cover cursor-pointer"
              @click="window.open(taskSvc.getFileUrl(file.fileUrl), '_blank')"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <a 
                :href="taskSvc.getFileUrl(file.fileUrl)" 
                target="_blank"
                class="p-1.5 bg-white text-slate-900 rounded-full hover:bg-slate-100 shadow-lg"
                title="Lihat Full"
              >
                <UiIcon name="mdi-eye" size="sm" />
              </a>
              <a 
                :href="taskSvc.getFileUrl(file.fileUrl)" 
                download
                class="p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 shadow-lg"
                title="Download"
              >
                <UiIcon name="mdi-download" size="sm" />
              </a>
            </div>
          </div>
        </div>
        
        <div v-else class="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <UiIcon name="mdi-file-hidden" size="lg" class="text-slate-400 mb-2" />
          <p class="text-sm text-slate-500 italic">Mahasiswa tidak melampirkan file.</p>
        </div>
      </div>

      <hr class="border-slate-200 dark:border-slate-800" />

      <!-- Form Penilaian -->
      <div>
        <div class="mb-4">
          <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            Rubrik Penilaian
          </h4>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Catatan: Anda tidak perlu mengisi/menyertakan aspek penilaian jika hanya ingin meminta revisi.
          </p>
        </div>
        <div class="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div v-for="(aspect, index) in form.aspects" :key="index" class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative">
            <button 
              v-if="form.aspects.length > 1" 
              @click="removeAspect(index)" 
              class="absolute top-2 right-2 text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors dark:hover:bg-rose-900/20"
              title="Hapus Aspek"
            >
              <UiIcon name="mdi-delete-outline" size="sm" />
            </button>
            <h5 class="text-xs font-semibold uppercase text-slate-500 mb-3">Aspek {{ index + 1 }}</h5>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div class="md:col-span-3">
                <label class="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Nama Aspek *</label>
                <UiInput v-model="aspect.nama" placeholder="Contoh: Fungsi Endpoint" required />
              </div>
              <div class="md:col-span-1">
                <label class="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Skor (0-100) *</label>
                <UiInput v-model="aspect.skor" type="number" min="0" max="100" placeholder="0" required />
              </div>
            </div>
            
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Feedback Aspek (Opsional)</label>
              <UiInput v-model="aspect.feedback_aspek" placeholder="Komentar untuk aspek ini..." />
            </div>
          </div>

          <button 
            type="button" 
            @click="addAspect" 
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-300 bg-primary-50 py-3 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
          >
            <UiIcon name="mdi-plus" size="sm" />
            Tambah Aspek Penilaian
          </button>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
              Komentar / Feedback
            </label>
            <UiTextarea
              v-model="form.feedback"
              placeholder="Berikan saran, masukan, atau alasan revisi..."
              rows="4"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="close"
        >
          Batal
        </button>
        
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="!!isSubmitting"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            @click="handleGrade('revision_needed')"
          >
            <UiSpinner v-if="isSubmitting === 'revision_needed'" size="sm" />
            <UiIcon v-else name="mdi-refresh" size="sm" />
            <span>Minta Revisi</span>
          </button>
          
          <button
            type="button"
            :disabled="!!isSubmitting"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
            @click="handleGrade('graded')"
          >
            <UiSpinner v-if="isSubmitting === 'graded'" size="sm" />
            <UiIcon v-else name="mdi-check" size="sm" />
            <span>Selesai (Lulus)</span>
          </button>
        </div>
      </div>
    </template>
  </UiModal>
</template>
