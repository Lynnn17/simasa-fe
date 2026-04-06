<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  persistent: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "close": [];
}>();

const close = () => {
  if (props.persistent) return;
  emit("update:modelValue", false);
  emit("close");
};

// Force close (ignores persistent)
const forceClose = () => {
  emit("update:modelValue", false);
  emit("close");
};

// Expose close methods to parent
defineExpose({
  close: forceClose,
});

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  '2xl': "max-w-6xl",
  full: "max-w-[95vw]",
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] overflow-y-auto"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" @click="close" />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            appear
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              :class="[
                'relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl',
                sizeClasses[size],
              ]"
              @click.stop
            >
              <!-- Header -->
              <div
                v-if="title || $slots.header"
                class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"
              >
                <slot name="header">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                    {{ title }}
                  </h3>
                </slot>
                <button
                  class="p-2 -m-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  @click="forceClose"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="p-6">
                <slot />
              </div>

              <!-- Footer -->
              <div
                v-if="$slots.footer || $slots.actions"
                class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700"
              >
                <slot name="actions">
                  <slot name="footer" />
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

