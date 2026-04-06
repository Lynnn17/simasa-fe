<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string;
}>(), {
  message: 'Loading...',
});
</script>

