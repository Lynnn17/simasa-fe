<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <UiCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
          <p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
        </div>
        <slot name="actions" />
      </div>
    </template>
    
    <!-- Chart placeholder -->
    <!-- Chart area -->
    <div class="h-64 mt-4 relative z-10 w-full overflow-hidden">
      <slot>
        <!-- Default placeholder if no chart provided -->
        <div class="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
           <p class="text-slate-400">No chart data</p>
        </div>
      </slot>
    </div>
  </UiCard>
</template>
