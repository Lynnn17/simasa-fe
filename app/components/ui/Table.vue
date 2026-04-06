<script setup lang="ts">
/**
 * UiTable - Enhanced table component with Vuetify-like features
 * 
 * Features:
 * - Size variants (sm, md, lg)
 * - Border modes (bordered, borderless, outlined)
 * - Border radius options
 * - Fixed header support
 * - Column width and alignment
 * - Row color/class support
 * - Loading state
 * - Empty state
 */

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
}

interface Props {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  loadingRows?: number;
  loadingDelay?: number;
  emptyMessage?: string;
  // Size variants
  size?: 'sm' | 'md' | 'lg';
  // Border modes
  bordered?: boolean;
  borderless?: boolean;
  outlined?: boolean;
  // Border radius
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  // Fixed header
  fixedHeader?: boolean;
  maxHeight?: string;
  // Row options
  hover?: boolean;
  striped?: boolean;
  rowClass?: string | ((row: Record<string, unknown>, index: number) => string);
  // Clickable
  clickable?: boolean;
  // Sorting
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  // Selection
  selectable?: boolean;
  modelValue?: any[];
  itemKey?: string;
  disabledKeys?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingRows: 5,
  loadingDelay: 300,
  emptyMessage: 'Data tidak ditemukan',
  size: 'md',
  bordered: false,
  borderless: false,
  outlined: true,
  rounded: 'lg',
  fixedHeader: false,
  maxHeight: '400px',
  hover: true,
  striped: false,
  clickable: false,
  sortKey: '',
  sortOrder: 'desc',
  selectable: false,
  modelValue: () => [],
  itemKey: 'id',
  disabledKeys: () => [],
});

const emit = defineEmits<{
  rowClick: [row: Record<string, unknown>, index: number];
  sort: [payload: { key: string; order: 'asc' | 'desc' }];
  'update:modelValue': [value: any[]];
}>();

// Loading Delay Logic
const showLoading = ref(false);
let loadingTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => props.loading, (isLoading) => {
  if (isLoading) {
    loadingTimer = setTimeout(() => {
      showLoading.value = true;
    }, props.loadingDelay);
  } else {
    if (loadingTimer) clearTimeout(loadingTimer);
    showLoading.value = false;
  }
}, { immediate: true });

// Cleanup timer on unmount
onUnmounted(() => {
  if (loadingTimer) clearTimeout(loadingTimer);
});


// Selection Logic
const selectedIds = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const allSelected = computed(() => {
  if (props.data.length === 0) return false;
  return props.data.every(item => selectedIds.value.includes(item[props.itemKey] as any));
});

const partialSelected = computed(() => {
  if (props.data.length === 0) return false;
  const count = props.data.filter(item => selectedIds.value.includes(item[props.itemKey] as any)).length;
  return count > 0 && count < props.data.length;
});

const toggleSelectAll = (e: Event) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  let newSelected = [...selectedIds.value];
  
  if (isChecked) {
    // Add all current page items that aren't already selected AND not disabled
    props.data.forEach(item => {
      const id = item[props.itemKey] as any;
      if (!newSelected.includes(id) && !props.disabledKeys.includes(id)) {
        newSelected.push(id);
      }
    });
  } else {
    // Remove all current page items (except disabled ones if they were somehow selected? usually unlikely but good generic logic might keep them? 
    // Standard behavior: Unselect all on page.
    // If disabled items are checked (pre-selected disabled), should we uncheck them?
    // Usually "disabled" means "cannot change state". So if checked & disabled, stay checked. If unchecked & disabled, stay unchecked.
    
    const pageIdsToCheck = props.data
        .filter(item => !props.disabledKeys.includes(item[props.itemKey] as any)) // Only touch enabled items
        .map(item => item[props.itemKey] as any);

    newSelected = newSelected.filter(id => !pageIdsToCheck.includes(id));
  }
  
  emit('update:modelValue', newSelected);
};

const toggleSelectRow = (item: any) => {
  const id = item[props.itemKey];
  if (props.disabledKeys.includes(id)) return;

  const index = selectedIds.value.indexOf(id);
  const newSelected = [...selectedIds.value];
  
  if (index === -1) {
    newSelected.push(id);
  } else {
    newSelected.splice(index, 1);
  }
  
  emit('update:modelValue', newSelected);
};

// Handle sort click
const handleSortClick = (column: Column) => {
  if (!column.sortable) return;
  
  const newOrder = props.sortKey === column.key && props.sortOrder === 'asc' ? 'desc' : 'asc';
  emit('sort', { key: column.key, order: newOrder });
};

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: { cell: 'px-3 py-2 text-xs', header: 'px-3 py-2 text-xs' },
    md: { cell: 'px-4 py-3 text-sm', header: 'px-4 py-3 text-sm' },
    lg: { cell: 'px-6 py-4 text-base', header: 'px-6 py-4 text-base' },
  };
  return sizes[props.size];
});

// Border radius classes
const roundedClasses = computed(() => {
  const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-2xl',
  };
  return radiusMap[props.rounded];
});

// Container classes
const containerClasses = computed(() => {
  const classes = ['overflow-hidden', roundedClasses.value];
  
  if (props.outlined && !props.borderless) {
    classes.push('border border-slate-200 dark:border-slate-700');
  }
  
  return classes;
});

// Wrapper classes (for fixed header)
const wrapperClasses = computed(() => {
  const classes = ['overflow-x-auto'];
  
  if (props.fixedHeader) {
    classes.push('overflow-y-auto');
  }
  
  return classes;
});

// Wrapper styles
const wrapperStyles = computed(() => {
  if (props.fixedHeader) {
    return { maxHeight: props.maxHeight };
  }
  return {};
});

// Header classes
const getHeaderClasses = (column: Column) => {
  const classes = [
    sizeClasses.value.header,
    'font-semibold text-slate-800 dark:text-slate-200 tracking-wider',
  ];
  
  // Alignment
  const align = column.headerAlign || column.align || 'left';
  classes.push(`text-${align}`);
  
  // Fixed header
  if (props.fixedHeader) {
    classes.push('sticky top-0 bg-slate-50 dark:bg-slate-800/50 z-10');
  }
  
  // Borders
  if (props.bordered && !props.borderless) {
    classes.push('border-r border-slate-200 dark:border-slate-700 last:border-r-0');
  }
  
  return classes;
};

// Cell classes
const getCellClasses = (column: Column) => {
  const classes = [
    sizeClasses.value.cell,
    'text-slate-800 dark:text-slate-200',
  ];
  
  // Alignment
  const align = column.align || 'left';
  classes.push(`text-${align}`);
  
  // Borders
  if (props.bordered && !props.borderless) {
    classes.push('border-r border-slate-200 dark:border-slate-700 last:border-r-0');
  }
  
  return classes;
};

// Row classes
const getRowClasses = (row: Record<string, unknown>, index: number) => {
  const classes = ['transition-colors'];
  
  // Hover
  if (props.hover) {
    classes.push('hover:bg-slate-50 dark:hover:bg-slate-700/50');
  }
  
  // Striped
  if (props.striped && index % 2 === 1) {
    classes.push('bg-slate-50/50 dark:bg-slate-800/50');
  }
  
  // Clickable
  if (props.clickable) {
    classes.push('cursor-pointer');
  }
  
  // Selected
  if (props.selectable && selectedIds.value.includes(row[props.itemKey] as any)) {
      classes.push('bg-primary-50 dark:bg-primary-900/10');
  }
  
  // Custom row class
  if (props.rowClass) {
    if (typeof props.rowClass === 'function') {
      classes.push(props.rowClass(row, index));
    } else {
      classes.push(props.rowClass);
    }
  }
  
  return classes;
};

// Handle row click
const handleRowClick = (row: Record<string, unknown>, index: number) => {
  if (props.selectable) {
    // If selectable, row click toggles selection unless specific logic desired?
    // Usually clicking checkbox toggles, row click might do something else (like view detail).
    // Avoiding conflict: rowClick emit only if specific clickable prop is true.
    // If user wants row click to select, they can handle @row-click.
  }
  
  if (props.clickable) {
    emit('rowClick', row, index);
  }
};
</script>

<template>
  <div :class="containerClasses">
    <div :class="wrapperClasses" :style="wrapperStyles">
      <table class="w-full">
        <thead>
          <tr :class="[
            'bg-slate-50 dark:bg-slate-800/50',
            !borderless ? 'border-b border-slate-200 dark:border-slate-700' : ''
          ]">
            <th v-if="selectable" class="w-12 text-center" :class="getHeaderClasses({} as any)">
              <input 
                type="checkbox" 
                :checked="allSelected"
                :indeterminate="partialSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: column.width }"
              :class="[
                getHeaderClasses(column),
                column.sortable ? 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700/50' : ''
              ]"
              @click="handleSortClick(column)"
            >
              <div class="flex items-center gap-1.5" :class="{ 'justify-center': column.headerAlign === 'center' || column.align === 'center' }">
                <slot :name="`header-${column.key}`" :column="column">
                  {{ column.label }}
                </slot>
                
                <span v-if="column.sortable" class="flex flex-col text-base leading-none">
                  <i 
                    class="mdi mdi-chevron-up font-bold" 
                    :class="sortKey === column.key && sortOrder === 'asc' ? 'text-primary-500' : 'text-slate-500 dark:text-slate-500'"
                  />
                  <i 
                    class="mdi mdi-chevron-down -mt-1.5 font-bold" 
                    :class="sortKey === column.key && sortOrder === 'desc' ? 'text-primary-500' : 'text-slate-500 dark:text-slate-500'"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody :class="[
          'bg-white dark:bg-slate-800 transition-all duration-200',
          !borderless ? 'divide-y divide-slate-200 dark:divide-slate-700' : '',
          showLoading && data.length > 0 ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''
        ]">
          <!-- Loading State -->
          <!-- Loading State (Only if no data) -->
          <template v-if="showLoading && data.length === 0">
            <tr v-for="i in loadingRows" :key="`loading-${i}`">
              <td v-if="selectable" :class="getCellClasses({} as any)">
                <div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
              </td>
              <td 
                v-for="column in columns" 
                :key="column.key" 
                :class="getCellClasses(column)"
              >
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <template v-else-if="data.length === 0">
            <tr>
              <td 
                :colspan="columns.length + (selectable ? 1 : 0)" 
                :class="[sizeClasses.cell, 'text-center text-slate-500 dark:text-slate-400 py-12']"
              >
                <slot name="empty">
                  <div class="flex flex-col items-center gap-2">
                    <i class="mdi mdi-database-off text-3xl opacity-50" />
                    <span>{{ emptyMessage }}</span>
                  </div>
                </slot>
              </td>
            </tr>
          </template>

          <!-- Data Rows -->
          <template v-else>
            <tr
              v-for="(row, index) in data"
              :key="index"
              :class="getRowClasses(row, index)"
              @click="handleRowClick(row, index)"
            >
              <td v-if="selectable" class="text-center" :class="getCellClasses({} as any)" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="selectedIds.includes(row[itemKey])"
                  :disabled="disabledKeys.includes(row[itemKey])"
                  @change="toggleSelectRow(row)"
                  class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                :class="getCellClasses(column)"
              >
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="index">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
