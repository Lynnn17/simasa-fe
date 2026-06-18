<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipTaskService from "@/services/internship-task.service";
import internshipAssignmentService from "@/services/internship-assignment.service";

const props = defineProps<{
  modelValue: boolean;
  task?: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
}>();

const authStore = useAuthStore();
const taskSvc = internshipTaskService();
const assignmentSvc = internshipAssignmentService();
const swal = useSwal();

const isSubmitting = ref(false);
const students = ref<any[]>([]);

const isEdit = computed(() => !!props.task);

const form = ref({
  studentId: "",
  title: "",
  description: "",
  criteria: "",
  deadline: null as string | null,
});

const loadStudents = async () => {
  if (!authStore.user?.id) return;
  try {
    const res: any = await assignmentSvc.getStudentsByMentor(authStore.user.id);
    students.value = res?.data?.items || res?.data || [];
  } catch (error) {
    console.error("Failed to load students", error);
  }
};

const formatDateForPicker = (dateStr: string) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadStudents();
      if (props.task) {
        form.value = {
          studentId: props.task.studentId || props.task.student?.id || "",
          title: props.task.title || "",
          description: props.task.description || "",
          criteria: (() => {
            if (!props.task.criteria) return "";
            try {
              const parsed = JSON.parse(props.task.criteria);
              return typeof parsed === 'string' ? parsed : props.task.criteria;
            } catch (e) {
              return props.task.criteria;
            }
          })(),
          deadline: formatDateForPicker(props.task.deadline),
        };
      } else {
        form.value = {
          studentId: "",
          title: "",
          description: "",
          criteria: "",
          deadline: null,
        };
      }
    }
  },
);

const close = () => {
  emit("update:modelValue", false);
};

const handleCreate = async () => {
  if (!form.value.studentId || !form.value.title || !form.value.deadline || !form.value.description) {
    swal.toast("Lengkapi data tugas terlebih dahulu", "warning");
    return;
  }

  // Validate deadline > now
  const dateStr = (form.value.deadline as string).replace(' ', 'T');
  const selectedDate = new Date(dateStr);
  const now = new Date();

  if (selectedDate <= now) {
    swal.toast("Deadline harus lebih dari waktu saat ini", "warning");
    return;
  }

  try {
    isSubmitting.value = true;

    if (isEdit.value) {
      await taskSvc.editTask(props.task.id, {
        studentId: form.value.studentId,
        title: form.value.title,
        description: form.value.description,
        criteria: form.value.criteria,
        deadline: new Date((form.value.deadline as string).replace(' ', 'T')).toISOString(),
      });
      swal.success("Berhasil", "Tugas berhasil diperbarui");
    } else {
      await taskSvc.createTask({
        mentorId: authStore.user?.id,
        studentId: form.value.studentId,
        title: form.value.title,
        description: form.value.description,
        criteria: form.value.criteria,
        deadline: new Date((form.value.deadline as string).replace(' ', 'T')).toISOString(),
      });
      swal.success("Berhasil", "Tugas baru telah dibuat");
    }

    emit("refresh");
    close();
  } catch (error: any) {
    console.log(error);
    swal.error(
      "Gagal",
      error?.response?._data?.message ||
        (isEdit.value ? "Gagal memperbarui tugas" : "Gagal membuat tugas"),
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="isEdit ? 'Edit Tugas' : 'Buat Tugas Baru'"
    size="lg"
  >
    <div class="space-y-6">
      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            class="mb-2 block text-sm font-medium text-slate-900 dark:text-white"
          >
            Mahasiswa <span class="text-red-500">*</span>
          </label>
          <UiSelect
            v-model="form.studentId"
            placeholder="Pilih Mahasiswa"
            :options="
              students.map((s: any) => ({
                label: s.studentName || s.name || s.student?.name,
                value: s.studentId || s.id,
              }))
            "
          />
        </div>

        <div>
          <label
            class="mb-2 block text-sm font-medium text-slate-900 dark:text-white"
          >
            Deadline <span class="text-red-500">*</span>
          </label>
          <UiDatePicker
            v-model="form.deadline"
            mode="datetime"
            placeholder="Pilih Tanggal & Waktu"
          />
        </div>
      </div>

      <div>
        <UiInput
          v-model="form.title"
          label="Judul Tugas"
          placeholder="Masukkan judul tugas..."
          required
          :rules="[(v: string) => !!v || 'Field Judul Tugas wajib diisi.']"
        />
      </div>

      <div>
        <UiTextarea
          v-model="form.description"
          label="Deskripsi Tugas"
          placeholder="Masukkan instruksi detail tugas..."
          rows="4"
          required
          :rules="[(v: string) => !!v || 'Deskripsi Tugas wajib diisi.']"
        />
      </div>

      <div>
        <UiTextarea
          v-model="form.criteria"
          label="Kriteria Penilaian"
          placeholder="Masukkan kriteria penilaian..."
          rows="3"
        />
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
          :disabled="isSubmitting || !form.title"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-500 disabled:opacity-50"
          @click="handleCreate"
        >
          <UiSpinner v-if="isSubmitting" size="sm" />
          <span>{{
            isSubmitting
              ? "Memproses..."
              : isEdit
                ? "Simpan Perubahan"
                : "Assign Tugas"
          }}</span>
        </button>
      </div>
    </template>
  </UiModal>
</template>
