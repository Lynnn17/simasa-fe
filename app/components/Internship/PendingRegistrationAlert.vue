<script setup lang="ts">
/**
 * PendingRegistrationAlert - Internal notification component for HRD
 * Shows a persistent banner when there are new/pending internship applicants
 */
import internshipRegistrationService from "~/services/internship-registration.service";

const regSvc = internshipRegistrationService();
const pendingCount = ref(0);
const isVisible = ref(false);
const pollingInterval = ref<any>(null);

const fetchPendingCount = async () => {
  try {
    const res: any = await regSvc.getPendingRegistrations();
    pendingCount.value = res?.data?.length || 0;
    isVisible.value = pendingCount.value > 0;
  } catch (error) {
    console.error("Failed to fetch pending registration count", error);
  }
};

// Start polling on mount
onMounted(() => {
  fetchPendingCount();
  // Poll every 60 seconds
  pollingInterval.value = setInterval(fetchPendingCount, 60000);
});

// Clean up polling on unmount
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});

// Refresh method to be exposed
const refresh = () => fetchPendingCount();

defineExpose({ refresh });
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="transform -translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-4 opacity-0"
  >
    <div v-if="isVisible" class="mb-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-px shadow-lg shadow-red-200/50 dark:shadow-none">
        <div class="relative flex flex-col sm:flex-row items-center gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 py-4 rounded-[15px]">
          <!-- Icon Pulse -->
          <div class="flex-shrink-0 relative">
            <div class="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20"></div>
            <div class="relative h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800">
              <i class="mdi mdi-account-clock text-2xl text-red-600 dark:text-red-400"></i>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 text-center sm:text-left">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {{ $t('dashboard.hrd.new_applicants_title', 'Ada Pendaftar Baru!') }}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {{ $t('dashboard.hrd.new_applicants_desc', { count: pendingCount }, 'Terdapat {count} calon peserta magang yang sedang menunggu peninjauan Anda.') }}
            </p>
          </div>

          <!-- Action -->
          <div class="flex-shrink-0">
            <NuxtLink to="/internship/registrations">
              <UiButton 
                size="md" 
                class="!bg-red-600 hover:!bg-red-700 text-white shadow-md shadow-red-200 dark:shadow-none"
              >
                {{ $t('dashboard.hrd.review_now', 'Review Sekarang') }}
                <i class="mdi mdi-arrow-right ml-2"></i>
              </UiButton>
            </NuxtLink>
          </div>

          <!-- Close Button (Optional) -->
          <button 
            @click="isVisible = false"
            class="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        
        <!-- Animated underline pulse -->
        <div class="absolute bottom-0 left-0 h-1 bg-white/20 animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
