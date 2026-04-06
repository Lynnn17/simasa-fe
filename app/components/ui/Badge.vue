<script setup lang="ts">
interface Props {
  variant?: "primary" | "success" | "warning" | "danger" | "default";
  size?: "sm" | "md";
  dot?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  dot: false,
});

const variantClasses = {
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  default: "badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const dotColors = {
  primary: "bg-primary-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  default: "bg-slate-400",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};
</script>

<template>
  <span :class="[variantClasses[variant], sizeClasses[size]]">
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant]]" />
    <slot />
  </span>
</template>
