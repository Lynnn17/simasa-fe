<template>
  <div 
    ref="triggerRef"
    class="inline-block"
    :class="containerClass"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />
  </div>
  
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="isVisible && text"
        ref="tooltipRef"
        :style="tooltipStyle"
        class="fixed px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg whitespace-nowrap z-[9999] pointer-events-none"
      >
        {{ text }}
        <!-- Arrow -->
        <div 
          :class="[
            'absolute w-2 h-2 bg-slate-800 rotate-45',
            arrowClass
          ]"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  text?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  position: 'bottom',
  containerClass: '',
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

const showTooltip = () => {
  if (!triggerRef.value) return
  updatePosition()
  isVisible.value = true
}

const hideTooltip = () => {
  isVisible.value = false
}

const updatePosition = () => {
  if (!triggerRef.value) return
  
  const rect = triggerRef.value.getBoundingClientRect()
  const gap = 8
  
  switch (props.position) {
    case 'top':
      tooltipPosition.value = {
        top: rect.top - gap,
        left: rect.left + rect.width / 2,
      }
      break
    case 'bottom':
      tooltipPosition.value = {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
      }
      break
    case 'left':
      tooltipPosition.value = {
        top: rect.top + rect.height / 2,
        left: rect.left - gap,
      }
      break
    case 'right':
      tooltipPosition.value = {
        top: rect.top + rect.height / 2,
        left: rect.right + gap,
      }
      break
  }
}

const tooltipStyle = computed(() => {
  const { top, left } = tooltipPosition.value
  
  let transform = ''
  switch (props.position) {
    case 'top':
      transform = 'translateX(-50%) translateY(-100%)'
      break
    case 'bottom':
      transform = 'translateX(-50%)'
      break
    case 'left':
      transform = 'translateX(-100%) translateY(-50%)'
      break
    case 'right':
      transform = 'translateY(-50%)'
      break
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`,
    transform,
  }
})

// Arrow position classes
const arrowClass = computed(() => {
  switch (props.position) {
    case 'top':
      return 'top-full left-1/2 -translate-x-1/2 -mt-1'
    case 'bottom':
      return 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
    case 'left':
      return 'left-full top-1/2 -translate-y-1/2 -ml-1'
    case 'right':
      return 'right-full top-1/2 -translate-y-1/2 -mr-1'
    default:
      return 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
  }
})
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.15s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
