<template>
  <div class="min-h-screen flex relative">
    <!-- Language Switcher - Absolute Top Right -->
    <div class="absolute top-6 right-6 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
      <LayoutLanguageSwitcher />
    </div>
    <!-- Left Side - Illustration with Blue Gradient -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 relative overflow-hidden flex-col justify-center items-center p-12"
    >
      <!-- Decorative Circles -->
      <div
        class="absolute -top-20 -right-20 w-60 h-60 bg-primary-300/30 rounded-full"
      ></div>
      <div
        class="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-300/30 rounded-full"
      ></div>

      <!-- Logo - Top Left Corner -->
      <UiAppLogo 
        class="hidden lg:flex"
        position="absolute-top-left" 
        image="/images/logo-ajinomoto.webp" 
        :logo-size="90" />

      <!-- Image -->
      <div class="relative z-10 mb-12">
        <img
          src="/images/login-ilus.svg"
          alt="Learning Illustration"
          class="w-full max-w-sm object-contain"
        />
      </div>

      <!-- Text Content Slider -->
      <div class="relative z-10 text-center overflow-hidden">
        <TransitionGroup
          tag="div"
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 translate-x-8"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-300 ease-in absolute inset-0"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-8"
        >
          <div v-if="currentSlide === 0" key="slide-0">
            <h1 class="text-3xl font-bold text-slate-800 mb-4">
              {{ $t('login.slider.slide1.title_1') }}
              <br />
              <span class="text-primary-500">{{ $t('login.slider.slide1.title_highlight') }}</span> {{ $t('login.slider.slide1.title_2') }}
            </h1>
            <p class="text-slate-600 font-medium">
              {{ $t('login.slider.slide1.description') }}
            </p>
          </div>
          <div v-else-if="currentSlide === 1" key="slide-1">
            <h1 class="text-3xl font-bold text-slate-800 mb-4">
              {{ $t('login.slider.slide2.title_1') }}
              <br />
              <span class="text-primary-500">{{ $t('login.slider.slide2.title_highlight') }}</span>
            </h1>
            <p class="text-slate-600 font-medium">
              {{ $t('login.slider.slide2.description') }}
            </p>
          </div>
          <div v-else key="slide-2">
            <h1 class="text-3xl font-bold text-slate-800 mb-4">
              {{ $t('login.slider.slide3.title_1') }}
              <br />
              <span class="text-primary-500">{{ $t('login.slider.slide3.title_highlight') }}</span>
            </h1>
            <p class="text-slate-600 font-medium">
              {{ $t('login.slider.slide3.description') }}
            </p>
          </div>
        </TransitionGroup>

        <!-- Pagination Dots -->
        <div class="flex justify-center gap-2 mt-8">
          <button
            v-for="(_, index) in slides"
            :key="index"
            :class="[
              'h-2 rounded-full transition-all duration-300',
              currentSlide === index
                ? 'w-8 bg-primary-500'
                : 'w-2 bg-primary-200 dark:bg-primary-800 hover:bg-primary-300',
            ]"
            @click="goToSlide(index)"
          />
        </div>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div class="w-full lg:w-1/2 flex flex-col bg-white dark:bg-slate-900">
      <!-- Form Container -->
      <div
        class="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 pb-12 pt-12 lg:pt-0"
      >
        <div class="max-w-md w-full mx-auto">
          <!-- Mobile Logo (Shown only on small screens) -->
          <div class="lg:hidden flex justify-center mb-8">
            <UiAppLogo 
              image="/images/logo-ajinomoto.webp" 
              :logo-size="80" 
            />
          </div>

          <!-- Title -->
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {{ $t('login.welcome_title') }}
          </h2>
          <p class="text-slate-600 dark:text-slate-400 mb-8">
            {{ $t('login.sign_into') }}
          </p>

          <!-- Form -->
          <UiForm ref="formRef" class="space-y-6" @submit="handleSubmit">
            <UiInput
              v-model="form.username"
              name="username"
              type="text"
              :label="$t('login.username_label')"
              :placeholder="$t('login.username_placeholder')"
              :rules="usernameRules"
              size="lg"
            >
              <template #prefix>
                <UiIcon name="mdi-email-outline" size="md" />
              </template>
            </UiInput>

            <UiInput
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              :label="$t('login.password_label')"
              :placeholder="$t('login.password_placeholder')"
              :rules="passwordRules"
              size="lg"
            >
              <template #prefix>
                <UiIcon name="mdi-key-outline" size="md" />
              </template>
              <template #suffix>
                <UiIconButton
                  :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  size="sm"
                  variant="ghost"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UiInput>

            <div class="flex items-center justify-between">
              <!-- <label class="flex items-center gap-2 cursor-pointer">
                <UiCheckbox v-model="form.remember" />
                <span class="text-sm text-slate-600 dark:text-slate-400"
                  >Remember Me</span
                >
              </label> -->
              <a
                href="#"
                class="text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                {{ $t('login.forgot_password') }}
              </a>
            </div>

            <UiButton
              type="submit"
              size="lg"
              :loading="authStore.loading"
              class="w-full !bg-primary-500 hover:!bg-primary-600 !border-primary-500 mt-3"
            >
              Login
            </UiButton>
          </UiForm>

          <!-- Copyright -->
          <p
            class="mt-10 text-center text-sm text-slate-600 dark:text-slate-400"
          >
            Copyright © 2026 Gate System Ajinomoto. All rights reserved.
          </p>
        </div>
      </div>
    </div>
    <UiCookieConsent />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useConfigStore } from "~/stores/config";

definePageMeta({
  layout: false,
});

useHead({
  title: "Login",
});

// Init theme
const { t } = useTranslation();
const configStore = useConfigStore();
onMounted(() => {
  configStore.applyTheme();
  configStore.applyPrimaryColor();
});

const authStore = useAuthStore();
const swal = useSwal();
const formRef = ref();
const showPassword = ref(false);

// Slider logic
const slides = [0, 1, 2];
const currentSlide = ref(0);
let slideInterval: ReturnType<typeof setInterval>;

const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetInterval();
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const resetInterval = () => {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
};

onMounted(() => {
  slideInterval = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  clearInterval(slideInterval);
});

const form = reactive({
  username: "",
  password: "",
  remember: false,
});

// Validation rules
const usernameRules = [(v: string) => !!v || t("login.username_required")];
const passwordRules = [(v: string) => !!v || t("login.password_required")];

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;

  const result = await authStore.login(form.username, form.password);
  if (result.success) {
    navigateTo("/dashboard", { external: true });
  } else {
    swal.toast(result.error || "Login gagal. Silakan coba lagi.", "error");
  }
};
</script>
