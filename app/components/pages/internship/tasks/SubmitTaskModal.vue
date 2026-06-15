<script setup lang="ts">
import fileService from "@/services/file.service";
import internshipTaskService from "@/services/internship-task.service";

const props = defineProps<{
  modelValue: boolean;
  task: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
}>();

const isLate = computed(() => {
  if (!props.task?.deadline) return false;
  return new Date() > new Date(props.task.deadline);
});

const fileSvc = fileService();
const taskSvc = internshipTaskService();
const swal = useSwal();

const isSubmitting = ref(false);
const selectedFiles = ref<File[]>([]);
const uploadProgress = ref(0);
const submissionUrl = ref("");

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    selectedFiles.value = [];
    uploadProgress.value = 0;
    submissionUrl.value = "";
  }
});

const close = () => {
  emit("update:modelValue", false);
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
    target.value = ''; 
  }
};

const addFiles = (files: File[]) => {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0 && files.length > 0) {
    swal.toast("Hanya file gambar yang diperbolehkan", "warning");
    return;
  }
  selectedFiles.value = [...selectedFiles.value, ...imageFiles];
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const getPreviewUrl = (file: File) => {
  if (!file) return '';
  return URL.createObjectURL(file);
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  
  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const file = items[i].getAsFile();
      if (file) files.push(file);
    }
  }
  if (files.length > 0) {
    addFiles(files);
  }
};

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});

const handleSubmit = async () => {
  if (selectedFiles.value.length === 0) {
    swal.toast("Mohon pilih atau tempel gambar terlebih dahulu", "warning");
    return;
  }

  if (!submissionUrl.value) {
    swal.toast("Mohon isi URL pengumpulan terlebih dahulu", "warning");
    return;
  }

  try {
    isSubmitting.value = true;
    
    // Upload all files sequentially
    for (let i = 0; i < selectedFiles.value.length; i++) {
      uploadProgress.value = Math.round(((i) / selectedFiles.value.length) * 100);
      const fileUrl = await fileSvc.upload(selectedFiles.value[i], "tasks");
      
      await taskSvc.submitTask({
        taskId: props.task.id,
        fileUrl: fileUrl,
        submissionUrl: submissionUrl.value,
      });
    }
    
    uploadProgress.value = 100;
    swal.success("Berhasil", "Tugas sudah dikumpulkan");
    emit("refresh");
    close();
  } catch (error: any) {
    swal.error("Gagal", error?.response?._data?.message || "Terjadi kesalahan saat mengumpulkan tugas");
  } finally {
    isSubmitting.value = false;
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
    title="Kumpulkan Tugas"
    size="md"
  >
    <div v-if="task" class="space-y-6">
      
      <!-- Info Tugas -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <h4 class="font-semibold text-slate-900 dark:text-white">{{ task.title }}</h4>
        <div 
          class="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
          v-html="linkify(task.description)"
        ></div>
      </div>

      <!-- Warning Late -->
      <div v-if="isLate" class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm flex gap-3">
        <i class="mdi mdi-alert-circle-outline text-lg"></i>
        <div>
          <p class="font-medium">Perhatian: Deadline tugas ini sudah lewat.</p>
          <p class="text-xs mt-0.5">Pengumpulan terlambat akan dicatat dalam sistem</p>
        </div>
      </div>

      <!-- Submission URL -->
      <div>
        <UiInput
          v-model="submissionUrl"
          label="URL Pengumpulan"
          placeholder="Masukkan URL pengumpulan (misal: link repository atau drive)..."
          required
          :rules="[(v: string) => !!v || 'URL Pengumpulan wajib diisi.']"
        />
      </div>

      <!-- File Upload Form -->
      <div 
        @dragover.prevent 
        @drop="handleDrop"
        class="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 transition-colors hover:border-primary-400 group bg-slate-50/50 dark:bg-slate-800/30"
      >
        <div class="text-center">
          <UiIcon name="mdi-cloud-upload-outline" size="lg" class="text-slate-400 group-hover:text-primary-500 mb-2" />
          <div class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tarik & Lepas gambar di sini, atau 
            <label class="text-primary-600 hover:text-primary-700 cursor-pointer mx-1">
              Pilih File
              <input 
                type="file" 
                class="hidden"
                @change="handleFileChange"
                accept="image/*"
                multiple
              />
            </label>
          </div>
          <p class="mt-2 text-xs text-slate-500">
            Tips: Anda juga bisa menempel gambar langsung (Ctrl+V / Cmd+V)
          </p>
        </div>
      </div>

      <!-- Preview Grid -->
      <div v-if="selectedFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          class="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group"
        >
          <img 
            :src="getPreviewUrl(file)" 
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              @click="removeFile(index)"
              class="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
              title="Hapus"
            >
              <UiIcon name="mdi-close" size="sm" />
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="isSubmitting" class="space-y-2">
        <div class="flex justify-between text-xs text-slate-500">
          <span>Mengunggah...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-primary-500 transition-all duration-300" 
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="close"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="isSubmitting || selectedFiles.length === 0 || !submissionUrl"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-500 disabled:opacity-50 min-w-[140px]"
          @click="handleSubmit"
        >
          <UiSpinner v-if="isSubmitting" size="sm" />
          <span>{{ isSubmitting ? 'Mengunggah...' : 'Kumpulkan Tugas' }}</span>
        </button>
      </div>
    </template>
  </UiModal>
</template>
