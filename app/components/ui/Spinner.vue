<template>
  <div 
    class="inline-block animate-spin rounded-full border-2 border-t-transparent"
    :class="[
      sizeClasses[size],
      colorClasses[color],
      customClass
    ]"
    role="status"
    aria-label="loading"
  >
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'slate' | 'danger' | 'warning' | 'success';
  customClass?: string;
  borderWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  customClass: '',
});

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
  xl: 'h-16 w-16 border-4',
};

const colorClasses = {
  primary: 'border-primary-500',
  white: 'border-white',
  slate: 'border-slate-500',
  danger: 'border-red-500',
  warning: 'border-amber-500',
  success: 'border-green-500',
};
</script>
