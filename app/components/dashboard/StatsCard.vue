<script setup lang="ts">
interface Props {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  color?: "primary" | "success" | "warning" | "danger";
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
});

const colorClasses = {
  primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
  success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

const icons: Record<string, string> = {
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  revenue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  orders: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  growth: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "book-open": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "academic-cap": "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222",
  "trending-up": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
};
</script>

<template>
  <UiCard class="relative overflow-hidden">
    <div class="flex items-start justify-between">
      <div class="space-y-2">
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          {{ title }}
        </p>
        <p class="text-3xl font-bold text-slate-900 dark:text-white">
          {{ value }}
        </p>
        <div v-if="change !== undefined" class="flex items-center gap-1 text-sm">
          <svg
            :class="[
              'w-4 h-4',
              change >= 0 ? 'text-emerald-500' : 'text-red-500 rotate-180',
            ]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span :class="change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
            {{ Math.abs(change) }}%
          </span>
          <span v-if="changeLabel" class="text-slate-500 dark:text-slate-400">
            {{ changeLabel }}
          </span>
        </div>
      </div>
      <div
        v-if="icon"
        :class="['p-3 rounded-xl', colorClasses[color]]"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icons[icon]" />
        </svg>
      </div>
    </div>
  </UiCard>
</template>
