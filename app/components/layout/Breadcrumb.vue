<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

defineProps<Props>();
</script>

<template>
  <nav class="flex items-center gap-2 text-sm">
    <template v-for="(item, index) in items" :key="index">
      <NuxtLink
        v-if="item.to"
        :to="item.to"
        class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else class="text-slate-900 dark:text-white font-medium">
        {{ item.label }}
      </span>
      <svg
        v-if="index < items.length - 1"
        class="w-4 h-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </template>
  </nav>
</template>
