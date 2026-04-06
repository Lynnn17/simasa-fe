<template>
  <UiTooltip :text="tooltip" :position="tooltipPosition">
    <button
      :type="type"
      :style="buttonStyle"
      :class="buttonClass"
      :disabled="disabled || loading"
      @click="handleClick"
    >
      <svg v-if="loading" class="animate-spin" :class="iconSizeClass" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <UiIcon v-else :name="icon" :size="iconSize" />
    </button>
  </UiTooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  color?: string
  variant?: 'filled' | 'ghost' | 'outline' | 'elevated'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  tooltip: '',
  tooltipPosition: 'bottom',
  color: 'primary',
  variant: 'filled',
  size: 'md',
  rounded: 'lg',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Color mapping
const colorMap: Record<string, string> = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  danger: '#ef4444',
  info: '#06b6d4',
  white: '#ffffff',
  black: '#1e293b',
}

// Get color value
const getColor = (color: string): string => {
  if (color.startsWith('#') || color.startsWith('rgb')) return color
  return colorMap[color] || color
}

// Button size classes
const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-11 h-11',
}

// Icon size mapping
const iconSizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
  xs: 'sm',
  sm: 'md',
  md: 'lg',
  lg: 'xl',
  xl: '2xl',
}

const iconSize = computed(() => iconSizeMap[props.size] || 'md')

const iconSizeClass = computed(() => {
  const classes: Record<string, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }
  return classes[props.size] || 'w-4 h-4'
})

// Rounded classes
const roundedClasses: Record<string, string> = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

// Button style (for filled/elevated variant)
const buttonStyle = computed(() => {
  if (props.variant === 'filled' || props.variant === 'elevated') {
    return { backgroundColor: getColor(props.color) }
  }
  if (props.variant === 'outline') {
    return { 
      borderColor: getColor(props.color),
      color: getColor(props.color),
    }
  }
  // ghost variant
  return { color: getColor(props.color) }
})

// Button classes
const buttonClass = computed(() => {
  const base = [
    'flex items-center justify-center transition-colors',
    sizeClasses[props.size],
    roundedClasses[props.rounded],
    props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ]
  
  switch (props.variant) {
    case 'filled':
      base.push('text-white hover:opacity-80')
      break
    case 'elevated':
      base.push('text-white shadow-lg hover:shadow-xl hover:opacity-80 active:shadow-md')
      break
    case 'outline':
      base.push('border-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10')
      break
    case 'ghost':
      base.push('bg-transparent hover:bg-black/10 dark:hover:bg-white/10')
      break
  }
  
  return base
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
