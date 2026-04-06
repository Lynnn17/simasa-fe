<script setup lang="ts">
interface DropdownItem {
  label: string;
  value?: string;
  icon?: string;
  divider?: boolean;
  danger?: boolean;
}

interface Props {
  items: DropdownItem[];
  align?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
  align: "right",
});

const emit = defineEmits<{
  select: [item: DropdownItem];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const selectItem = (item: DropdownItem) => {
  if (item.divider) return;
  emit("select", item);
  close();
};

// Close on click outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      close();
    }
  };
  document.addEventListener("click", handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" />
    </div>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute z-50 mt-2 min-w-[180px] py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700',
          align === 'right' ? 'right-0' : 'left-0',
        ]"
      >
        <template v-for="(item, index) in items" :key="index">
          <div v-if="item.divider" class="my-2 border-t border-slate-200 dark:border-slate-700" />
          <button
            v-else
            :class="[
              'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
              item.danger
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
            ]"
            @click="selectItem(item)"
          >
            <slot name="item" :item="item">
              {{ item.label }}
            </slot>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>
