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
      :filterList="{ listRole }"
      :actions="actions"
      :actionToolbars="actionToolbars"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
      @deactivateUser="toggleStatus"
      @activateUser="toggleStatus"
    >
      <template v-slot:[`item.active`]="{ value }">
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
        <div class="space-y-4">
          <UiAutocomplete 
            v-model="editedItem.roleId"
            :label="$t('Role')" 
            :placeholder="getPlaceholder('select', 'Role')" 
            :options="listRole"
            item-value="id"
            item-title="name"
            required
            clearable
            :rules="[v => !!v || $t('Wajib diisi')]"
          />

          <UiInput 
            v-model="editedItem.name"
            :label="$t('Nama')" 
            :placeholder="getPlaceholder('input', 'Nama')" 
            required 
            :rules="[v => !!v || $t('Wajib diisi')]"
          >
          </UiInput>

          <UiRow>
            <UiCol cols="12" md="6">
              <UiInput 
                v-model="editedItem.username"
                :label="$t('Username')" 
                :placeholder="getPlaceholder('input', 'Username')" 
                required 
                :rules="[
                  v => !!v || $t('Wajib diisi'),
                  v => (v && v.length >= 3) || $t('Minimal 3 karakter')
                ]"
              />
            </UiCol>
            <UiCol cols="12" md="6">
              <UiInput 
                v-model="editedItem.email"
                :label="$t('Email')" 
                type="email" 
                :placeholder="getPlaceholder('input', 'Email')" 
                required 
                :rules="[
                  v => !!v || $t('Wajib diisi'),
                  v => /.+@.+\..+/.test(v) || $t('Format email tidak valid')
                ]"
              />
            </UiCol>
          </UiRow>

          <UiInput 
            v-model="editedItem.password"
            :label="$t('Password')" 
            type="password" 
            :placeholder="getPlaceholder('input', 'Password')" 
            :required="!isEditing"
            :rules="passwordRules"
          />
          <div v-if="isEditing" class="flex">
            <UiIcon name="mdi-information-outline" size="sm" class="text-slate-600 dark:text-slate-300 mr-1" />
            <span class="text-sm text-slate-600 dark:text-slate-300">
              {{ $t("messages.info.password_empty_note") }}
            </span>
          </div>
        </div>
      </UiForm>
      <template #footer>
        <UiButton color="secondary" @click="showDialog = false">{{ $t('Batal') }}</UiButton>
        <UiButton color="primary" :loading="isLoadingSave" @click="onSubmit">
          {{ $t('Simpan') }}
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import userService from "@/services/user.service";
import roleService from "@/services/role.service";

definePageMeta({
  layout: "admin",
  permission: "USER.VIEW",
});

const { t } = useTranslation();
const pageTitle = "User";

useHead({
  title: computed(() => t(pageTitle)),
});

const { checkPermission, hasPermission } = usePermission();
const formRef = ref<{ validate: () => Promise<boolean>; reset: () => void; resetValidation: () => void } | null>(null);
const swal = useSwal();
const route = useRoute();
const userSvc = userService();
const roleSvc = roleService();
const { getTitle, getPlaceholder } = useFormText();
const itemPerPage = ref(10);
const isLoading = ref(false);
const isLoadingSave = ref(false);
const showDialog = ref(false);
const isEditing = ref(false);
const tableTitle = computed(() => getTitle("data", pageTitle));
const dialogTitle = computed(() => {
  return getTitle(isEditing.value ? "edit" : "add", pageTitle);
});

const filter = ref<{
  organizationId: number | null;
  institutionId: number | null;
}>({
  organizationId: null,
  institutionId: null,
});

const listRole: any = ref([]);
const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});

const breadcrumbs = computed(() => [
  { label: t('Dashboard'), to: '/' },
  { label: t('Setting') },
  { label: t(pageTitle) },
]);

const headers = computed(() => [
  { key: 'name', title: t('Nama'), sortable: true },
  { key: 'username', title: t('Username'), sortable: true },
  { key: 'email', title: t('Email'), sortable: true },
  { key: 'role', title: t('Role'), sortable: true },
  { key: 'active', title: t('Status'), align: 'center' },
  { key: 'actions', title: t('Aksi'), align: 'center', width: '10%' },
]);

const filterSchema = computed(() => [ 
  { 
    name: 'roleId', 
    type: 'autocomplete' as const, 
    items: 'listRole', 
    placeholder: getPlaceholder('select', 'Role'), 
    colMd: 2,
    valueKey: "id",
    textKey: "name",
  },
  { name: '', type: 'text' as const, colMd: 6 },
  { name: 'q', type: 'search' as const, placeholder: t('Cari (Tekan Enter)'), colMd: 4 }
]);

const actions = computed(() => [
  { key: 'edit', icon: 'mdi-pencil', color: '#f59e0b', tooltip: t('Ubah'), emit: 'editItem',  show: () => hasPermission("USER.UPDATE") },
  { 
    key: 'deactivate', 
    icon: 'mdi-account-off', 
    color: '#6b7280', 
    tooltip: t('Nonaktifkan'), 
    emit: 'deactivateUser',
    show: (item: any) => item.active === true
  },
  { 
    key: 'activate', 
    icon: 'mdi-account-check', 
    color: '#22c55e', 
    tooltip: t('Aktifkan'), 
    emit: 'activateUser',
    show: (item: any) => item.active === false
  },
  { key: 'delete', icon: 'mdi-delete', color: '#ef4444', tooltip: t('Hapus'), emit: 'deleteItem',
    show: () => hasPermission("USER.DELETE")
   },
]);

const actionToolbars = computed(() => [
  {
    key: "addItem",
    icon: "mdi-plus-circle-outline",
    color: "primary",
    tooltip: t('Tambah'),
    emit: "addItem",
    type: "default" as const,
    show: () => hasPermission("USER.CREATE")
  },
]);

const defaultItem = {
  id: null as number | null,
  name: '',
  username: '',
  email: '',
  password: '',
  roleId: null as number | null,
  status: '1',
};
const editedItem: any = ref({ ...defaultItem });

const passwordRules = computed(() => {
  if (isEditing.value) {
    return [
      (v: string) => !v || v.length >= 8 || t("messages.validation.min_length", { v: 8 })
    ];
  }
  return [
    (v: string) => !!v || t('Wajib diisi'),
    (v: string) => (v && v.length >= 8) || t("messages.validation.min_length", { v: 8 })
  ];
});

onBeforeMount(() => {});

onMounted(() => {
  loadAllRole();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, roleId, organizationId, institutionId } = route.query;
  isLoading.value = true;
  await userSvc.retrieve({
    q: q,
    pageSize: pageSize ? pageSize : itemPerPage.value,
    pageNumber: pageNumber ? pageNumber : 1,
    sortBy: sortBy,
    sortType: sortType,
    roleId: roleId,
    organizationId: organizationId ? organizationId : filter.value.organizationId,
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

async function loadAllRole() {
  await roleSvc.retrieveAll({})
    .then((res: any) => {
      listRole.value = res.data || [];
    });
}

function addItem() {
  isEditing.value = false;
  editedItem.value = { 
    ...defaultItem,
  };
  formRef.value?.reset();
  showDialog.value = true;
}

async function editItem(row: any) {
  formRef.value?.resetValidation();
  await userSvc.retrieveById(row.id)
    .then((res: any) => {
      if (res.data?.id) {
        editedItem.value = res.data;
        editedItem.value.password = null;
        isEditing.value = true;
        showDialog.value = true;
      }
    });
}

async function onSubmit() {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  
  isLoadingSave.value = true;
  editedItem.value.status = "1";
  userSvc.save(editedItem.value)
    .then(() => {
      swal.toast(isEditing.value ? t('messages.success.updated') : t('messages.success.saved'), 'success');
      handleClose();
      loadAll();
    })
    .catch((err: any) => {
      isLoadingSave.value = false;
      console.error("Failed to save data", err);
    });
}

async function deleteItem(row: any) {
  const result = await swal.confirmDelete(row.name, {
    title: getTitle("delete", t("Data")),
    text: t("messages.confirmation.delete_named", { v: row.name }),
    confirmText: t("Ya"),
    cancelText: t("Batal"),
    preConfirm: async () => {
      await Promise.all([
        userSvc.destroy(row.id),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    },
  });
  
  if (result.isConfirmed) {
    swal.toast(t("messages.success.deleted"), "success");
    loadAll();
  }
}

async function toggleStatus(row: any) {
  const newStatus = !row.active;
  const actionText = newStatus ? t('Aktifkan') : t('Nonaktifkan');
  const statusText = newStatus ? t('aktif') : t('nonaktif');
  
  const result = await swal.confirmDelete(row.name, {
    title: actionText + ' User',
    text: t('messages.confirmation.toggle_status', { name: row.name, status: statusText }),
    confirmText: t('Ya'),
    cancelText: t('Batal'),
    preConfirm: async () => {
      await Promise.all([
        userSvc.updateActiveStatus({ id: row.id, active: newStatus }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    },
  });
  
  if (result.isConfirmed) {
    swal.toast(t('messages.success.updated'), 'success');
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