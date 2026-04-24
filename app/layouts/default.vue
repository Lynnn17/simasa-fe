<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useConfigStore } from "~/stores/config";

const authStore = useAuthStore();
const configStore = useConfigStore();
const runtimeConfig = useRuntimeConfig();
const { isCollapsed, isMobileOpen, closeMobile, toggle } = useSidebar();
const isReady = ref(false);
const sidebarLayout = ref<"vertical" | "horizontal">("vertical");
const sidebarCollapsed = ref(false);

onMounted(() => {
  // Always init config for theme/layout settings
  configStore.initConfig();
  
  const tokenCookie = useCookie(runtimeConfig.public.tokenKey);
  if (!tokenCookie.value && !authStore.isAuthenticated) {
    // Not authenticated - let middleware handle redirect
    // Still keep isReady false so loading shows
    return;
  }
  
  sidebarLayout.value = configStore.sidebarLayout;
  sidebarCollapsed.value = configStore.sidebarCollapsed;
  
  watch(() => configStore.sidebarLayout, (val) => {
    sidebarLayout.value = val;
  });
  watch(() => configStore.sidebarCollapsed, (val) => {
    sidebarCollapsed.value = val;
  });
  
  nextTick(() => {
    isReady.value = true;
  });
});

const handleLogout = () => {
  authStore.logout();
  closeMobile();
  navigateTo("/login");
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Loading overlay - covers ALL content while not ready -->
    <UiPageLoading v-if="!isReady" class="fixed inset-0 z-[100]" />
    
    <div v-if="isReady">
      <LayoutSidebar />
      <LayoutHeader />
      <LayoutSettingsPanel />
    </div>
    <UiToast />

    <!-- Main content - slot always renders to prevent NuxtPage warning -->
    <main
      :class="[
        'pt-16 min-h-screen transition-[padding] duration-300 w-full',
        sidebarLayout === 'vertical' 
          ? (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64')
          : '',
      ]"
    >
      <div class="p-4 lg:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
