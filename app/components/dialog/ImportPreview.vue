<template>
  <UiModal 
    :model-value="modelValue" 
    @update:model-value="(val: boolean) => emit('update:modelValue', val)"
    :title="title"
    size="2xl"
    persistent
  >
    <UiStepper v-model="currentStep" :steps="steps" linear>
      <!-- Step 1: Upload File -->
      <template #step-1>
        <!-- Institution Selection -->
        <UiAutocomplete
          v-if="institutions && institutions.length > 0 && !institutionId"
          v-model="selectedInstitutionId"
          :label="$t('Institusi')"
          :placeholder="$t('form.placeholder.select', { v: $t('Institusi') })"
          :options="institutions"
          item-value="id"
          item-title="name"
          required
          clearable
        />

        <div class="mt-6">
          <!-- File Upload Area -->
          <UiFileUpload
            v-model="selectedFile"
            accept=".xlsx,.xls,.csv"
            :max-size="10"
            @error="handleFileError"
          />
          
          <!-- Download Template Link -->
          <div v-if="domain" class="mt-3 text-sm">
            <a 
              href="#" 
              class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              @click.prevent="handleDownloadTemplate"
            >
              <span class="mdi mdi-download text-lg"></span>
              Download Template
            </a>
          </div>
        </div>
      </template>

      <!-- Step 2: Preview & Validate -->
      <template #step-2>
        <div class="space-y-4">
          <!-- Summary Stats -->
          <UiRow>
            <UiCol cols="6" md="3">
              <UiCard variant="flat" class="bg-slate-100 dark:bg-slate-700 text-center py-3">
                <p class="text-lg font-bold text-slate-800 dark:text-white">{{ previewData?.totalRows || 0 }}</p>
                <p class="text-xs text-slate-500">{{ $t('import.total_rows') }}</p>
              </UiCard>
            </UiCol>
            <UiCol cols="6" md="3">
              <UiCard variant="flat" class="bg-green-100 dark:bg-green-900/30 text-center py-3">
                <p class="text-lg font-bold text-green-600">{{ previewData?.validCount || 0 }}</p>
                <p class="text-xs text-green-600">{{ $t('import.valid') }}</p>
              </UiCard>
            </UiCol>
            <UiCol cols="6" md="3">
              <UiCard variant="flat" class="bg-red-100 dark:bg-red-900/30 text-center py-3">
                <p class="text-lg font-bold text-red-600">{{ previewData?.errorCount || 0 }}</p>
                <p class="text-xs text-red-600">{{ $t('import.errors') }}</p>
              </UiCard>
            </UiCol>
            <UiCol cols="6" md="3">
              <UiCard variant="flat" class="bg-yellow-100 dark:bg-yellow-900/30 text-center py-3">
                <p class="text-lg font-bold text-yellow-600">{{ existingCount }}</p>
                <p class="text-xs text-yellow-600">{{ $t('import.existing') }}</p>
              </UiCard>
            </UiCol>
          </UiRow>

          <!-- Import Mode -->
          <UiRadioGroup
            v-model="importMode"
            :label="$t('import.mode') + ' :'"
            :options="importModeOptions"
            inline
          />

          <!-- Preview Table -->
          <UiTable
            :columns="previewColumns"
            :data="previewTableItems"
            size="md"
            striped
            fixed-header
            max-height="400px"
          >
            <template #cell-isActive="{ value }">
              <UiBadge v-if="value" variant="success" size="sm">{{ $t('Aktif') }}</UiBadge>
              <UiBadge v-else variant="danger" size="sm">{{ $t('Nonaktif') }}</UiBadge>
            </template>
            <template #cell-info="{ row }">
              <template v-if="row.isError">
                <span class="text-red-600 text-xs">
                  <i class="mdi mdi-alert-circle mr-1" />
                  {{ row.errorMessage }}
                </span>
              </template>
              <template v-else>
                <UiBadge v-if="row.exists" variant="warning" size="sm">
                  {{ $t('import.already_exists') }}
                </UiBadge>
                <UiBadge v-else variant="success" size="sm">
                  {{ $t('import.new_data') }}
                </UiBadge>
              </template>
            </template>
          </UiTable>
        </div>
      </template>

      <!-- Step 3: Complete -->
      <template #step-3>
        <div class="text-center py-8">
          <div v-if="isLoadingSave" class="space-y-4">
            <i class="mdi mdi-loading mdi-spin text-5xl text-primary-500" />
            <p class="text-slate-600 dark:text-slate-400">{{ $t('import.processing') }}</p>
          </div>
          <div v-else-if="importComplete" class="space-y-4">
            <i class="mdi mdi-check-circle text-5xl text-green-500" />
            <p class="text-lg font-medium text-slate-800 dark:text-white">{{ $t('import.complete') }}</p>
            <p class="text-slate-500">{{ $t('import.complete_message', { count: importedCount }) }}</p>
          </div>
        </div>
      </template>
    </UiStepper>

    <template #footer>
      <div class="flex justify-between w-full">
        <div>
          <UiButton 
            v-if="currentStep > 1 && !importComplete" 
            color="secondary" 
            variant="outline"
            @click="goBack"
          >
            <i class="mdi mdi-arrow-left mr-1" />
            {{ $t('Kembali') }}
          </UiButton>
        </div>
        <div class="flex gap-2">
          <UiButton color="secondary" @click="handleClose">
            {{ importComplete ? $t('Tutup') : $t('Batal') }}
          </UiButton>
          
          <!-- Step 1: Preview Button -->
          <UiButton 
            v-if="currentStep === 1"
            color="primary" 
            :loading="isLoadingPreview" 
            :disabled="!canPreview"
            @click="handlePreview"
          >
            {{ $t('import.preview') }}
            <i class="mdi mdi-arrow-right ml-1" />
          </UiButton>

          <!-- Step 2: Process Button -->
          <UiButton 
            v-if="currentStep === 2"
            color="primary" 
            :loading="isLoadingSave" 
            :disabled="!previewData || previewData.validCount === 0"
            @click="handleSave"
          >
            <i class="mdi mdi-check mr-1" />
            {{ $t('import.process') }}
          </UiButton>
        </div>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface PreviewError {
  row: number;
  message: string;
}

interface PreviewData {
  totalRows: number;
  validCount: number;
  errorCount: number;
  data: any[];
  errors: PreviewError[];
}

interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface Props {
  modelValue: boolean;
  title?: string;
  domain?: string;
  institutionId?: number | null;
  institutions?: any[];
  columns?: ColumnDef[];
  previewFn: (...args: any[]) => Promise<any>;
  saveFn: (data: any) => Promise<any>;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Import Data',
  domain: '',
  institutionId: null,
  institutions: () => [],
  columns: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

const { t } = useTranslation();
const swal = useSwal();
const templateSvc = importTemplateService();

// Download template handler
function handleDownloadTemplate() {
  if (props.domain) {
    templateSvc.downloadTemplate(props.domain);
  }
}

// Stepper
const currentStep = ref(1);
const steps = computed(() => [
  { title: t('import.step_upload'), icon: 'mdi-upload', complete: currentStep.value > 1 },
  { title: t('import.step_preview'), icon: 'mdi-eye', complete: currentStep.value > 2 },
  { title: t('import.step_complete'), icon: 'mdi-check' },
]);

// Refs
const selectedFile: any = ref(null);
const selectedInstitutionId = ref<number | null>(props.institutionId);
const previewData = ref<PreviewData | null>(null);
const importMode = ref<'upsert' | 'insert'>('upsert');
const isLoadingPreview = ref(false);
const isLoadingSave = ref(false);
const importComplete = ref(false);
const importedCount = ref(0);

// Computed
const canPreview = computed(() => {
  // If no institutions are provided, only require file selection
  if (!props.institutions || props.institutions.length === 0) {
    return !!selectedFile.value;
  }
  // If institutions are provided, require institution selection
  return selectedFile.value && (props.institutionId || selectedInstitutionId.value);
});

const existingCount = computed(() => {
  return previewData.value?.data?.filter(d => d.exists).length || 0;
});

const importModeOptions = computed(() => [
  { label: t('import.mode_upsert'), value: 'upsert' },
  { label: t('import.mode_insert'), value: 'insert' },
]);

// Table columns for preview - use prop or auto-detect from data
const previewColumns = computed(() => {
  // Always start with row number column
  const baseColumns: ColumnDef[] = [
    { key: 'row', label: t('Row'), width: '50px' },
  ];
  
  // Use provided columns or auto-detect from first data item
  if (props.columns && props.columns.length > 0) {
    return [...baseColumns, ...props.columns, { key: 'info', label: t('import.info') }];
  }
  
  // Auto-detect columns from data (exclude internal fields)
  if (previewData.value?.data?.length) {
    const firstItem = previewData.value.data[0];
    const excludeKeys = ['row', 'exists', 'isError', 'errorMessage'];
    const detectedColumns = Object.keys(firstItem)
      .filter(key => !excludeKeys.includes(key))
      .map(key => ({ key, label: key }));
    return [...baseColumns, ...detectedColumns, { key: 'info', label: t('import.info') }];
  }
  
  return baseColumns;
});

// Combine valid data and errors into single table items
const previewTableItems = computed(() => {
  if (!previewData.value) return [];
  
  const data = previewData.value.data || [];
  const errors = previewData.value.errors || [];
  
  const validItems = data.map(item => ({
    ...item,
    isError: false,
    errorMessage: '',
  }));
  
  const errorItems = errors.map(err => ({
    row: err.row,
    exists: false,
    isError: true,
    errorMessage: err.message,
  }));
  
  return [...validItems, ...errorItems].sort((a, b) => a.row - b.row);
});

// Methods
const handleFileError = (message: string) => {
  swal.error(t('Gagal'), message);
};

const handlePreview = async () => {
  if (!selectedFile.value) return;
  
  // Only require institution if institutions are provided
  const requiresInstitution = props.institutions && props.institutions.length > 0;
  const instId = props.institutionId || selectedInstitutionId.value;
  if (requiresInstitution && !instId) return;

  isLoadingPreview.value = true;
  try {
    const res = await props.previewFn(selectedFile.value, instId);
    previewData.value = res.data;
    currentStep.value = 2; // Move to preview step
  } catch (err: any) {
    console.log(err);
  } finally {
    isLoadingPreview.value = false;
  }
};

const handleSave = async () => {
  if (!previewData.value || previewData.value.validCount === 0) return;

  // Only require institution if institutions are provided
  const requiresInstitution = props.institutions && props.institutions.length > 0;
  const instId = props.institutionId || selectedInstitutionId.value;
  if (requiresInstitution && !instId) return;

  isLoadingSave.value = true;
  currentStep.value = 3; // Move to complete step
  
  try {
    // Add 1 second delay for better UX
    await Promise.all([
      props.saveFn({
        institutionId: instId,
        mode: importMode.value,
        data: previewData.value.data,
      }),
      new Promise(resolve => setTimeout(resolve, 1000))
    ]);
    importComplete.value = true;
    importedCount.value = previewData.value.validCount;
    swal.toast(t('messages.success.imported'), 'success');
    emit('success');
  } catch (err: any) {
    currentStep.value = 2; // Go back to preview
  } finally {
    isLoadingSave.value = false;
  }
};

const goBack = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1;
    previewData.value = null;
  }
};

const handleClose = () => {
  selectedFile.value = null;
  previewData.value = null;
  importMode.value = 'upsert';
  isLoadingPreview.value = false;
  isLoadingSave.value = false;
  importComplete.value = false;
  importedCount.value = 0;
  currentStep.value = 1;
  emit('update:modelValue', false);
};

// Watch institutionId prop
watch(() => props.institutionId, (val) => {
  if (val) selectedInstitutionId.value = val;
}, { immediate: true });

// Reset when dialog opens
watch(() => props.modelValue, (val) => {
  if (val) {
    currentStep.value = 1;
    importComplete.value = false;
  }
});
</script>
