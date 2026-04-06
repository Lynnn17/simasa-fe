<script setup lang="ts">
interface Props {
  color?: string
  variant?: 'filled' | 'ghost' | 'outline' | 'elevated'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'elevated',
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
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-3.5 text-base',
}

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
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    sizeClasses[props.size],
    roundedClasses[props.rounded],
    props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ]
  
  switch (props.variant) {
    case 'filled':
      base.push('text-white hover:opacity-90 active:scale-[0.98]')
      break
    case 'elevated':
      base.push('text-white shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.98] active:shadow-md')
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

<template>
  <button
    :type="type"
    :style="buttonStyle"
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>
