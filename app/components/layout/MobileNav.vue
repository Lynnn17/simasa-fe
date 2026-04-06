<script setup lang="ts">
interface NavItem {
  label: string;
  to?: string;
  icon: string;
  children?: NavItem[];
}

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();

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

const navigation: NavItem[] = [
  { label: "Dashboard", to: "/", icon: "home" },
  { 
    label: "Users", 
    icon: "users",
    children: [
      { label: "All Users", to: "/users", icon: "users" },
      { label: "Add User", to: "/users/add", icon: "user-add" },
      { label: "Roles", to: "/users/roles", icon: "shield" },
    ]
  },
  { 
    label: "E-Commerce", 
    icon: "shopping-cart",
    children: [
      { label: "Orders", to: "/orders", icon: "shopping-cart" },
      { label: "Products", to: "/products", icon: "package" },
      { label: "Categories", to: "/categories", icon: "folder" },
    ]
  },
  { 
    label: "Reports", 
    icon: "chart-bar",
    children: [
      { label: "Sales Report", to: "/reports/sales", icon: "chart-bar" },
      { label: "Traffic Report", to: "/reports/traffic", icon: "trending-up" },
    ]
  },
  { label: "Settings", to: "/settings", icon: "settings" },
];

const isActive = (path?: string) => {
  if (!path) return false;
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

const isParentActive = (item: NavItem) => {
  if (item.children) {
    return item.children.some(child => isActive(child.to));
  }
  return isActive(item.to);
};

const handleItemClick = (item: NavItem) => {
  if (item.to) {
    emit("close");
  }
};

const icons: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  "user-add": "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "shopping-cart": "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  "chart-bar": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "trending-up": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  chevronDown: "M19 9l-7 7-7-7",
};
</script>

<template>
  <nav class="p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
    <div class="space-y-1">
      <template v-for="item in navigation" :key="item.label">
        <!-- Item with dropdown -->
        <div v-if="item.children">
          <button
            :class="[
              'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-colors',
              isParentActive(item)
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
            @click="toggleDropdown(item.label)"
          >
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="icons[item.icon]" />
              </svg>
              <span class="font-medium">{{ item.label }}</span>
            </div>
            <svg 
              :class="['w-4 h-4 transition-transform', isDropdownOpen(item.label) ? 'rotate-180' : '']"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="icons.chevronDown" />
            </svg>
          </button>

          <!-- Children -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div 
              v-if="isDropdownOpen(item.label)" 
              class="mt-1 ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-1 overflow-hidden"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                :class="[
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors',
                  isActive(child.to)
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
                @click="handleItemClick(child)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="icons[child.icon]" />
                </svg>
                <span class="text-sm">{{ child.label }}</span>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- Single item -->
        <NuxtLink
          v-else
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            isActive(item.to)
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          @click="handleItemClick(item)"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons[item.icon]" />
          </svg>
          <span class="font-medium">{{ item.label }}</span>
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>
