<script setup lang="ts">
/**
 * UiTabs - Reusable tabs component
 * 
 * Usage:
 * <UiTabs v-model="activeTab" :tabs="tabs">
 *   <template #tab-id1>Content for tab1</template>
 *   <template #tab-id2>Content for tab2</template>
 * </UiTabs>
 */
interface Tab {
  id: string;
  name: string;
  icon?: string;
  disabled?: boolean;
}

interface Props {
  modelValue: string;
  tabs: Tab[];
  variant?: 'underline' | 'pills' | 'boxed';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "change": [tab: Tab];
}>();

const activeTab = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const selectTab = (tab: Tab) => {
  if (tab.disabled) return;
  activeTab.value = tab.id;
  emit('change', tab);
};

// Variant styles
const getTabClasses = (tab: Tab) => {
  const isActive = activeTab.value === tab.id;
  
  if (props.variant === 'underline') {
    return [
      'py-3 px-1 border-b-2 text-sm font-medium transition-colors',
      isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
      tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ];
  }
  
  if (props.variant === 'pills') {
    return [
      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-600 text-white'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
      tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ];
  }
  
  if (props.variant === 'boxed') {
    return [
      'px-4 py-2 border text-sm font-medium transition-colors -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg',
      isActive
        ? 'bg-primary-600 text-white border-primary-600 z-10'
        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
      tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ];
  }
  
  return [];
};

const containerClasses = computed(() => {
  if (props.variant === 'underline') {
    return 'px-3 border-b border-slate-200 dark:border-slate-700';
  }
  return '';
});

const navClasses = computed(() => {
  if (props.variant === 'underline') return 'flex gap-6';
  if (props.variant === 'pills') return 'flex gap-2';
  if (props.variant === 'boxed') return 'inline-flex';
  return 'flex gap-4';
});
</script>

<template>
  <div>
    <!-- Tab Headers -->
    <div :class="containerClasses" class="mb-5">
      <nav :class="navClasses">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="selectTab(tab)"
          :class="getTabClasses(tab)"
          :disabled="tab.disabled"
        >
          <slot :name="`header-${tab.id}`" :tab="tab">
            <span class="flex items-center gap-2">
              <i v-if="tab.icon" :class="['mdi', tab.icon]"></i>
              {{ tab.name }}
            </span>
          </slot>
        </button>
      </nav>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      <template v-for="tab in tabs" :key="tab.id">
        <div v-show="activeTab === tab.id">
          <slot :name="tab.id"></slot>
        </div>
      </template>
    </div>
  </div>
</template>
