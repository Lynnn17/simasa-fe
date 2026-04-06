<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import emblaCarouselVue from "embla-carousel-vue";

interface CarouselProps {
  opts?: any;
  plugins?: any[];
  orientation?: "horizontal" | "vertical";
  class?: string;
  itemClass?: string;
  items?: any[];
}

const props = withDefaults(defineProps<CarouselProps>(), {
  orientation: "horizontal",
  items: () => [],
});

const [emblaRef, emblaApi] = emblaCarouselVue(
  {
    ...props.opts,
    loop: true,
    axis: props.orientation === "horizontal" ? "x" : "y",
  },
  props.plugins,
);

const canScrollPrev = ref(true);
const canScrollNext = ref(true);

const onSelect = (api: any) => {
  canScrollPrev.value = true;
  canScrollNext.value = true;
};

const scrollPrev = () => emblaApi.value?.scrollPrev();
const scrollNext = () => emblaApi.value?.scrollNext();

onMounted(() => {
  if (!emblaApi.value) return;

  emblaApi.value.on("init", onSelect);
  emblaApi.value.on("reInit", onSelect);
  emblaApi.value.on("select", onSelect);

  onSelect(emblaApi.value);
});

watch(
  () => props.items,
  () => {
    setTimeout(() => {
      if (emblaApi.value) onSelect(emblaApi.value);
    }, 10);
  },
  { deep: true },
);
</script>

<template>
  <div
    class="flex items-center gap-3"
    :class="props.class"
    role="region"
    aria-roledescription="carousel"
    @keydown.left="scrollPrev"
    @keydown.right="scrollNext"
  >
    <!-- Previous Button -->
    <UiIconButton
      icon="mdi-arrow-left"
      tooltip="Sebelumnya"
      tooltipPosition="bottom"
      variant="ghost"
      rounded="full"
      size="sm"
      class="shrink-0 shadow-lg bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 border-0 transition-all duration-200 hover:scale-110"
      @click="scrollPrev"
    >
    </UiIconButton>

    <!-- Carousel Content -->
    <div ref="emblaRef" class="overflow-hidden rounded-lg flex-1">
      <div
        class="flex"
        :class="orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col'"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="min-w-0 shrink-0 grow-0"
          :class="[
            orientation === 'horizontal' ? 'pl-4' : 'pt-4',
            props.itemClass || 'basis-full',
          ]"
        >
          <slot :item="item" :index="index" />
        </div>
      </div>
    </div>

    <!-- Next Button -->
    <UiIconButton
      icon="mdi-arrow-right"
      tooltip="Berikutnya"
      tooltipPosition="bottom"
      variant="ghost"
      rounded="full"
      size="sm"
      class="shrink-0 shadow-lg bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 border-0 transition-all duration-200 hover:scale-110"
      @click="scrollNext"
    >
    </UiIconButton>
  </div>
</template>
