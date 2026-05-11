<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans">
    <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 items-start">
      
      <!-- Left Column: Stepper -->
      <aside class="hidden lg:block space-y-10 sticky top-12">
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-8">{{ $t('register.title') }}</h1>
        
        <div class="relative space-y-0">
          <!-- Step 1: Personal Info -->
          <div class="flex gap-4 group relative pb-10">
            <div class="absolute left-[15px] top-[30px] bottom-0 w-[2px]" :class="currentStep > 1 ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-800'"></div>
            <div class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-300"
                 :class="[
                   currentStep === 1 ? 'border-red-600 bg-white dark:bg-slate-900' : 
                   currentStep > 1 ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 bg-white dark:bg-slate-900'
                 ]">
              <i v-if="currentStep > 1" class="mdi mdi-check text-lg"></i>
              <div v-else-if="currentStep === 1" class="h-2.5 w-2.5 rounded-full bg-red-600"></div>
            </div>
            <div class="pt-0.5">
              <p class="text-sm font-bold" :class="currentStep >= 1 ? 'text-red-600' : 'text-slate-400'">{{ $t('register.step1.label') }}</p>
              <p class="text-sm font-bold" :class="currentStep === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ $t('register.step1.title') }}</p>
            </div>
          </div>

          <!-- Step 2: Academic Details -->
          <div class="flex gap-4 group relative pb-10">
            <div class="absolute left-[15px] top-[30px] bottom-0 w-[2px]" :class="currentStep > 2 ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-800'"></div>
            <div class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-300"
                 :class="[
                   currentStep === 2 ? 'border-red-600 bg-white dark:bg-slate-900' : 
                   currentStep > 2 ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 bg-white dark:bg-slate-900'
                 ]">
              <i v-if="currentStep > 2" class="mdi mdi-check text-lg"></i>
              <div v-else-if="currentStep === 2" class="h-2.5 w-2.5 rounded-full bg-red-600"></div>
            </div>
            <div class="pt-0.5">
              <p class="text-sm font-bold" :class="currentStep >= 2 ? 'text-red-600' : 'text-slate-400'">{{ $t('register.step2.label') }}</p>
              <p class="text-sm font-bold" :class="currentStep === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ $t('register.step2.title') }}</p>
            </div>
          </div>

          <!-- Step 3: Upload CV -->
          <div class="flex gap-4 group relative">
            <div class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-300"
                 :class="[
                   currentStep === 3 ? 'border-red-600 bg-white dark:bg-slate-900' : 
                   currentStep > 3 ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 bg-white dark:bg-slate-900'
                 ]">
              <i v-if="currentStep > 3" class="mdi mdi-check text-lg"></i>
              <div v-else-if="currentStep === 3" class="h-2.5 w-2.5 rounded-full bg-red-600"></div>
            </div>
            <div class="pt-0.5">
              <p class="text-sm font-bold" :class="currentStep >= 3 ? 'text-red-600' : 'text-slate-400'">{{ $t('register.step3.label') }}</p>
              <p class="text-sm font-bold" :class="currentStep === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ $t('register.step3.title') }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Column: Form Card -->
      <main>
        <UiCard class="p-8 sm:p-12 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border-none bg-white dark:bg-slate-900">
          <UiForm
            ref="formRef"
            v-model="isFormValid"
            class="space-y-12"
            :validation-schema="schema"
            :initial-values="form"

            :validate-on-mount="false"
            @submit="handleSubmit"
          >
            <!-- Step 1: Personal Information Section -->
            <section v-show="currentStep === 1" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('register.personal_info.title') }}</h2>
                <p class="text-sm text-slate-500 mt-1">{{ $t('register.personal_info.description') }}</p>
              </div>

              <div class="grid gap-6">
                <UiInput
                  v-model="form.full_name"
                  name="full_name"
                  :label="$t('register.form.full_name')"
                  :placeholder="$t('register.form.placeholders.full_name')"
                  :rules="[requiredRule]"
                  required
                >
                  <template #prefix>
                    <i class="mdi mdi-account-outline text-xl"></i>
                  </template>
                </UiInput>

                <UiInput
                  v-model="form.email"
                  name="email"
                  type="email"
                  :label="$t('register.form.email')"
                  :placeholder="$t('register.form.placeholders.email')"
                  :rules="[requiredRule, emailRule]"
                  required
                >
                  <template #prefix>
                    <i class="mdi mdi-email-outline text-xl"></i>
                  </template>
                </UiInput>

                <UiInput
                  v-model="form.phone"
                  name="phone"
                  :label="$t('register.form.phone')"
                  :placeholder="$t('register.form.placeholders.phone')"
                  :rules="[requiredRule, phoneRule]"
                  required
                >
                  <template #prefix>
                    <i class="mdi mdi-phone-outline text-xl"></i>
                  </template>
                </UiInput>
              </div>
            </section>

            <!-- Step 2: Academic Details Section -->
            <section v-show="currentStep === 2" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('register.academic_details.title') }}</h2>

              <div class="grid gap-6">
                <UiInput
                  v-model="form.university"
                  name="university"
                  :label="$t('register.form.university')"
                  :placeholder="$t('register.form.placeholders.university')"
                  :rules="[requiredRule]"
                  required
                >
                  <template #prefix>
                    <i class="mdi mdi-school-outline text-xl"></i>
                  </template>
                </UiInput>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UiInput
                    v-model="form.major"
                    name="major"
                    :label="$t('register.form.major')"
                    :placeholder="$t('register.form.placeholders.major')"
                    :rules="[requiredRule]"
                    required
                  />

                  <UiSelect
                    v-model="form.semester"
                    name="semester"
                    :label="$t('register.form.semester')"
                    :placeholder="$t('register.form.placeholders.semester')"
                    :options="semesterOptions"
                    :rules="[requiredRule]"
                    required
                  />
                </div>

                <UiInput
                  v-model="form.period"
                  name="period"
                  :label="$t('register.form.period')"
                  :placeholder="$t('register.form.placeholders.period')"
                  :rules="[requiredRule]"
                  required
                >
                  <template #prefix>
                    <i class="mdi mdi-calendar-range text-xl"></i>
                  </template>
                </UiInput>
              </div>
            </section>

            <!-- Step 3: Upload CV Section -->
            <section v-show="currentStep === 3" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('register.upload_cv.title') }}</h2>
              
              <div class="group relative">
                <UiFileUpload
                  v-model="form.cv_file"
                  name="cv_file"
                  accept="application/pdf,.pdf"
                  :max-size="10"
                  :rules="[cvRule]"
                  required
                  variant="compact"
                  :placeholder="$t('register.upload_cv.placeholder')"
                  :hint="$t('register.upload_cv.hint')"
                  class="!border-red-200 !bg-red-50/30 dark:!bg-red-950/10 dark:!border-red-900/30 hover:!border-red-400 transition-all duration-300"
                >
                  <template #empty-icon>
                     <div class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white mb-4 mx-auto shadow-lg shadow-red-200 dark:shadow-none">
                        <i class="mdi mdi-cloud-upload text-2xl"></i>
                     </div>
                  </template>
                </UiFileUpload>
              </div>
            </section>

            <!-- Navigation Buttons -->
            <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button 
                type="button"
                class="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                @click="prevStep"
              >
                {{ $t('register.buttons.back') }}
              </button>
              
              <div class="flex gap-4">
                <UiButton
                  v-if="currentStep < 3"
                  type="button"
                  size="lg"
                  class="min-w-[140px] !bg-red-700 hover:!bg-red-800 text-white rounded-lg px-8 py-4 shadow-lg shadow-red-200 dark:shadow-none transition-all"
                  @click="nextStep"
                >
                  {{ $t('register.buttons.next') }}
                </UiButton>
                
                <UiButton
                  v-else
                  type="submit"
                  size="lg"
                  class="min-w-[200px] !bg-red-700 hover:!bg-red-800 text-white rounded-lg px-8 py-4 shadow-lg shadow-red-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
                  :loading="isSubmitting"
                >

                  {{ $t('register.buttons.submit') }}
                </UiButton>
              </div>
            </div>
          </UiForm>
        </UiCard>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

import internshipRegistrationService from "~/services/internship-registration.service";
import fileService from "~/services/file.service";
import { useConfigStore } from "~/stores/config";

definePageMeta({
  layout: false,
});

const configStore = useConfigStore();

onMounted(() => {
  const prevTheme = configStore.theme;
  configStore.setTheme("light");
  
  onUnmounted(() => {
    configStore.setTheme(prevTheme);
  });
});

const { t } = useI18n();

useHead({
  title: `${t('register.title')} - SIMASA`,
});

// Stepper Logic
const currentStep = ref(1); 


const validationSchema = z.object({
  full_name: z.string().min(1, t("register.messages.validation.full_name_required")),
  university: z.string().min(1, t("register.messages.validation.university_required")),
  major: z.string().min(1, t("register.messages.validation.major_required")),
  semester: z.coerce
    .number({ invalid_type_error: t("register.messages.validation.semester_required") })
    .int("Semester must be a whole number")
    .min(1, t("register.messages.validation.semester_required"))
    .max(14, "Invalid semester"),
  phone: z
    .string()
    .min(1, t("register.messages.validation.phone_required"))
    .regex(/^[0-9+()-\s]{10,20}$/, t("register.messages.validation.phone_invalid")),
  email: z
    .string()
    .min(1, t("register.messages.validation.email_required"))
    .email(t("register.messages.validation.email_invalid")),
  period: z.string().min(1, t("register.messages.validation.period_required")),
  cv_file: z
    .instanceof(File, { message: t("register.messages.validation.cv_required") })
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
      t("register.messages.validation.cv_type"),
    )
    .refine((file) => file.size <= 10 * 1024 * 1024, t("register.messages.validation.cv_size")),
});


type RegistrationForm = z.infer<typeof validationSchema>;

const formRef = ref();
const isFormValid = ref(false);
const isSubmitting = ref(false);

const semesterOptions = Array.from({ length: 8 }, (_, index) => ({
  label: `${t('register.form.semester')} ${index + 1}`,
  value: index + 1,
}));

const schema = toTypedSchema(validationSchema);


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

const requiredRule = (value: unknown) => !!value || t("register.messages.validation.full_name_required");
const emailRule = (value: string) =>
  /.+@.+\..+/.test(value) || t("register.messages.validation.email_invalid");
const phoneRule = (value: string) =>
  /^[0-9+()-\s]{10,20}$/.test(value) || t("register.messages.validation.phone_invalid");
const cvRule = (value: File | null) => {
  if (!value) return t("register.messages.validation.cv_required");
  if (
    value.type !== "application/pdf" &&
    !value.name.toLowerCase().endsWith(".pdf")
  )
    return t("register.messages.validation.cv_type");
  if (value.size > 10 * 1024 * 1024) return t("register.messages.validation.cv_size");
  return true;
};


// Navigation Methods
const nextStep = async () => {
  if (!formRef.value) return;

  let fieldsToValidate: any[] = [];
  if (currentStep.value === 1) {
    fieldsToValidate = ['full_name', 'email', 'phone'];
  } else if (currentStep.value === 2) {
    fieldsToValidate = ['university', 'major', 'semester', 'period'];
  }

  // Validate specifically for the current step fields to show errors
  const results = await Promise.all(fieldsToValidate.map(f => formRef.value.validateField(f)));
  const isStepValid = results.every(r => r.valid);

  if (isStepValid) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Navigate back to login or home if on the first step
    window.location.href = '/login';
  }
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
          t("register.messages.upload_failed"),
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
      cvFilePath: cvFilePath,
    };

    const result: any = await internshipRegistrationService().register(payload);

    if (result?.data?.id || result?.id) {
      useSwal().toast(t("register.messages.success"), "success");
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
      currentStep.value = 1; // Reset to first form step
    } else {
      useSwal().toast(
        result?.message || t("register.messages.error"),
        "error",
      );
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Target ONLY the upload area, not the sidebar */
.group :deep(.mdi-cloud-upload-outline) {
  display: none;
}
.group :deep(.border-dashed) {
  border-color: #fee2e2 !important;
  background-color: #fff9f9 !important;
  border-style: dashed !important;
  border-width: 1px !important;
}
.dark .group :deep(.border-dashed) {
  border-color: #450a0a !important;
  background-color: #1a0505 !important;
}

/* Specific selector for the upload prompt text to avoid leaking to sidebar */
:deep(.border-dashed) :deep(.text-slate-600) {
  color: #b91c1c !important;
  font-weight: 500;
  font-size: 0 !important;
}
:deep(.border-dashed) :deep(.text-slate-600)::before {
  content: "Unggah file ";
  color: #b91c1c;
  font-size: 0.875rem !important;
  text-decoration: underline;
}
:deep(.border-dashed) :deep(.text-slate-600)::after {
  content: "atau seret dan lepas";
  font-size: 0.875rem !important;
  color: #64748b;
  text-decoration: none !important;
  display: inline-block;
}


/* Animations */
.animate-in {
  animation-duration: 500ms;
  animation-fill-mode: both;
}
.fade-in {
  animation-name: fadeIn;
}
.slide-in-from-bottom-4 {
  animation-name: slideInFromBottom;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromBottom {
  from { transform: translateY(1rem); }
  to { transform: translateY(0); }
}
</style>

