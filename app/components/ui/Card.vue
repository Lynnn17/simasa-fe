<script setup lang="ts">
interface Props {
  hover?: boolean;
  padding?: boolean;
}

withDefaults(defineProps<Props>(), {
  hover: false,
  padding: true,
});
</script>

<template>
  <div :class="[hover ? 'card-hover' : 'card', { 'p-6': padding }]">
    <div v-if="$slots.header" class="border-b border-slate-200 dark:border-slate-700 -mx-6 -mt-6 px-6 py-4 mb-6">
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="border-t border-slate-200 dark:border-slate-700 -mx-6 -mb-6 px-6 py-4 mt-6">
      <slot name="footer" />
    </div>
  </div>
</template>
