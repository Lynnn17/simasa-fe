<script setup lang="ts">
interface Props {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  alt: "Avatar",
});

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const initials = computed(() => {
  if (!props.name) return "";
  const names = props.name.trim().split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
});

const colorFromName = computed(() => {
  if (!props.name) return "bg-slate-500";
  const colors = [
    "bg-primary-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-pink-500",
  ];
  const hash = props.name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
});
</script>

<template>
  <div
    :class="[
      'inline-flex items-center justify-center rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-800',
      sizeClasses[size],
    ]"
  >
    <img v-if="src" :src="src" :alt="alt" class="w-full h-full object-cover" />
    <div
      v-else
      :class="[
        'w-full h-full flex items-center justify-center font-medium text-white',
        colorFromName,
      ]"
    >
      {{ initials }}
    </div>
  </div>
</template>
