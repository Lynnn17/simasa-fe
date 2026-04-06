<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts";

interface Props {
  type?: "line" | "area" | "bar" | "histogram" | "pie" | "donut" | "radialBar" | "rangeBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "radar" | "polarArea";
  series: any[];
  options?: any;
  height?: string | number;
  width?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "line",
  height: "100%",
  width: "100%",
  options: () => ({}),
});
</script>

<template>
  <ClientOnly>
    <VueApexCharts
      :type="type"
      :height="height"
      :width="width"
      :options="options"
      :series="series"
    />
    <template #fallback>
       <div class="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse">
         <div class="h-full w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
       </div>
    </template>
  </ClientOnly>
</template>
