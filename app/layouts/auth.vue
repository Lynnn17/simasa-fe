<script setup lang="ts">
import { useConfigStore } from "~/stores/config";

const { isDark, initTheme, toggleDark } = useTheme();
const configStore = useConfigStore();

onMounted(() => {
  initTheme();
  // Initialize primary color only, not sidebar layout
  configStore.applyPrimaryColor();
  configStore.applyTheme();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <!-- Background pattern -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
    </div>

    <!-- Theme toggle -->
    <button
      class="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
      @click="toggleDark"
    >
      <svg v-if="isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <!-- Content - explicitly centered -->
    <div class="relative w-full max-w-md mx-auto">
      <slot />
    </div>
  </div>
</template>
