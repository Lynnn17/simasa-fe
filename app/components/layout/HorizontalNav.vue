<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const authStore = useAuthStore();

// Track which dropdowns are open
const openDropdown = ref<string | null>(null);
const dropdownRef = ref<HTMLElement>();

const toggleDropdown = (label: string) => {
  openDropdown.value = openDropdown.value === label ? null : label;
};

const closeDropdown = () => {
  openDropdown.value = null;
};

// Get menus from auth store
const menus = computed(() => authStore.getMenus || []);

const isActive = (path?: string) => {
  if (!path) return false;
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

const isParentActive = (item: any) => {
  if (item.children && item.children.length > 0) {
    return item.children.some((child: any) => isActive(child.link || child.path));
  }
  return isActive(item.link || item.path);
};

// Close dropdown on click outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      closeDropdown();
    }
  };
  document.addEventListener("click", handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>

<template>
  <nav ref="dropdownRef" class="hidden lg:flex items-center gap-1">
    <template v-for="item in menus" :key="item.id || item.name">
      <!-- Item with dropdown -->
      <div v-if="item.children && item.children.length > 0" class="relative">
        <button
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            isParentActive(item)
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          @click.stop="toggleDropdown(item.name)"
        >
          <UiIcon 
            :name="item.icon || 'IconFolder'" 
            type="tabler" 
            size="sm"
          />
          {{ item.name }}
          <UiIcon 
            name="IconChevronDown" 
            type="tabler" 
            size="xs"
            :class="['transition-transform', openDropdown === item.name ? 'rotate-180' : '']"
          />
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="openDropdown === item.name"
            class="absolute top-full left-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.id || child.name"
              :to="child.link || child.path || '#'"
              :class="[
                'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                isActive(child.link || child.path)
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              ]"
              @click="closeDropdown"
            >
              <UiIcon 
                :name="child.icon || 'IconPoint'" 
                type="tabler" 
                size="sm"
              />
              {{ child.name }}
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <!-- Single item -->
      <NuxtLink
        v-else
        :to="item.link || item.path || '#'"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
          isActive(item.link || item.path)
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        <UiIcon 
          :name="item.icon || 'IconCircle'" 
          type="tabler" 
          size="sm"
        />
        {{ item.name }}
      </NuxtLink>
    </template>
  </nav>
</template>

