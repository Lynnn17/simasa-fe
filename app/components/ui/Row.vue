<script setup lang="ts">
/**
 * UiRow - Flex row container for UiCol
 */
interface Props {
  gap?: number | string;
  mb?: number | string;
  noGutters?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const props = withDefaults(defineProps<Props>(), {
  gap: 4,
  mb: 4,
  noGutters: false,
  align: 'stretch',
  justify: 'start',
});

const alignMap: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

// Convert gap to pixels (gap * 4px like Tailwind)
const gapPx = computed(() => {
  const g = Number(props.gap);
  return isNaN(g) ? 16 : g * 4;
});

// Convert mb to pixels
const mbPx = computed(() => {
  const m = Number(props.mb);
  return isNaN(m) ? 0 : m * 4;
});

const rowClasses = computed(() => {
  return [
    'flex flex-wrap',
    props.noGutters ? '' : '',
    alignMap[props.align],
    justifyMap[props.justify],
  ].filter(Boolean).join(' ');
});

const rowStyle = computed(() => ({
  '--row-gap': `${gapPx.value}px`,
  margin: props.noGutters 
    ? `0 0 ${mbPx.value}px 0` 
    : `0 -${gapPx.value / 2}px ${mbPx.value - gapPx.value}px`,
}));

// Provide gap to child UiCol components
provide('rowGap', gapPx);
</script>

<template>
  <div :class="rowClasses" :style="rowStyle">
    <slot />
  </div>
</template>
