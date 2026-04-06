<template>
  <div class="flex flex-col gap-4">
    <!-- Slot: Filters (External) -->
    <slot name="filters" />

    <!-- Content Wrapper -->
    <component
      :is="title ? UiCard : 'div'"
      :padding="false"
      :class="[!title ? 'space-y-4' : '']"
    >
      <!-- Card Header -->
      <div v-if="title" class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div v-if="icon" class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <i :class="['mdi text-xl text-primary-600 dark:text-primary-400', icon]"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white">{{ title }}</h3>
            <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <slot name="header-actions" />
        </div>
      </div>
      
      <!-- Initial Loading State (Only if no items and NOT using overlay) -->
      <div v-if="showLoading && (!items || items.length === 0)" class="flex justify-center py-12">
        <UiSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="(!items || items.length === 0)" class="col-span-full text-center py-12">
        <slot name="empty">
          <div class="flex flex-col items-center">
            <i class="mdi mdi-database-off text-6xl text-slate-300 dark:text-slate-600"></i>
            <p class="mt-4 text-slate-500">{{ emptyMessage }}</p>
          </div>
        </slot>
      </div>

      <!-- Content Views (Slot) -->
      <div v-else class="relative min-h-[200px]">
        <!-- Loading Overlay -->
        <div v-if="showLoading" class="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center backdrop-blur-sm rounded-lg transition-all duration-200">
           <UiSpinner size="lg" />
        </div>

        <!-- Default Slot for Table / Cards -->
        <slot :items="items" />
      </div>

      <!-- Pagination -->
      <div 
        v-if="items && items.length > 0 && showPagination" 
        :class="[
          'flex flex-wrap items-center justify-between gap-4',
          title ? 'p-4 border-t border-slate-200 dark:border-slate-700' : 'mt-2'
        ]"
      >
        <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>{{ $t('Tampilkan') }}</span>
          <select
            :value="itemsPerPage"
            @change="onPageSizeChange"
            class="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
          <span>{{ $t('Dari') }} {{ totalItems }} {{ $t('data') }}</span>
        </div>

        <UiPagination
          :current-page="page"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          @update:current-page="onPageChange"
        />
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import UiCard from './Card.vue';
import { resolveComponent, ref, watch, onUnmounted } from 'vue';

interface Props {
  // Data
  items: any[]
  totalItems?: number
  loading?: boolean
  
  // Pagination
  page?: number
  itemsPerPage?: number
  showPagination?: boolean
  pageSizeOptions?: number[]
  
  // Text & UI
  emptyMessage?: string
  title?: string
  subtitle?: string
  icon?: string
  loadingDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  totalItems: 0,
  loading: false,
  page: 1,
  itemsPerPage: 10,
  showPagination: true,
  pageSizeOptions: () => [10, 20, 50, 100],
  emptyMessage: 'Data tidak ditemukan',
  title: '',
  subtitle: '',
  icon: '',
  loadingDelay: 300,
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:itemsPerPage', size: number): void
  (e: 'change', payload: { page: number; itemsPerPage: number }): void
}>()

// Delayed loading to prevent flash on fast responses (same as DataTable)
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

const onPageChange = (newPage: number) => {
  emit('update:page', newPage)
  emit('change', { page: newPage, itemsPerPage: props.itemsPerPage })
}

const onPageSizeChange = (event: Event) => {
  const newSize = Number((event.target as HTMLSelectElement).value)
  emit('update:itemsPerPage', newSize)
  emit('update:page', 1) // Reset to page 1
  emit('change', { page: 1, itemsPerPage: newSize })
}
</script>
