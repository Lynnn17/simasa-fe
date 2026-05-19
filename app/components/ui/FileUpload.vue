<script setup lang="ts">
/**
 * UiFileUpload - Reusable file upload component with drag & drop
 *
 * Features:
 * - Drag and drop support
 * - File type filtering
 * - File size validation
 * - Multiple file support (optional)
 * - Custom styling
 */
import { useField } from "vee-validate";

interface Props {
  modelValue?: File | File[] | null;
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  rules?: Array<(value: File | File[] | null) => boolean | string>;
  // Styling
  variant?: "default" | "compact";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  name: "",
  accept: ".xlsx,.xls,.csv",
  multiple: false,
  maxSize: 10, // 10MB default
  disabled: false,
  placeholder: "",
  hint: "",
  required: false,
  rules: () => [],
  variant: "default",
});

const emit = defineEmits<{
  "update:modelValue": [value: File | File[] | null];
  error: [message: string];
}>();

const { t } = useTranslation();

const validateWithRules = (value: File | File[] | null): boolean | string => {
  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      return typeof result === "string" ? result : "Invalid value";
    }
  }

  if (props.required) {
    const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
    if (isEmpty) return "Bidang ini wajib diisi";
  }

  if (!value) return true;

  const files = Array.isArray(value) ? value : [value];
  const maxBytes = props.maxSize * 1024 * 1024;

  for (const file of files) {
    if (file.size > maxBytes) {
      return t("import.error_file_too_large", { max: props.maxSize + "MB" });
    }

    if (props.accept) {
      const acceptedTypes = props.accept
        .split(",")
        .map((type) => type.trim().toLowerCase());
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      const fileMime = file.type.toLowerCase();

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) return fileExt === type;
        if (type.endsWith("/*"))
          return fileMime.startsWith(type.replace("/*", "/"));
        return fileMime === type;
      });

      if (!isAccepted) {
        return "Format file tidak didukung. Gunakan PDF";
      }
    }
  }

  return true;
};

// Refs
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// Computed
const selectedFile = computed(() => {
  if (!props.modelValue) return null;
  if (Array.isArray(props.modelValue)) {
    return props.modelValue[0] || null;
  }
  return props.modelValue;
});

const selectedFiles = computed(() => {
  if (!props.modelValue) return [];
  if (Array.isArray(props.modelValue)) {
    return props.modelValue;
  }
  return [props.modelValue];
});

const hasFile = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0;
  }
  return !!props.modelValue;
});

const placeholderText = computed(() => {
  return props.placeholder || t("import.drag_or_click");
});

const hintText = computed(() => {
  return props.hint || t("import.supported_formats");
});

const generatedId = useId();
const fieldName = props.name || `file-${generatedId}`;

const fieldValidator =
  props.rules.length > 0 || props.required || !!props.accept
    ? validateWithRules
    : undefined;

const {
  value: fieldValue,
  errorMessage,
  handleBlur: veeHandleBlur,
  handleChange: veeHandleChange,
  resetField,
  validate: validateField,
} = useField<File | File[] | null>(fieldName, fieldValidator, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true,
  validateOnMount: false,
});

const manualError = ref("");

const displayError = computed(() => manualError.value || errorMessage.value);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== fieldValue.value) {
      fieldValue.value = newVal;
    }
  },
  { immediate: true },
);

watch(fieldValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit("update:modelValue", newVal);
  }
});

// Methods
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    xlsx: "mdi-file-excel text-green-500",
    xls: "mdi-file-excel text-green-500",
    csv: "mdi-file-delimited text-green-500",
    pdf: "mdi-file-pdf-box text-red-500",
    doc: "mdi-file-word text-blue-500",
    docx: "mdi-file-word text-blue-500",
    png: "mdi-file-image text-purple-500",
    jpg: "mdi-file-image text-purple-500",
    jpeg: "mdi-file-image text-purple-500",
    gif: "mdi-file-image text-purple-500",
    zip: "mdi-folder-zip text-yellow-500",
    rar: "mdi-folder-zip text-yellow-500",
  };
  return iconMap[ext || ""] || "mdi-file text-slate-500";
};

const validateFile = (file: File): string | null => {
  // Check file size
  const maxBytes = props.maxSize * 1024 * 1024;
  if (file.size > maxBytes) {
    return t("import.error_file_too_large", { max: props.maxSize + "MB" });
  }

  // Check file type if accept is specified
  if (props.accept) {
    const acceptedTypes = props.accept
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    const fileMime = file.type.toLowerCase();

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileExt === type;
      }
      if (type.endsWith("/*")) {
        return fileMime.startsWith(type.replace("/*", "/"));
      }
      return fileMime === type;
    });

    if (!isAccepted) {
      return "Format file tidak didukung. Gunakan PDF";
    }
  }

  return null;
};

const handleFiles = (files: FileList | null) => {
  if (!files || files.length === 0) return;

  const validFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) continue;

    const error = validateFile(file);

    if (error) {
      manualError.value = error;
      emit("error", error);
      continue;
    }

    validFiles.push(file);

    // If not multiple, only take first valid file
    if (!props.multiple) break;
  }

  if (validFiles.length === 0) return;

  manualError.value = "";

  if (props.multiple) {
    fieldValue.value = validFiles;
    emit("update:modelValue", validFiles);
  } else {
    fieldValue.value = validFiles[0] || null;
    emit("update:modelValue", validFiles[0] || null);
  }

  validateField();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  handleFiles(input.files);
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;

  if (props.disabled) return;

  handleFiles(event.dataTransfer?.files || null);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (!props.disabled) {
    isDragging.value = true;
  }
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const clearFile = (index?: number) => {
  if (
    props.multiple &&
    Array.isArray(props.modelValue) &&
    index !== undefined
  ) {
    const newFiles = [...props.modelValue];
    newFiles.splice(index, 1);
    fieldValue.value = newFiles.length > 0 ? newFiles : null;
    emit("update:modelValue", newFiles.length > 0 ? newFiles : null);
  } else {
    fieldValue.value = null;
    emit("update:modelValue", null);
  }

  manualError.value = "";

  if (fileInput.value) {
    fileInput.value.value = "";
  }

  validateField();
};

const openFilePicker = () => {
  if (!props.disabled) {
    fileInput.value?.click();
  }
};

// Expose methods
defineExpose({
  openFilePicker,
  clearFile,
  validate: validateField,
  reset: resetField,
});
</script>

<template>
  <div class="w-full">
    <div
      :class="[
        'border-2 border-dashed rounded-lg transition-all duration-200',
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-slate-300 dark:border-slate-600',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        variant === 'compact' ? 'p-4' : 'p-8',
      ]"
      @click="openFilePicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- Empty State -->
      <div v-if="!hasFile" class="text-center" @click.stop>
        <i
          :class="[
            'mdi mdi-cloud-upload-outline',
            variant === 'compact' ? 'text-3xl' : 'text-5xl',
            'text-slate-400',
          ]"
        />
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          {{ placeholderText }}
        </p>
        <UiButton
          color="primary"
          variant="outline"
          :size="variant === 'compact' ? 'sm' : 'md'"
          class="mt-3"
          @click.stop="openFilePicker"
        >
          <i class="mdi mdi-upload mr-2" />
          {{ $t("import.select_file") }}
        </UiButton>
        <p v-if="hintText" class="text-xs text-slate-400 mt-2">
          {{ hintText }}
        </p>
      </div>

      <!-- Single File Preview -->
      <div
        v-else-if="!multiple && selectedFile"
        class="flex items-center justify-center gap-4"
        @click.stop
      >
        <i :class="['text-4xl', getFileIcon(selectedFile)]" />
        <div class="text-left">
          <p class="font-medium text-slate-800 dark:text-slate-200">
            {{ selectedFile.name }}
          </p>
          <p class="text-sm text-slate-500">
            {{ formatFileSize(selectedFile.size) }}
          </p>
        </div>
        <UiIconButton
          icon="mdi-close"
          size="sm"
          color="red"
          variant="ghost"
          :tooltip="$t('Hapus')"
          @click.stop="clearFile()"
        />
      </div>

      <!-- Multiple Files Preview -->
      <div
        v-else-if="multiple && selectedFiles.length > 0"
        class="space-y-2"
        @click.stop
      >
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
        >
          <i :class="['text-2xl', getFileIcon(file)]" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-800 dark:text-slate-200 truncate">
              {{ file.name }}
            </p>
            <p class="text-xs text-slate-500">
              {{ formatFileSize(file.size) }}
            </p>
          </div>
          <UiIconButton
            icon="mdi-close"
            size="sm"
            color="red"
            variant="ghost"
            @click.stop="clearFile(index)"
          />
        </div>
        <UiButton
          variant="outline"
          size="sm"
          class="w-full mt-2"
          @click.stop="openFilePicker"
        >
          <i class="mdi mdi-plus mr-1" />
          {{ $t("import.add_more") }}
        </UiButton>
      </div>
    </div>
    <p v-if="displayError" class="text-sm text-red-500 mt-1">
      {{ displayError }}
    </p>
  </div>
</template>
