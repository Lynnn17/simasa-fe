<template>
  <UiModal 
    v-model="isOpen" 
    :title="dialogTitle" 
    size="2xl"
  >
    <div class="space-y-4">
      <!-- Filter Bar -->
      <UiRow>
        <UiCol :cols="12" md="3">
          <UiSelect
              v-model="filterLocal.institutionId"
              :options="props.listInstitution"
              option-value="id"
              option-label="name"
              :placeholder="$t('Pilih Institusi')"
              clearable
              @update:model-value="handleRefreshItems"
              :disabled="!!props.institutionId"
          />
        </UiCol>
        <UiCol :cols="12" md="3">
          <UiSelect
              v-model="filterLocal.roleId"
              :options="props.listRole"
              option-value="id"
              option-label="name"
              :placeholder="$t('Pilih Role')"
              clearable
              @update:model-value="handleRefreshItems"
              :disabled="!!props.roleId"
          />
        </UiCol>
        <UiCol :cols="12" md="3"></UiCol>
        <UiCol :cols="12" md="3">
          <UiInput
              v-model="filterLocal.q"
              :placeholder="$t('Cari (Tekan Enter)')"
              @keydown.enter="handleRefreshItems"
            >
             <template #prefix>
               <i class="mdi mdi-magnify text-slate-400"></i>
             </template>
            </UiInput>
        </UiCol>
      </UiRow>

      <!-- Table -->
      <UiTable
        :columns="headers"
        :data="tableData.items"
        :loading="isLoading"
        :selectable="multiple"
        v-model="selectedIds"
        item-key="id"
        :disabled-keys="props.excludeIds"
        :sort-key="filterLocal.sortBy"
        :sort-order="filterLocal.sortType as 'asc' | 'desc'"
        @sort="handleSort"
        class="border rounded-lg"
      >
        <template #cell-name="{ row: item }">
            <div class="flex items-center gap-3">
                <UiAvatar :name="item.name" size="md" />
                <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ item.name }}</p>
                    <p class="text-xs text-slate-500">{{ item.username }} - {{ item.email }}</p>
                </div>
            </div>
        </template>
      </UiTable>

      <!-- Pagination -->
      <div class="flex flex-wrap items-center justify-between gap-4">
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
          :items-per-page="filterLocal.pageSize"
          @update:current-page="handlePageChanged"
        />
      </div>
    </div>
    
    <template #footer>
        <div class="flex items-center justify-between w-full">
            <div class="text-sm text-slate-600">
                <span v-if="multiple && selectedIds.length > 0">
                    {{ selectedIds.length }} {{ $t('dipilih') }}
                </span>
            </div>
            <div class="flex gap-2">
                <UiButton color="secondary" @click="handleClose">
                    {{ $t('Batal') }}
                </UiButton>
                <UiButton 
                    color="primary" 
                    @click="handleSelect"
                    :disabled="multiple && selectedIds.length === 0"
                >
                    <i class="mdi mdi-check mr-1"></i>
                    {{ $t('Pilih') }}
                </UiButton>
            </div>
        </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import userService from '@/services/user.service'

interface User {
  id: number
  username: string
  name: string
  email?: string
  roleId: number
  roleName?: string
  institutionId?: number
  institutionName?: string
  active?: boolean
}

// Props
interface Props {
  modelValue: boolean
  multiple?: boolean
  roleId?: number | null
  institutionId?: number | null
  listRole?: any[]
  listInstitution?: any[]
  title?: string
  excludeIds?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  multiple: true,
  roleId: null,
  institutionId: null,
  listRole: () => [],
  listInstitution: () => [],
  excludeIds: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', items: User[] | User): void
}>()

const { t } = useTranslation()
const userSvc = userService()
const { getTitle } = useFormText()

// State
const isLoading = ref(false)
const itemsPerPage = ref(10)
const selectedIds = ref<number[]>([])

const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
]

const filterLocal = ref({
    q: '',
    pageNumber: 1,
    pageSize: 10,
    roleId: null as number | null,
    institutionId: null as number | null,
    sortBy: 'name',
    sortType: 'asc',
})

const tableData = ref<{
  items: User[]
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

const dialogTitle = computed(() => {
  return props.title || getTitle("select", "User");
});

const headers = computed(() => [
  { key: 'name', label: t('Nama'), sortable: true },
  { key: 'role', label: t('Role'), sortable: true },
  { key: 'institutionName', label: t('Institusi'), sortable: true },
])

// Methods
function initFilter() {
    filterLocal.value.roleId = props.roleId
    filterLocal.value.institutionId = props.institutionId
    filterLocal.value.q = ''
    filterLocal.value.pageNumber = 1
    selectedIds.value = []
}

function loadData() {
  isLoading.value = true
  
  userSvc.retrieve({
    q: filterLocal.value.q,
    pageSize: filterLocal.value.pageSize,
    pageNumber: filterLocal.value.pageNumber,
    sortBy: filterLocal.value.sortBy,
    sortType: filterLocal.value.sortType,
    roleId: filterLocal.value.roleId,
    institutionId: filterLocal.value.institutionId,
    active: 1, // Only active users
  })
  .then((res: any) => {
    tableData.value = {
      items: res.data?.items || [],
      meta: res.data?.meta || { totalItems: 0 },
    }
  })
  .catch((error: any) => {
    console.error('Failed to load users', error)
    tableData.value = { items: [], meta: { totalItems: 0 } }
  })
  .finally(() => {
    isLoading.value = false
  })
}

const handleRefreshItems = () => {
    filterLocal.value.pageNumber = 1
    loadData()
}

const handlePageChanged = (page: number) => {
    filterLocal.value.pageNumber = page
    loadData()
}

const handleSort = ({ key, order }: { key: string, order: 'asc' | 'desc' }) => {
    filterLocal.value.sortBy = key
    filterLocal.value.sortType = order
    loadData()
}

const getItemPerPage = (val: number) => {
    filterLocal.value.pageSize = val
    handleRefreshItems()
}

function handleSelect() {
    if (props.multiple) {
        const selectedItems = tableData.value.items.filter(i => selectedIds.value.includes(i.id))
        const found = tableData.value.items.filter(x => selectedIds.value.includes(x.id))
        emit('select', found)
    } else {
        if (selectedIds.value.length > 0) {
            const item = tableData.value.items.find(i => i.id === selectedIds.value[0])
            if (item) emit('select', item)
        }
    }
    handleClose()
}

function handleClose() {
  isOpen.value = false
}

// Watchers
watch(() => props.modelValue, (val) => {
    if (val) {
        initFilter()
        loadData()
    }
})
</script>
