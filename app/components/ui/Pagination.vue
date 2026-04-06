<script setup lang="ts">
interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalItems: 0,
  itemsPerPage: 10,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage) || 1
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    pages.push(total)
  }
  
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1)
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Previous Button -->
    <button
      @click="prevPage"
      :disabled="currentPage <= 1"
      class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-800 dark:text-slate-200"
    >
      «
    </button>
    
    <!-- Page Numbers -->
    <template v-for="page in visiblePages" :key="page">
      <span 
        v-if="page === '...'" 
        class="px-2 py-1.5 text-sm text-slate-500"
      >
        ...
      </span>
      <button
        v-else
        @click="goToPage(page as number)"
        :class="[
          'px-3 py-1.5 text-sm rounded-lg transition-colors',
          currentPage === page
            ? 'bg-primary-500 text-white font-medium'
            : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
        ]"
      >
        {{ page }}
      </button>
    </template>
    
    <!-- Next Button -->
    <button
      @click="nextPage"
      :disabled="currentPage >= totalPages"
      class="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-800 dark:text-slate-200"
    >
      »
    </button>
  </div>
</template>
