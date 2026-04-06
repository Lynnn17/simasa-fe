  <template>
    <div class="w-full space-y-4 animate-fade-in">
      <LayoutBreadcrumb :items="breadcrumbs" />

      <TableList
        :title="tableTitle"
        defaultSortBy="createdAt"
        :headers="headers"
        :tableData="tableData"
        :loading="isLoading"
        :filterSchema="filterSchema"
        :filterList="{listInstitution}"
        :actions="actions"
        :actionToolbars="actionToolbars"
        :actionLoading="{ exportItem: isExporting }"
        @fetchData="loadAll"
        @addItem="addItem"
        @editItem="editItem"
        @deleteItem="deleteItem"
        @importItem="importItem"
        @exportItem="exportItem"
      >
        <template v-slot:[`item.isActive`]="{ value }">
          <UiBadge :variant="value ? 'success' : 'danger'">
            {{ value ? $t('Aktif') : $t('Nonaktif') }}
          </UiBadge>
        </template>
      </TableList>

      <UiModal 
        v-model="showDialog" 
      :title="dialogTitle" 
      size="lg"
      persistent
    >
      <UiForm ref="formRef">
        <div class="space-y-3">
          <UiRow>
            <UiCol :cols="showInstitutionField ? 12 : 12" :md="showInstitutionField ? 6 : 12">
              <UiInput 
                v-model="editedItem.code"
                :label="$t('Kode')"
                :placeholder="getPlaceholder('input', 'Kode')" 
                required 
                :rules="[v => !!v || $t('Wajib diisi')]"
              />
            </UiCol>
            <UiCol v-if="showInstitutionField" cols="12" md="6">
              <UiAutocomplete 
                v-model="editedItem.institutionId"
                :label="$t('Institusi')"
                :placeholder="getPlaceholder('select', 'Institusi')" 
                :options="listInstitution"
                itemTitle="name"
                itemValue="id"
                required
                :rules="[v => !!v || $t('Wajib diisi')]"
                clearable
              />
            </UiCol>
          </UiRow>
          <UiInput 
            v-model="editedItem.name"
            :label="$t('Nama')"
            :placeholder="getPlaceholder('input', 'Nama')" 
            required 
            :rules="[v => !!v || $t('Wajib diisi')]"
          />
          <UiRow>
            <UiCol cols="12" md="6">
              <UiAutocomplete 
                v-model="editedItem.semesterType"
                :label="$t('Tipe Semester')"
                :placeholder="getPlaceholder('select', 'Tipe Semester')" 
                :options="semesterTypeOptions"
                required
                :rules="[v => !!v || $t('Wajib diisi')]"
                clearable
              />
            </UiCol>
            <UiCol cols="12" md="6">
              <UiSwitch 
                v-model="editedItem.isActive"
                :label="$t('Status')"
                layout="stacked"
                :valueText="editedItem.isActive ? $t('Aktif') : $t('Nonaktif')"
              />
            </UiCol>
          </UiRow>     
        </div>
      </UiForm>
      <template #footer>
        <UiButton color="secondary" @click="showDialog = false">{{ $t('Batal') }}</UiButton>
        <UiButton color="primary" :loading="isLoadingSave" @click="onSubmit">
          {{ $t('Simpan') }}
        </UiButton>
      </template>
    </UiModal>

    <!-- Import Dialog -->
    <DialogImportPreview
      v-model="showImportDialog"
      :title="getTitle('data', 'Import ' + pageTitle)"
      domain="academic-year"
      :institution-id="filter.institutionId"
      :institutions="listInstitution"
      :columns="[
        { key: 'code', label: $t('Kode') },
        { key: 'name', label: $t('Nama') },
        { key: 'semesterType', label: $t('Tipe Semester') },
        { key: 'isActive', label: $t('Status'), align: 'center' },
      ]"
      :preview-fn="academicSvc.importPreview"
      :save-fn="academicSvc.importSave"
      @success="loadAll"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import academicYearService from '@/services/academic-year.service';
import institutionService from '@/services/institution.service';

definePageMeta({
  layout: "admin",
  permission: "ACADEMIC_YEAR.VIEW",
});

const { t } = useTranslation();
const pageTitle = "Tahun Ajaran";

useHead({
  title: computed(() => t(pageTitle)),
});

const authStore = useAuthStore();
const formRef = ref<{ validate: () => Promise<boolean>; reset: () => void; resetValidation: () => void } | null>(null);
const swal = useSwal();
const route = useRoute();
const academicSvc = academicYearService();
const instSvc = institutionService();
const { getTitle, getPlaceholder } = useFormText();
const { isExporting, exportToExcel } = useExcelExport();
const itemPerPage = ref(10);
const isLoading = ref(false);
const isLoadingSave = ref(false);
const showDialog = ref(false);
const showImportDialog = ref(false);
const isEditing = ref(false);
const tableTitle = computed(() => getTitle("data", pageTitle));
const dialogTitle = computed(() => {
  return getTitle(isEditing.value ? "edit" : "add", pageTitle);
});

const showInstitutionField = ref(true);
const filter = ref<{
  organizationId: number | null;
  institutionId: number | null;
}>({
  organizationId: null,
  institutionId: null,
});

const listInstitution: any = ref([]);
const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});

const breadcrumbs = computed(() => [
  { label: t('Dashboard'), to: '/' },
  { label: t('Master Data') },
  { label: t(pageTitle) },
]);

const headers = computed(() => [
  { key: 'code', title: t('Kode'), sortable: true },
  { key: 'name', title: t('Nama'), sortable: true },
  { key: 'semesterType', title: t('Tipe Semester'), sortable: true },
  { key: 'institutionName', title: t('Institusi'), sortable: true },
  { key: 'isActive', title: t('Status'), align: 'center' },
  { key: 'actions', title: t('Aksi'), align: 'center', width: '10%' },
]);

// Dynamic filter schema based on session
const filterSchema = computed(() => {
  const schema: any[] = [];
  
  // Only show institution filter if user doesn't have institutionId in session
  if (showInstitutionField.value) {
    schema.push({ 
      name: 'institutionId', 
      type: 'autocomplete' as const, 
      items: 'listInstitution', 
      placeholder: getPlaceholder('select', 'Institusi'), 
      colMd: 3,
      valueKey: "id",
      textKey: "name",
    });
    schema.push({ name: '', type: 'text' as const, colMd: 5 });
  } else {
    schema.push({ name: '', type: 'text' as const, colMd: 8 });
  }
  
  schema.push({ name: 'q', type: 'search' as const, placeholder: t('Cari (Tekan Enter)'), colMd: 4 });
  
  return schema;
});

const actions = computed(() => [
  { key: 'edit', icon: 'mdi-pencil', color: '#f59e0b', tooltip: t('Ubah'), emit: 'editItem' },
  { key: 'delete', icon: 'mdi-delete', color: '#ef4444', tooltip: t('Hapus'), emit: 'deleteItem' },
]);

const actionToolbars = computed(() => [
  {
    key: "addItem",
    icon: "mdi-plus-circle-outline",
    color: "primary",
    tooltip: t('Tambah'),
    emit: "addItem",
    type: "default" as const,
  },
  {
    key: "importItem",
    icon: "mdi-file-import",
    color: "white",
    tooltip: t('Import'),
    emit: "importItem",
  },
  {
    key: "exportItem",
    icon: "mdi-file-excel",
    color: "white",
    tooltip: t('Export'),
    emit: "exportItem",
  },
]);

const semesterTypeOptions = computed(() => [
  { value: 'year', label: t('Tahunan') },
  { value: 'semester', label: t('Semester') },
]);

const defaultItem = {
  id: null as number | null,
  code: '',
  name: '',
  institutionId: null as number | null,
  semesterType: '',
  isActive: true,
};
const editedItem: any = ref({ ...defaultItem });

onBeforeMount(() => {
  filter.value.organizationId = authStore.user?.organizationId || null;
  filter.value.institutionId = authStore.user?.institutionId || null;
  showInstitutionField.value = !filter.value.institutionId;
});

onMounted(() => {
  loadAllInstitution();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, institutionId } = route.query;
  isLoading.value = true;
  await academicSvc.retrieve({
    q: q,
    pageSize: pageSize ? pageSize : itemPerPage.value,
    pageNumber: pageNumber ? pageNumber : 1,
    sortBy: sortBy,
    sortType: sortType,
    institutionId: institutionId ? institutionId : filter.value.institutionId,
  })
  .then((res: any) => {
    isLoading.value = false;
    tableData.value = {
      items: res.data != null ? res.data.items : [],
      meta: res.data?.meta || { totalItems: 0 },
    };
  })
  .catch(() => {
    isLoading.value = false;
  });
}

async function loadAllInstitution() {
  await instSvc.retrieveAll({})
    .then((res: any) => {
      listInstitution.value = res.data || []
    })
}

function addItem() {
  isEditing.value = false;
  editedItem.value = { 
    ...defaultItem,
    institutionId: filter.value.institutionId || null 
  };
  formRef.value?.reset();
  showDialog.value = true;
}

function importItem() {
  showImportDialog.value = true;
}

async function exportItem() {
  const { q, sortBy, sortType, institutionId } = route.query;
  const response: any = await academicSvc.retrieve({
    q: q,
    pageSize: 1,
    pageNumber: 1,
    sortBy: sortBy,
    sortType: sortType,
    institutionId: institutionId ? institutionId : filter.value.institutionId,
    ignorePaging: true,
  });
  const data = response.data?.items || [];

  await exportToExcel({
    data,
    filename: pageTitle,
    sheetName: t(pageTitle),
    columns: [
      { header: t('Kode'), key: 'code', width: 15 },
      { header: t('Nama'), key: 'name', width: 30 },
      { 
        header: t('Tipe Semester'), 
        key: 'semesterType', 
        width: 15,
      },
      { header: t('Institusi'), key: 'institutionName', width: 25 },
      { 
        header: t('Status'), 
        key: 'isActive', 
        width: 12,
        formatter: (val) => val ? t('Aktif') : t('Nonaktif'),
      },
    ],
  });
}

async function editItem(row: any) {
  formRef.value?.resetValidation();
  await academicSvc.retrieveById(row.id)
    .then((res: any) => {
      if (res.data?.id) {
        editedItem.value = res.data;
        isEditing.value = true;
        showDialog.value = true;
      }
    });
}

async function onSubmit() {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  
  isLoadingSave.value = true;
  academicSvc.save(editedItem.value)
    .then(() => {
      swal.toast(isEditing.value ? t('messages.success.updated') : t('messages.success.saved'), 'success');
      handleClose();
      loadAll();  
    })
    .catch((err: any) => {
      isLoadingSave.value = false;
      console.error("Failed to save data", err);
    });
};

async function deleteItem(row: any) {
  const result = await swal.confirmDelete(row.name, {
    title: getTitle("delete", t("Data")),
    text: t("messages.confirmation.delete_named", { v: row.name }),
    confirmText: t("Ya"),
    cancelText: t("Batal"),
    preConfirm: async () => {
      await Promise.all([
        academicSvc.destroy(row.id),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    },
  });
  
  if (result.isConfirmed) {
    swal.toast(t("messages.success.deleted"), "success");
    loadAll();
  }
}

function handleClose() {
  isLoadingSave.value = false;
  isEditing.value = false;
  formRef.value?.reset();
  editedItem.value = { ...defaultItem };
  showDialog.value = false;
}
</script>
