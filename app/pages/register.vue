<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] dark:bg-slate-950 px-4 py-10 sm:px-6 lg:px-8"
  >
    <div
      class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center"
    >
      <div
        class="grid w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-[0_32px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <aside
          class="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:block"
        >
          <div
            class="absolute inset-0 bg-[linear-gradient(135deg,_rgba(37,99,235,0.96),_rgba(15,23,42,0.96))]"
          />
          <div
            class="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          />
          <div
            class="absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-primary-500/20 blur-3xl"
          />
          <div class="relative z-10 flex h-full flex-col justify-between">
            <div>
              <UiAppLogo :logo-size="96" class="mb-10" />
              <p class="max-w-md text-sm leading-6 text-slate-200">
                Portal pendaftaran magang SIMAMA untuk mahasiswa yang ingin
                mengajukan lamaran dengan alur yang cepat, jelas, dan
                terverifikasi.
              </p>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p class="text-xs uppercase tracking-[0.25em] text-slate-300">
                    Step 1
                  </p>
                  <p class="mt-2 text-sm font-medium">Lengkapi data diri</p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p class="text-xs uppercase tracking-[0.25em] text-slate-300">
                    Step 2
                  </p>
                  <p class="mt-2 text-sm font-medium">Unggah CV PDF</p>
                </div>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p class="text-sm leading-6 text-slate-200">
                  Pastikan seluruh isian valid sebelum mengirim agar lamaran
                  langsung diproses oleh tim SIMAMA.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main class="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div class="mx-auto w-full max-w-2xl">
            <div class="mb-8 lg:hidden">
              <UiAppLogo :logo-size="72" class="mx-auto" />
            </div>

            <div class="mb-8">
              <p
                class="text-sm font-semibold uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400"
              >
                Portal Pendaftaran
              </p>
              <h1
                class="mt-3 text-3xl font-bold text-slate-900 dark:text-white"
              >
                Daftar Peserta Magang SIMAMA
              </h1>
              <p
                class="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400"
              >
                Isi formulir berikut dengan data yang benar. Semua kolom wajib
                diisi dan file CV harus dalam format PDF maksimal 2MB.
              </p>
            </div>

            <UiCard
              :padding="false"
              class="border border-slate-200/80 bg-white shadow-none dark:border-slate-800 dark:bg-slate-900/60"
            >
              <UiForm
                ref="formRef"
                v-model="isFormValid"
                class="p-6 sm:p-8"
                :validation-schema="schema"
                :initial-values="initialValues"
                :validate-on-mount="false"
                @submit="handleSubmit"
              >
                <div class="grid gap-6 md:grid-cols-2">
                  <UiInput
                    v-model="form.full_name"
                    name="full_name"
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    :rules="[requiredRule]"
                    required
                  />

                  <UiInput
                    v-model="form.university"
                    name="university"
                    label="Universitas"
                    placeholder="Masukkan nama universitas"
                    :rules="[requiredRule]"
                    required
                  />

                  <UiInput
                    v-model="form.major"
                    name="major"
                    label="Jurusan"
                    placeholder="Masukkan jurusan"
                    :rules="[requiredRule]"
                    required
                  />

                  <UiSelect
                    v-model="form.semester"
                    name="semester"
                    label="Semester"
                    placeholder="Pilih semester"
                    :options="semesterOptions"
                    :rules="[requiredRule]"
                    required
                  />

                  <UiInput
                    v-model="form.phone"
                    name="phone"
                    label="Nomor Telepon"
                    placeholder="08123456789"
                    :rules="[requiredRule, phoneRule]"
                    required
                  />

                  <UiInput
                    v-model="form.email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="nama@email.com"
                    :rules="[requiredRule, emailRule]"
                    required
                  />

                  <UiInput
                    v-model="form.period"
                    name="period"
                    label="Periode"
                    placeholder="Contoh: Januari - Juni 2026"
                    :rules="[requiredRule]"
                    required
                  />

                  <div class="md:col-span-2 space-y-2">
                    <label
                      class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      CV (PDF, maksimal 2MB) <span class="text-red-500">*</span>
                    </label>
                    <UiFileUpload
                      v-model="form.cv_file"
                      name="cv_file"
                      accept="application/pdf,.pdf"
                      :max-size="2"
                      :rules="[cvRule]"
                      required
                      variant="compact"
                      placeholder="Klik untuk memilih atau seret file CV PDF di sini"
                      hint="Hanya file PDF dengan ukuran maksimal 2MB"
                    />
                  </div>
                </div>

                <div
                  class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    Tombol aktif setelah seluruh field valid.
                  </p>

                  <UiButton
                    type="submit"
                    size="lg"
                    class="min-w-[200px]"
                    :loading="isSubmitting"
                    :disabled="!isFormValid || isSubmitting"
                  >
                    <span
                      v-if="isSubmitting"
                      class="inline-flex items-center gap-2"
                    >
                      <UiSpinner size="sm" color="white" />
                      Mengirim...
                    </span>
                    <span v-else>Kirim Lamaran</span>
                  </UiButton>
                </div>
              </UiForm>
            </UiCard>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

import internshipRegistrationService from "~/services/internship-registration.service";
import fileService from "~/services/file.service";

definePageMeta({
  layout: false,
});

useHead({
  title: "Pendaftaran SIMAMA",
});

const validationSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  university: z.string().min(1, "Universitas wajib diisi"),
  major: z.string().min(1, "Jurusan wajib diisi"),
  semester: z.coerce
    .number({ invalid_type_error: "Semester wajib dipilih" })
    .int("Semester harus berupa angka bulat")
    .min(1, "Semester wajib dipilih")
    .max(14, "Semester tidak valid"),
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^[0-9]{10,15}$/, "Nomor telepon harus 10-15 digit angka"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  period: z.string().min(1, "Periode wajib diisi"),
  cv_file: z
    .instanceof(File, { message: "CV wajib diunggah" })
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
      "CV harus berupa file PDF",
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, "Ukuran CV maksimal 2MB"),
});

type RegistrationForm = z.infer<typeof validationSchema>;

const formRef = ref();
const isFormValid = ref(false);
const isSubmitting = ref(false);

const semesterOptions = Array.from({ length: 8 }, (_, index) => ({
  label: `Semester ${index + 1}`,
  value: index + 1,
}));

const schema = toTypedSchema(validationSchema);

const initialValues = {
  full_name: "",
  university: "",
  major: "",
  semester: null,
  phone: "",
  email: "",
  period: "",
  cv_file: null as File | null,
};

const form = reactive({
  full_name: "",
  university: "",
  major: "",
  semester: null as number | null,
  phone: "",
  email: "",
  period: "",
  cv_file: null as File | null,
});

const requiredRule = (value: unknown) => !!value || "Bidang ini wajib diisi";
const emailRule = (value: string) =>
  /.+@.+\..+/.test(value) || "Format email tidak valid";
const phoneRule = (value: string) =>
  /^[0-9]{10,15}$/.test(value) || "Nomor telepon harus 10-15 digit angka";
const cvRule = (value: File | null) => {
  if (!value) return "CV wajib diunggah";
  if (
    value.type !== "application/pdf" &&
    !value.name.toLowerCase().endsWith(".pdf")
  )
    return "CV harus berupa file PDF";
  if (value.size > 2 * 1024 * 1024) return "Ukuran CV maksimal 2MB";
  return true;
};
const handleSubmit = async (formValues: RegistrationForm) => {
  isSubmitting.value = true;

  try {
    // 1. Upload CV first
    const fileSvc = fileService();
    let cvFilePath = "";

    try {
      cvFilePath = await fileSvc.upload(formValues.cv_file, "cv");
    } catch (uploadError: any) {
      useSwal().toast(
        uploadError?.response?._data?.message ||
          "Gagal mengunggah CV. Silakan coba lagi.",
        "error",
      );
      return;
    }

    // 2. Send registration data as JSON
    const payload = {
      fullName: formValues.full_name,
      university: formValues.university,
      major: formValues.major,
      semester: String(formValues.semester),
      phone: formValues.phone,
      email: formValues.email,
      period: formValues.period,
      cvFilePath: cvFilePath, // Use the path from upload
    };

    const result: any = await internshipRegistrationService().register(payload);

    if (result?.data?.id || result?.id) {
      useSwal().toast("Lamaran berhasil dikirim!", "success");
      Object.assign(form, {
        full_name: "",
        university: "",
        major: "",
        semester: null,
        phone: "",
        email: "",
        period: "",
        cv_file: null,
      });
      formRef.value?.resetValidation();
      formRef.value?.reset();
    } else {
      useSwal().toast(
        result?.message || "Pendaftaran gagal. Silakan coba lagi.",
        "error",
      );
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
