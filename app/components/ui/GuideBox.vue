<template>
  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <p class="font-medium text-blue-800 dark:text-blue-200 mb-3">
      <i :class="['mdi mr-1', icon]"></i>
      {{ title }}
    </p>
    <div :class="['grid grid-cols-1 gap-4', gridColsClass]">
      <div v-for="(step, index) in steps" :key="index" class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
          {{ index + 1 }}
        </div>
        <div>
          <p class="font-medium text-blue-800 dark:text-blue-200 text-sm">{{ step.title }}</p>
          <p class="text-xs text-blue-600 dark:text-blue-400">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Step {
  title: string;
  description: string;
}

const props = withDefaults(defineProps<{
  title: string;
  steps: Step[];
  icon?: string;
  cols?: number;
}>(), {
  icon: 'mdi-information',
  cols: 4
});

const gridColsClass = computed(() => {
  // Safe list for Tailwind safelisting if needed, or just standard classes
  // Explicitly returning valid Tailwind classes
  switch (props.cols) {
    case 1: return 'md:grid-cols-1';
    case 2: return 'md:grid-cols-2';
    case 3: return 'md:grid-cols-3';
    case 5: return 'md:grid-cols-5';
    case 6: return 'md:grid-cols-6';
    case 4: 
    default:
      return 'md:grid-cols-4';
  }
});
</script>
