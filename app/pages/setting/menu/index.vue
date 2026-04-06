<template>
  <div class="w-full space-y-4 animate-fade-in">
    <LayoutBreadcrumb :items="breadcrumbs" />

    <!-- Main Card -->
    <div class="bg-white dark:bg-slate-800 rounded-sm shadow-sm overflow-hidden">
      <!-- Header Bar -->
      <div :class="['flex flex-wrap items-center justify-between gap-3 px-5 py-2.5', headerClass]">
        <h2 class="text-lg font-semibold text-white">Data Menu</h2>
      </div>

      <div class="px-3">
        <!-- Tabs -->
        <UiTabs v-model="activeTab" :tabs="tabs">
          <!-- Menu Tab -->
          <template #menu>
            <PagesMenuList />
          </template>

          <!-- Permission Tab (Hak Akses) -->
          <template #permission>
            <PagesMenuPermission />
          </template>
        </UiTabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  // permission: "MENU.VIEW",
});

useHead({
  title: "Menu",
});

const headerThemeClasses: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  slate: 'bg-slate-500',
  primary: 'bg-primary-500',
}

const headerClass = computed(() => {
  return headerThemeClasses['primary'] || headerThemeClasses.primary
})

const activeTab = ref('menu');
const tabs = [
  { id: 'menu', name: 'Menu' },
  { id: 'permission', name: 'Hak Akses' },
];
const breadcrumbs = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Settings' },
  { label: 'Permission' },
]);
</script>
