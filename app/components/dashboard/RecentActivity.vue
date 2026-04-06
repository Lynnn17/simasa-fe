<script setup lang="ts">
interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "create" | "update" | "delete" | "login";
}

const activities: Activity[] = [
  { id: 1, user: "John Doe", action: "created", target: "new product", time: "2 minutes ago", type: "create" },
  { id: 2, user: "Jane Smith", action: "updated", target: "order #1234", time: "15 minutes ago", type: "update" },
  { id: 3, user: "Mike Johnson", action: "logged in", target: "", time: "1 hour ago", type: "login" },
  { id: 4, user: "Sarah Williams", action: "deleted", target: "user account", time: "2 hours ago", type: "delete" },
  { id: 5, user: "Tom Brown", action: "created", target: "new category", time: "3 hours ago", type: "create" },
];

const typeClasses = {
  create: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  update: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
  delete: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  login: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
};

const typeIcons = {
  create: "M12 4v16m8-8H4",
  update: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  login: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1",
};
</script>

<template>
  <UiCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
        <NuxtLink to="/" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
          View all
        </NuxtLink>
      </div>
    </template>

    <div class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-center gap-4"
      >
        <div :class="['p-2 rounded-lg', typeClasses[activity.type]]">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="typeIcons[activity.type]" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-900 dark:text-white">
            <span class="font-medium">{{ activity.user }}</span>
            {{ activity.action }}
            <span v-if="activity.target" class="font-medium">{{ activity.target }}</span>
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ activity.time }}</p>
        </div>
      </div>
    </div>
  </UiCard>
</template>
