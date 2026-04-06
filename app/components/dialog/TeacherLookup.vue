<template>
  <UiModal 
    v-model="isOpen" 
    :title="dialogTitle" 
    size="2xl"
  >
    <TableListStateful
      ref="tableRef"
      :title="dialogTitle"
      :show-header="false"
      defaultSortBy="name"
      defaultSortType="asc"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :filterList="{ listInstitution }"
      :row-click="handleSelect"
      elevated="none"
      contentPadding="p-0"
      @fetchData="loadData"
      @filterChange="onFilterChange"
    />
    
    <template #footer>
      <UiButton color="secondary" @click="handleClose">
        {{ $t('Batal') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
// import teacherService from '@/services/teacher.service'

interface Teacher {
  id: number
  teacherNo: string
  name: string
  email?: string
  noTelp?: string
  institutionId?: number
  institutionName?: string
  entryYear?: number
  isActive?: boolean
}

interface Props {
  modelValue: boolean
  institutionId?: number | null
  listInstitution?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  institutionId: null,
  listInstitution: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', teacher: Teacher): void
}>()

const { t } = useTranslation()

// const teacherSvc = teacherService()
const { getPlaceholder, getTitle } = useFormText()

// State
const tableRef = ref()
const isLoading = ref(false)
const dialogTitle = computed(() => {
  return getTitle("select", "Guru");
});
const currentFilter = ref<Record<string, any>>({})
const tableData = ref<{
  items: Teacher[]
  meta: { totalItems: number }
}>({
  items: [],
  meta: { totalItems: 0 },
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const headers = computed(() => [
  { key: 'teacherNo', title: t('No. ID'), sortable: true, width: '15%' },
  { key: 'name', title: t('Nama'), sortable: true },
  { key: 'email', title: t('Email'), sortable: true },
  { key: 'institutionName', title: t('Institusi'), sortable: true },
])

const filterSchema = computed(() => [
    { 
    name: 'institutionId', 
    type: 'autocomplete' as const, 
    items: 'listInstitution', 
    placeholder: getPlaceholder('select', 'Institusi'), 
    colMd: 4,
    valueKey: 'id',
    textKey: 'name',
    default: props.institutionId,
    disabled: !!props.institutionId,
  },
  { name: '', type: 'text' as const, colMd: 4 },
  { 
    name: 'q', 
    type: 'search' as const, 
    placeholder: t('Cari (Tekan Enter)'), 
    colMd: 4 
  }
])

// Methods
const onFilterChange = (filter: any) => {
  currentFilter.value = filter
}

function loadData() {
  const filter = currentFilter.value
  // isLoading.value = true

  // teacherSvc.retrieve({
  //   q: filter.q || '',
  //   pageSize: filter.pageSize || 10,
  //   pageNumber: filter.pageNumber || 1,
  //   sortBy: filter.sortBy || 'name',
  //   sortType: filter.sortType || 'asc',
  //   institutionId: props.institutionId || filter.institutionId || null,
  //   isActive: true,
  // })
  // .then((res: any) => {
  //   tableData.value = {
  //     items: res.data?.items || [],
  //     meta: res.data?.meta || { totalItems: 0 },
  //   }
  // })
  // .catch((error: any) => {
  //   console.error('Failed to load students', error)
  //   tableData.value = { items: [], meta: { totalItems: 0 } }
  // })
  // .finally(() => {
  //   isLoading.value = false
  // })
}

function handleSelect(student: any) {
  emit('select', student)
  handleClose()
}

function handleClose() {
  isOpen.value = false
}

// Expose methods
defineExpose({
  refresh: () => tableRef.value?.refresh(),
})
</script>
