<template>
  <div :class="containerClass">
    <img
      v-if="image"
      :src="image"
      alt="App Logo"
      :style="logoStyle"
      class="object-contain max-w-full"
    />
    <template v-else>
      <img
        src="/images/logo.png"
        alt="Greatsoft Logo"
        class="object-contain w-10 h-10"
      />
      <span
        v-if="!collapsed"
        class="text-xl font-bold whitespace-nowrap"
        :class="textClass"
      >
        Greatsoft<sup class="text-xs text-primary-500">Internship</sup>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  position?: "default" | "absolute-top-left";
  collapsed?: boolean;
  mode?: "light" | "dark" | "auto";
  image?: string;
  logoSize?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  position: "default",
  collapsed: false,
  mode: "auto",
  image: "",
  logoSize: 40,
});

const textClass = computed(() => {
  if (props.mode === "dark") return "text-white";
  if (props.mode === "light") return "text-slate-900";
  return "text-slate-900 dark:text-white";
});

const logoStyle = computed(() => {
  const size = props.logoSize;
  // If it's a number or a string that looks like a number, treat as px
  // Otherwise leverage the string as is (e.g. "2rem")
  if (!isNaN(Number(size))) {
    return { height: `${size}px` };
  }
  return { height: size as string };
});

const containerClass = computed(() => {
  const baseClass = "flex items-center gap-2";

  if (props.position === "absolute-top-left") {
    return `${baseClass} absolute top-6 left-6 lg:top-8 lg:left-8 z-20`;
  }

  return baseClass;
});
</script>
