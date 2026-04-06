<template>
  <div class="overflow-x-auto border border-slate-200 dark:border-slate-700">
    <table class="w-full">
      <thead>
        <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <!-- Row Number Column -->
          <th 
            v-if="showNumber"
            class="px-4 py-3 text-center text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider w-16 border-r border-slate-200 dark:border-slate-700"
          >
            No.
          </th>
          
          <!-- Data Columns -->
          <th
            v-for="header in headers"
            :key="header.key"
            :style="{ width: header.width }"
            :class="[
              'px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider border-r border-slate-200 dark:border-slate-700',
              header.sortable ? 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 select-none' : '',
              (header.alignHeader || header.align) === 'center' ? 'text-center' : (header.alignHeader || header.align) === 'right' ? 'text-right' : 'text-left'
            ]"
            @click="header.sortable && handleSort(header.key)"
          >
            <div :class="[
              'flex items-center gap-1',
              (header.alignHeader || header.align) === 'center' ? 'justify-center' : (header.alignHeader || header.align) === 'right' ? 'justify-end' : ''
            ]">
              {{ header.title }}
              <template v-if="header.sortable">
                <UiIcon 
                  v-if="currentSort?.key === header.key" 
                  :name="currentSort?.order === 'asc' ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  size="md"
                  class="opacity-70"
                />
                <UiIcon v-else name="mdi-unfold-more-horizontal" size="md" class="opacity-70" />
              </template>
            </div>
          </th>
        </tr>
      </thead>
      
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
        <!-- Loading State -->
        <template v-if="showLoading">
          <tr v-for="i in loadingRows" :key="`loading-${i}`">
            <td v-if="showNumber" class="px-4 py-4 border-r border-slate-200 dark:border-slate-700">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-8" />
            </td>
            <td v-for="header in headers" :key="header.key" class="px-4 py-4 border-r border-slate-200 dark:border-slate-700">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </td>
          </tr>
        </template>

        <!-- Empty State -->
        <tr v-else-if="items.length === 0">
          <td 
            :colspan="headers.length + (showNumber ? 1 : 0)" 
            class="px-4 py-4 text-center text-slate-500 dark:text-slate-400"
          >
            <slot name="empty">
              <div class="flex justify-center items-center gap-2">
                <UiIcon name="mdi-database-off" size="2xl" class="opacity-50" />
                <span>{{ emptyText }}</span>
              </div>
            </slot>
          </td>
        </tr>

        <!-- Data Rows -->
        <tr
          v-else
          v-for="(item, index) in items"
          :key="item[rowKey] || index"
          :class="[
            'transition-colors',
            rowClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : '',
            getRowClass ? getRowClass({ item, index }) : ''
          ]"
          @click="handleRowClick(item)"
        >
          <!-- Row Number -->
          <td 
            v-if="showNumber"
            class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center"
          >
            {{ startNumber + index + 1 }}.
          </td>
          
          <!-- Data Cells -->
          <td
            v-for="header in headers"
            :key="header.key"
            :class="[
              'px-4 py-3 text-sm text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700',
              header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : 'text-left'
            ]"
          >
            <slot :name="`item.${header.key}`" :item="item" :value="item[header.key]" :index="index">
              {{ header.formatter ? header.formatter(item[header.key], item) : item[header.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'

// Types
interface Header {
  key: string
  title: string
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  alignHeader?: 'left' | 'center' | 'right'
  formatter?: (value: any, item: any) => string
}

interface Props {
  headers: Header[]
  items: any[]
  loading?: boolean
  loadingRows?: number
  loadingDelay?: number
  showNumber?: boolean
  startNumber?: number
  rowKey?: string
  rowClickable?: boolean
  emptyText?: string
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  getRowClass?: (context: { item: any; index: number }) => string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingRows: 5,
  loadingDelay: 300,
  showNumber: true,
  startNumber: 0,
  rowKey: 'id',
  rowClickable: false,
  emptyText: 'Data tidak ditemukan',
  sortKey: '',
  sortOrder: 'desc',
})

// Delayed loading to prevent flash on fast responses
const showLoading = ref(false)
let loadingTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.loading, (isLoading) => {
  if (isLoading) {
    loadingTimer = setTimeout(() => {
      showLoading.value = true
    }, props.loadingDelay)
  } else {
    if (loadingTimer) clearTimeout(loadingTimer)
    showLoading.value = false
  }
}, { immediate: true })

// Cleanup timer on unmount
onUnmounted(() => {
  if (loadingTimer) clearTimeout(loadingTimer)
})

const emit = defineEmits<{
  action: [payload: { action: string; item: any }]
  rowClick: [item: any]
  sort: [payload: { key: string; order: 'asc' | 'desc' }]
}>()

// Current sort state
const currentSort = computed(() => {
  if (!props.sortKey) return null
  return { key: props.sortKey, order: props.sortOrder }
})

// Handle sort click
const handleSort = (key: string) => {
  const newOrder = props.sortKey === key && props.sortOrder === 'desc' ? 'asc' : 'desc'
  emit('sort', { key, order: newOrder })
}

// Handle row click
const handleRowClick = (item: any) => {
  if (props.rowClickable) {
    emit('rowClick', item)
  }
}

</script>
