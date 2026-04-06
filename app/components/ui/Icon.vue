<template>
  <i 
    v-if="type === 'mdi'"
    :class="['mdi', name, sizeClass]"
    :style="colorStyle"
  />
  <component
    v-else-if="type === 'tabler' && tablerComponent"
    :is="tablerComponent"
    :size="iconSize"
    :style="colorStyle"
    :stroke-width="strokeWidth"
  />
  <span v-else :class="sizeClass" :style="colorStyle">
    {{ name }}
  </span>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef, watch } from 'vue'
import * as TablerIcons from '@tabler/icons-vue'

interface Props {
  name: string           // e.g., "mdi-home" or "IconHome" for tabler
  type?: 'mdi' | 'tabler'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: string
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'mdi',
  size: 'md',
  strokeWidth: 2,
  color: ''
})

// Size mapping for MDI icons (font-based)
const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }
  return sizes[props.size] || 'text-base'
})

// Size mapping for Tabler icons (SVG-based, uses pixels)
const iconSize = computed(() => {
  const sizes: Record<string, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
  }
  return sizes[props.size] || 20
})

// Color style
const colorStyle = computed(() => {
  if (!props.color) return {}
  
  // Semantic color mapping
  const colorMap: Record<string, string> = {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    danger: '#ef4444',
    info: '#06b6d4',
    white: '#ffffff',
    black: '#000000',
  }
  
  const colorValue = colorMap[props.color] || props.color
  return { color: colorValue }
})

// Normalize icon name from database format to Tabler format
// e.g., "ChartDotsIcon" -> "IconChartDots", "PointIcon" -> "IconPoint"
const normalizeIconName = (name: string): string => {
  if (!name) return ''
  
  // If already starts with "Icon", return as-is
  if (name.startsWith('Icon')) {
    return name
  }
  
  // If ends with "Icon", convert: "ChartDotsIcon" -> "IconChartDots"
  if (name.endsWith('Icon')) {
    const baseName = name.slice(0, -4) // Remove "Icon" suffix
    return 'Icon' + baseName
  }
  
  // Otherwise, just prepend "Icon": "home" -> "IconHome"
  return 'Icon' + name.charAt(0).toUpperCase() + name.slice(1)
}

// Tabler icon component 
const tablerComponent = computed(() => {
  if (props.type !== 'tabler') return null
  
  const icons = TablerIcons as Record<string, any>
  const normalizedName = normalizeIconName(props.name)
  return icons[normalizedName] || icons[props.name] || null
})
</script>
