<script setup lang="ts">
const { t } = useTranslation();
const isVisible = ref(false);

onMounted(() => {
  // Check consent status after small delay to allow animation
  setTimeout(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      isVisible.value = true;
    }
  }, 1500);
});

const accept = () => {
  localStorage.setItem('cookie_consent', 'accepted');
  isVisible.value = false;
};

const decline = () => {
  // Even if declined, we might need essential cookies (session).
  // This usually implies opting out of tracking/analytics.
  localStorage.setItem('cookie_consent', 'declined');
  isVisible.value = false;
};
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-6 right-6 z-[60] w-full max-w-sm will-change-transform"
    >
      <div class="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
        <!-- Glow effect -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>

        <div class="relative flex flex-col gap-4">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
               <!-- Cookie Icon -->
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white mb-1.5">
                We use cookies
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 justify-end">
            <button
              @click="decline"
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              @click="accept"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
