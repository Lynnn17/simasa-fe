<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useConfigStore } from "~/stores/config";

const { toggle, openMobile } = useSidebar();
const authStore = useAuthStore();
const configStore = useConfigStore();

// Use local refs that sync with store after mount to avoid hydration issues
const sidebarLayout = ref<"vertical" | "horizontal">("vertical");
const sidebarCollapsed = ref(false);

onMounted(() => {
  sidebarLayout.value = configStore.sidebarLayout;
  sidebarCollapsed.value = configStore.sidebarCollapsed;
  
  watch(() => configStore.sidebarLayout, (val) => {
    sidebarLayout.value = val;
  });
  watch(() => configStore.sidebarCollapsed, (val) => {
    sidebarCollapsed.value = val;
  });
});


</script>

<template>
  <header
    :class="[
      'fixed top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg transition-all duration-300',
      sidebarLayout === 'horizontal' 
        ? 'left-0 right-0' 
        : sidebarCollapsed ? 'left-0 lg:left-20 right-0' : 'left-0 lg:left-64 right-0',
    ]"
    style="box-shadow: rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px;"
  >
    <div class="flex items-center justify-between h-full px-4 lg:px-6">
      <!-- Left section -->
      <div class="flex items-center gap-4">
        <!-- Logo (only for horizontal layout on desktop) -->
        <UiAppLogo v-if="sidebarLayout === 'horizontal'" class="hidden lg:flex mr-4" />

        <!-- Mobile menu button (for both layouts on mobile) -->
        <button
          class="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          @click="openMobile"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Collapse toggle (desktop, vertical only) -->
        <button
          v-if="sidebarLayout === 'vertical'"
          class="hidden lg:flex p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          @click="configStore.toggleSidebar()"
        >
          <UiIcon 
            v-if="!sidebarCollapsed"
            name="IconMenu2" 
            type="tabler" 
            size="md"
            class="transition-transform"
          />
          <UiIcon 
            v-else
            name="IconChevronsRight" 
            type="tabler" 
            size="md"
            class="transition-transform"
          />
        </button>

        <!-- Horizontal Navigation (desktop only) -->
        <LayoutHorizontalNav v-if="sidebarLayout === 'horizontal'" />

        <!-- Search (only show when vertical layout on desktop) -->
        <!-- <div v-if="sidebarLayout === 'vertical'" class="hidden md:block relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            class="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div> -->
      </div>

      <!-- Right section -->
      <div class="flex items-center gap-2">
        <!-- Search for horizontal layout on desktop -->
        <!-- <div v-if="sidebarLayout === 'horizontal'" class="hidden lg:block relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            class="w-48 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div> -->

        <!-- Language Switcher -->
        <LayoutLanguageSwitcher />

        <!-- Theme toggle - ClientOnly to prevent hydration mismatch -->
        <ClientOnly>
          <button
            class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            @click="configStore.toggleTheme()"
          >
            <svg v-if="configStore.isDarkTheme" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <template #fallback>
            <div class="p-2">
              <div class="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
          </template>
        </ClientOnly>

        <!-- Notifications -->
        <LayoutNotificationDropdown />

        <!-- User Profile Dropdown -->
        <LayoutUserProfileDropdown />
      </div>
    </div>
  </header>
</template>
