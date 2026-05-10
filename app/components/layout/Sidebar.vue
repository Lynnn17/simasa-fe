<script setup lang="ts">
import { useConfigStore } from "~/stores/config";
import { useAuthStore } from "~/stores/auth";

const { isMobileOpen, closeMobile } = useSidebar();
const configStore = useConfigStore();
const authStore = useAuthStore();
const route = useRoute();

// Use local refs that sync with store after mount to avoid hydration issues
const sidebarLayout = ref<"vertical" | "horizontal">("vertical");
const sidebarCollapsed = ref(false);

// Hover state for auto-expand when collapsed
const isHovered = ref(false);

// Check if we're on mobile (screen < lg breakpoint)
const isOnMobile = ref(false);

onMounted(() => {
  const checkMobile = () => {
    isOnMobile.value = window.innerWidth < 1024;
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  onUnmounted(() => window.removeEventListener('resize', checkMobile));
});

// Computed: sidebar should show as expanded when hovered while collapsed
// On mobile, always show as expanded (not collapsed)
const isEffectivelyCollapsed = computed(() => {
  // Never collapse on mobile
  if (isOnMobile.value || isMobileOpen.value) return false;
  return sidebarCollapsed.value && showOnDesktop.value && !isHovered.value;
});

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

// Track which dropdowns are open
const openDropdowns = ref<Set<string>>(new Set());

const toggleDropdown = (label: string) => {
  if (openDropdowns.value.has(label)) {
    openDropdowns.value.delete(label);
  } else {
    openDropdowns.value.add(label);
  }
};

const isDropdownOpen = (label: string) => openDropdowns.value.has(label);

// Get menus from auth store
const menus = computed(() => authStore.getMenus || []);

const isActive = (path?: string) => {
  if (!path) return false;
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};

const isParentActive = (item: any) => {
  if (item.children && item.children.length > 0) {
    return item.children.some((child: any) => isActive(child.link || child.path));
  }
  return isActive(item.link || item.path);
};

// Check if should show sidebar on desktop based on layout
const showOnDesktop = computed(() => sidebarLayout.value === "vertical");

// Handle logout
const handleLogout = async () => {
  const swal = useSwal();
  const result = await swal.confirm(
    'Logout',
    'Apakah Anda yakin ingin keluar dari akun ini?'
  );
  
  if (result.isConfirmed) {
    authStore.logout();
    closeMobile();
    navigateTo("/login");
  }
};
</script>

<template>
  <!-- Mobile overlay - shows for both layouts on mobile -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
      @click="closeMobile"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-900 transition-transform lg:transition-[width,transform] duration-300 will-change-transform',
      isEffectivelyCollapsed ? 'w-20' : 'w-64',
      // Mobile: show when isMobileOpen is true (for both layouts)
      isMobileOpen ? 'translate-x-0' : '-translate-x-full',
      // Desktop: always show for vertical, always hide for horizontal
      showOnDesktop ? 'lg:translate-x-0' : 'lg:-translate-x-full',
    ]"
    style="box-shadow: rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px;"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Logo -->
    <div 
      class="flex items-center justify-center border-slate-200 dark:border-slate-800 transition-all duration-300 mt-4 mb-4"
    >
      <UiAppLogo 
        :collapsed="isEffectivelyCollapsed" 
        :logo-size="isEffectivelyCollapsed ? 35 : 100" />
    </div>

    <!-- Navigation -->
    <nav class="p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <div class="space-y-1.5">
        <template v-for="item in menus" :key="item.id || item.name">
          <!-- Item with children (dropdown) -->
          <div v-if="item.children && item.children.length > 0">
            <button
              :class="[
                isParentActive(item) ? 'nav-item-active' : 'nav-item',
                isEffectivelyCollapsed ? 'justify-center px-3' : '',
                'w-full'
              ]"
              @click="toggleDropdown(item.name)"
            >
              <UiIcon 
                :name="item.icon || 'IconFolder'" 
                type="tabler" 
                size="md" 
                class="flex-shrink-0"
              />
              <span v-if="!isEffectivelyCollapsed" class="truncate flex-1 text-left">{{ item.name }}</span>
              <UiIcon 
                v-if="!isEffectivelyCollapsed"
                name="IconChevronDown" 
                type="tabler" 
                size="sm"
                :class="[
                  'transition-transform duration-200',
                  isDropdownOpen(item.name) ? 'rotate-180' : ''
                ]"
              />
            </button>
            
            <!-- Dropdown children -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div 
                v-if="isDropdownOpen(item.name) && !isEffectivelyCollapsed" 
                class="mt-1 ml-4 pl-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-1.5 overflow-hidden"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.id || child.name"
                  :to="child.link || child.path || '#'"
                  :class="isActive(child.link || child.path) ? 'nav-sub-item-active' : 'nav-sub-item'"
                  @click="closeMobile"
                >
                  <UiIcon 
                    :name="child.icon || 'IconPoint'" 
                    type="tabler" 
                    size="sm"
                    class="flex-shrink-0"
                  />
                  <span class="truncate">{{ child.name }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <!-- Single item (no children) -->
          <NuxtLink
            v-else
            :to="item.link || item.path || '#'"
            :class="[
              isActive(item.link || item.path) ? 'nav-item-active' : 'nav-item',
              isEffectivelyCollapsed ? 'justify-center px-3' : '',
            ]"
            @click="closeMobile"
          >
            <UiIcon 
              :name="item.icon || 'IconCircle'" 
              type="tabler" 
              size="md"
              class="flex-shrink-0"
            />
            <span v-if="!isEffectivelyCollapsed" class="truncate">{{ item.name }}</span>
          </NuxtLink>
        </template>
      </div>
    </nav>

    <!-- User Profile Section -->
    <div class="absolute bottom-0 left-0 right-0 p-4">
      <div 
        class="bg-primary-50 dark:bg-primary-950/30 rounded-xl p-3"
        :class="{ 'p-2': isEffectivelyCollapsed }"
      >
        <div class="flex items-center gap-3" :class="{ 'justify-center': isEffectivelyCollapsed }">
          <!-- Avatar -->
          <UiAvatar :name="authStore.user?.name || 'User'" size="md" />
          
          <!-- User Info (hidden when collapsed) -->
          <div v-if="!isEffectivelyCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {{ authStore.user?.name || 'User' }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ typeof authStore.user?.role === 'object' ? authStore.user?.role?.name : authStore.user?.role || 'Guest' }}
            </p>
          </div>
          
          <!-- Logout Button -->
          <button
            v-if="!isEffectivelyCollapsed"
            class="p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
            title="Logout"
            @click="handleLogout"
          >
            <UiIcon name="IconPower" type="tabler" size="md" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

