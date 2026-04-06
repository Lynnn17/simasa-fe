<script setup lang="ts">
/**
 * UiCol - Grid column using flex-basis (12-column system)
 */
interface Props {
  cols?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  cols: 12,
});

// Inject gap from parent UiRow
const rowGap = inject<Ref<number>>('rowGap', ref(16));

// Convert to number
const toNum = (val: number | string | undefined): number => {
  if (val === undefined) return 12;
  const n = Number(val);
  return isNaN(n) ? 12 : n;
};

// Calculate flex-basis percentage
const getPercent = (span: number): string => {
  return `${(span / 12) * 100}%`;
};

const baseWidth = computed(() => getPercent(toNum(props.cols)));
const smWidth = computed(() => props.sm ? getPercent(toNum(props.sm)) : null);
const mdWidth = computed(() => props.md ? getPercent(toNum(props.md)) : null);
const lgWidth = computed(() => props.lg ? getPercent(toNum(props.lg)) : null);
const xlWidth = computed(() => props.xl ? getPercent(toNum(props.xl)) : null);

const colStyle = computed(() => ({
  '--base-width': baseWidth.value,
  '--sm-width': smWidth.value || baseWidth.value,
  '--md-width': mdWidth.value || smWidth.value || baseWidth.value,
  '--lg-width': lgWidth.value || mdWidth.value || smWidth.value || baseWidth.value,
  '--xl-width': xlWidth.value || lgWidth.value || mdWidth.value || smWidth.value || baseWidth.value,
  '--col-gap': `${rowGap.value}px`,
}));
</script>

<template>
  <div class="ui-col" :style="colStyle">
    <slot />
  </div>
</template>

<style>
.ui-col {
  flex: 0 0 var(--base-width);
  max-width: var(--base-width);
  box-sizing: border-box;
  padding: 0 calc(var(--col-gap, 16px) / 2);
  margin-bottom: var(--col-gap, 16px);
}

@media (min-width: 640px) {
  .ui-col {
    flex: 0 0 var(--sm-width);
    max-width: var(--sm-width);
  }
}

@media (min-width: 768px) {
  .ui-col {
    flex: 0 0 var(--md-width);
    max-width: var(--md-width);
  }
}

@media (min-width: 1024px) {
  .ui-col {
    flex: 0 0 var(--lg-width);
    max-width: var(--lg-width);
  }
}

@media (min-width: 1280px) {
  .ui-col {
    flex: 0 0 var(--xl-width);
    max-width: var(--xl-width);
  }
}
</style>
