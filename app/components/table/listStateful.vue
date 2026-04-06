<template>
  <div :class="['bg-white dark:bg-slate-800 rounded-sm overflow-hidden', elevationClass]">
    <!-- Header Bar -->
    <div v-if="showHeader" :class="['flex flex-wrap items-center justify-between gap-3 px-5 py-1', headerClass]">
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
      <div class="flex items-center gap-1">
        <template v-for="action in validActions(actionToolbars, {})" :key="action.key">
          <UiIconButton
            :icon="action.icon || 'mdi-help'"
            :tooltip="action.tooltip"
            :color="action.color"
            :loading="actionLoading[action.key]"
            variant="ghost"
            size="lg"
            @click="$emit(action.emit as any)"
          />
        </template>
        <UiIconButton
          icon="mdi-refresh"
          :tooltip="$t('Muat Ulang')"
          color="white"
          variant="ghost"
          size="lg"
          @click="handleRefreshItems"
        />
      </div>
    </div>

    <div :class="contentPadding">
      <!-- Filters -->
      <ClientOnly>
        <div v-if="filterSchema.length > 0" class="grid grid-cols-12 gap-4 mb-5">
          <template v-for="f in filterSchema" :key="f.name">
            <div 
              class="col-span-12"
              :style="{ 
                gridColumn: `span ${f.colMd || 2} / span ${f.colMd || 2}` 
              }"
              :class="{ 'md:col-span-2': !f.colMd }"
            > 
              <component
                :is="componentResolver(f.type)"
                v-model="filterLocal[f.name]"
                :field="f"
                :disabled="isDisabled(f)"
                :items="getList(f.items)"
                @apply="handleApplyFilterField(f)"
              >
                <template v-if="f.type === 'search' && addAction" #append>  
                  <UiIconButton
                    :icon="addAction.icon || 'mdi-plus'"
                    :tooltip="addAction.tooltip"
                    :color="addAction.color || 'primary'"
                    variant="ghost"
                    rounded="full"
                    size="xl"
                    @click="$emit(addAction.emit as any)"
                  />
                </template>

                <template v-if="f.type === 'custom' && f.slotKey" #default>
                  <slot :name="f.slotKey" />
                </template>
              </component>
            </div>
          </template>
        </div>
        <template #fallback>
          <div class="grid grid-cols-12 gap-4 mb-5">
            <div class="col-span-12 md:col-span-8"></div>
            <div class="col-span-12 md:col-span-4">
              <div class="h-10 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Table -->
      <UiDataTable
        :headers="headers"
        :items="tableData.items"
        :loading="loading"
        :show-actions="actions.length > 0"
        :start-number="numberInc"
        :sort-key="sortBy[0]?.key"
        :sort-order="sortBy[0]?.order"
        :get-row-class="getRowClass"
        :row-clickable="!!rowClick"
        @sort="handleDataTableSort"
        @row-click="handleRowClick"
      >
        <!-- Pass through all item.* slots (except actions) -->
        <template v-for="header in headers.filter(h => h.key !== 'actions')" :key="header.key" #[`item.${header.key}`]="slotProps">
          <slot :name="`item.${header.key}`" v-bind="slotProps">
            {{ header.formatter ? header.formatter(slotProps.value) : slotProps.value }}
          </slot>
        </template>

        <!-- Actions column -->
        <template v-if="actions.length > 0" #item.actions="{ item }">
          <div class="flex items-center justify-center gap-1.5">
            <template v-for="action in validActions(actions, item)" :key="action.key">
              <UiIconButton
                :icon="action.icon || 'mdi-help'"
                :tooltip="action.tooltip"
                :color="action.color"
                size="sm"
                rounded="md"
                @click="$emit(action.emit as any, item)"
              />
            </template>
          </div>
        </template>
      </UiDataTable>

      <!-- Pagination -->
      <div class="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div class="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
          <span>{{ $t('Tampilkan') }}</span>
          <select
            v-model="filterLocal.pageSize"
            @change="getItemPerPage(filterLocal.pageSize)"
            class="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option v-for="opt in itemsPerPageOptions" :key="opt.value" :value="opt.value">
              {{ opt.title }}
            </option>
          </select>
          <span>{{ $t('Dari') }} {{ tableData.meta.totalItems }} {{ $t('data') }}</span>
        </div>
        <UiPagination
          :current-page="Number(filterLocal.pageNumber) || 1"
          :total-items="tableData.meta.totalItems"
          :items-per-page="itemsPerPage"
          @update:current-page="handlePageChanged"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

// Types
interface Header {
  key: string
  title: string
  width?: string
  sortable?: boolean
  translate?: boolean
  formatter?: (value: any) => string
}

interface FilterField {
  name: string
  label?: string
  type: 'date' | 'autocomplete' | 'search' | 'select' | 'number' | 'text' | 'custom'
  items?: string
  valueKey?: string
  textKey?: string
  emits?: string
  colMd?: number
  disabled?: boolean | ((item: any) => boolean)
  default?: any
  resetOnSelect?: Record<string, any>
  slotKey?: string
  placeholder?: string
}

interface Action {
  key: string
  icon?: string
  color?: string
  tooltip?: string
  show?: (item: any) => boolean
  emit: string
  type?: 'default'
}

interface TableMeta {
  totalItems: number
  currentPage?: number
  pageSize?: number
}

interface TableData {
  items: any[]
  meta: TableMeta
}

interface Props {
  title?: string
  loading?: boolean
  showHeader?: boolean
  headers: Header[]
  tableData: TableData
  filterSchema?: FilterField[]
  actions?: Action[]
  actionToolbars?: Action[]
  filterList?: Record<string, any[]>
  actionLoading?: Record<string, boolean>
  rowClass?: (row: { item: any }) => Record<string, any>
  rowClick?: (item: any) => void
  defaultSortBy?: string
  defaultSortType?: 'asc' | 'desc'
  headerTheme?: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'slate' | 'primary'
  elevated?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  contentPadding?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
  showHeader: true,
  headers: () => [],
  tableData: () => ({ items: [], meta: { totalItems: 0 } }),
  filterSchema: () => [],
  actions: () => [],
  actionToolbars: () => [],
  filterList: () => ({}),
  actionLoading: () => ({}),
  defaultSortBy: '',
  defaultSortType: 'desc',
  headerTheme: 'primary',
  elevated: 'sm',
  contentPadding: 'p-6',
})

// Header theme classes
const headerThemeClasses: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  slate: 'bg-slate-500',
  primary: 'bg-primary-500',
}

const headerClass = computed(() => {
  return headerThemeClasses[props.headerTheme] || headerThemeClasses.primary
})

// Elevation (shadow) classes
const elevationClasses: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

const elevationClass = computed(() => {
  return elevationClasses[props.elevated] || ''
})

const emit = defineEmits<{
  (e: 'fetchData'): void
  (e: 'filterChange', filter: Record<string, any>): void
  (e: 'addItem'): void
  (e: 'editItem', item: any): void
  (e: 'deleteItem', item: any): void
  (e: string, ...args: any[]): void
}>()

// State
const itemsPerPage = ref(10)
const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 20, title: '20' },
  { value: 40, title: '40' },
  { value: 50, title: '50' },
]
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>([
  { key: props.defaultSortBy, order: props.defaultSortType }
])
const filterLocal = ref<Record<string, any>>({})

// Computed
const numberInc = computed(() => {
  const number = parseInt(String(filterLocal.value.pageNumber - 1)) * itemsPerPage.value || 0
  return number
})

const addAction = computed(() => {
  return props.actionToolbars?.find((a) => a.type === 'default' && a.show?.({}) !== false)
})

// Methods
const validActions = (arr: Action[], item: any) => {
  return arr.filter((a) => {
    if (a.type === 'default') return false
    if (typeof a.show === 'function') return a.show(item)
    return true
  })
}

const resetFilterFromSchema = () => {
  const base: Record<string, any> = {
    q: '',
    pageSize: itemsPerPage.value,
    pageNumber: 1,
    sortBy: props.defaultSortBy,
    sortType: props.defaultSortType,
    t: Date.now(),
  }
  
  props.filterSchema.forEach((f) => {
    if (!f?.name) return
    base[f.name] = f.hasOwnProperty('default')
      ? f.default
      : f.type === 'date'
        ? new Date().toISOString().substring(0, 10)
        : null
  })
  
  filterLocal.value = base
}

const componentResolver = (type: string) => {
  switch (type) {
    case 'date':
      return resolveComponent('TableFilterDate')
    case 'autocomplete':
      return resolveComponent('TableFilterAutocomplete')
    case 'search':
      return resolveComponent('TableFilterSearch')
    case 'select':
      return resolveComponent('TableFilterSelect')
    case 'number':
      return resolveComponent('TableFilterNumber')
    case 'text':
    default:
      return resolveComponent('TableFilterText')
  }
}

const isDisabled = (field: FilterField) => {
  if (typeof field.disabled === 'function') {
    return field.disabled(filterLocal.value)
  }
  return !!field.disabled
}

// Trigger filter change via emit instead of router.replace
const triggerFilterChange = () => {
  emit('filterChange', { ...filterLocal.value })
  emit('fetchData')
}

const handleApplyFilterField = (field: FilterField) => {
  if (field.resetOnSelect && typeof field.resetOnSelect === 'object') {
    Object.keys(field.resetOnSelect).forEach((k) => {
      filterLocal.value[k] = field.resetOnSelect![k]
    })
  }

  if (field.emits) {
    emit(field.emits as any, { [field.name]: filterLocal.value[field.name] })
  }

  filterLocal.value.pageNumber = 1
  filterLocal.value.t = Date.now()
  triggerFilterChange()
}

const handleRefreshItems = () => {
  filterLocal.value.q = ''
  filterLocal.value.pageNumber = 1
  filterLocal.value.t = Date.now()
  triggerFilterChange()
}

const handlePageChanged = (page: number) => {
  filterLocal.value.pageNumber = page
  triggerFilterChange()
}

const getItemPerPage = (val: number) => {
  itemsPerPage.value = +val
  filterLocal.value.pageSize = itemsPerPage.value
  triggerFilterChange()
}

// Handle sort from UiDataTable component
const handleDataTableSort = (payload: { key: string; order: 'asc' | 'desc' }) => {
  sortBy.value = [{ key: payload.key, order: payload.order }]
  filterLocal.value.sortBy = payload.key
  filterLocal.value.sortType = payload.order
  triggerFilterChange()
}

const getList = (name?: string) => {
  if (!name) return []
  const listRef = props.filterList[name]
  return Array.isArray(listRef) ? listRef : []
}

const getRowClass = (context: { item: any; index: number }): string => {
  const classes: string[] = []
  const isClickable = typeof props.rowClick === 'function'
  
  // Add hover styles
  classes.push('hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors')
  
  // Add clickable cursor
  if (isClickable) {
    classes.push('cursor-pointer')
  }
  
  // Add custom row classes from props
  if (props.rowClass) {
    const customClass = props.rowClass(context)
    if (typeof customClass === 'string') {
      classes.push(customClass)
    }
  }
  
  return classes.join(' ')
}

const handleRowClick = (item: any) => {
  if (typeof props.rowClick === 'function') {
    props.rowClick(item)
  }
}

// Expose filter for parent access
const getFilter = () => ({ ...filterLocal.value })
const setFilter = (newFilter: Record<string, any>) => {
  Object.assign(filterLocal.value, newFilter)
}

defineExpose({
  getFilter,
  setFilter,
  refresh: handleRefreshItems,
})

// Watchers
watch(() => props.filterSchema, () => {
  resetFilterFromSchema()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  resetFilterFromSchema()
  // Trigger initial fetch
  nextTick(() => {
    triggerFilterChange()
  })
})
</script>
