<template>
  <div>
    <TableList
      defaultSortBy="createdAt"
      :headers="headers"
      :tableData="tableData"
      :loading="isLoading"
      :filterSchema="filterSchema"
      :actions="actions"
      :actionToolbars="actionToolbars"
      :showHeader="false"
      elevated="none"
      contentPadding="px-3 mb-6"
      @fetchData="loadAll"
      @addItem="addItem"
      @editItem="editItem"
      @deleteItem="deleteItem"
    />

    <UiModal 
      v-model="showModal" 
      :title="isEditing ? 'Edit Menu' : 'Tambah Menu'" 
      size="lg"
    >
      <UiForm ref="formRef">
        <!-- Menu Section -->
        <div class="mb-6">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Menu</h3>
          <div class="grid grid-cols-2 gap-4">
            <UiInput 
              v-model="editedItem.name"
              placeholder="Nama" 
              required 
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <UiInput 
              v-model="editedItem.icon"
              placeholder="Icon" 
            />
            <UiInput 
              v-model="editedItem.link"
              placeholder="Link" 
              required 
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <UiSelect 
              v-model="editedItem.level"
              placeholder="Level" 
              :options="listLevel"
              :rules="[v => !!v || 'Wajib diisi']"
              clearable
            />
            <UiInput 
              v-model="editedItem.description"
              placeholder="Keterangan" 
            />
            <UiAutocomplete
              v-if="editedItem.level === 2"
              v-model="editedItem.parentId"
              placeholder="Parent Menu" 
              :options="listMenu"
              item-value="id"
              item-title="name"
              clearable
            />
            <UiInput 
              v-model="editedItem.seq"
              placeholder="Urutan" 
              type="number"
              :rules="[v => !!v || 'Wajib diisi']"
            />
          </div>
        </div>

        <!-- Permission Section -->
        <div>
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Permission</h3>
          <div class="grid grid-cols-2 gap-4">
            <UiInput 
              v-model="editedItem.permissionLabel"
              placeholder="Label Permission" 
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <UiAutocompleteMultiple 
              v-model="editedItem.actionList"
              placeholder="Aksi" 
              :options="listAction"
              chip-color="primary"
              :rules="[(v: any[]) => v && v.length > 0 || 'Wajib diisi']"
            />
          </div>
        </div>
      </UiForm>
      <template #footer>
        <UiButton color="secondary" @click="showModal = false">Batal</UiButton>
        <UiButton color="primary" :loading="loading" @click="onSubmit">
          Simpan
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import menuService from '@/services/menu.service';
const formRef = ref<{ validate: () => Promise<boolean>; reset: () => void; resetValidation: () => void } | null>(null);

const swal = useSwal();
const route = useRoute();
const menuSvc = menuService();
const itemPerPage = ref(10);
const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const listMenu: any = ref([]);
const listLevel: any = ref([1,2]);
const listAction = ["VIEW", "CREATE", "UPDATE", "DELETE"];
const tableData: any = ref({
  items: [],
  meta: {
    totalItems: 0,
  },
});

const headers = [
  { key: 'name', title: 'Nama', sortable: true,},
  { key: 'link', title: 'Link', sortable: true},
  { key: 'icon', title: 'Icon' },
  { key: 'parentMenu', title: 'Parent', sortable: true },
  { key: 'description', title: 'Keterangan' },
  { key: 'actions', title: 'Aksi', align: 'center', width: '10%' },
];

const filterSchema = [
  { name: '', type: 'text' as const, colMd: 8 },
  { name: 'q', type: 'search' as const, placeholder: 'Cari...', colMd: 4 },
];

const actions = [
  { key: 'edit', icon: 'mdi-pencil', color: '#f59e0b', tooltip: 'Edit', emit: 'editItem' },
  { key: 'delete', icon: 'mdi-delete', color: '#ef4444', tooltip: 'Hapus', emit: 'deleteItem' },
];

const actionToolbars = [
  {
    key: "addItem",
    icon: "mdi-plus-circle-outline",
    color: "primary",
    tooltip: "Tambah Menu",
    emit: "addItem",
    type: "default" as const,
  },
];

const defaultItem = {
  id: null,
  name: '',
  link: '',
  icon: '',
  parentId: null,
  description: '',
  seq: null,
  permissionLabel: '',
  action: null,
  actionList: [],
};
const editedItem: any = ref({ ...defaultItem });

onMounted(() => {
  loadAllMenu();
});

async function loadAll() {
  const { pageNumber, pageSize, q, sortBy, sortType, roleId} = route.query;
  isLoading.value = true;
  await menuSvc.retrieve({
      q: q,
      pageSize: pageSize ? pageSize : itemPerPage.value,
      pageNumber: pageNumber ? pageNumber : 1,
      sortBy: sortBy,
      sortType: sortType,
      roleId: roleId,
    })
    .then((res: any) => {
      isLoading.value = false;
      tableData.value = {
        items: res.data != null ? res.data.items : [],
        meta: res.data.meta,
      };
    });
}

function loadAllMenu() {
  menuSvc.retrieveAll({})
    .then((res:any) => {
      listMenu.value = res.data || [];
    });
}

function addItem() {
  isEditing.value = false;
  editedItem.value = { ...defaultItem };
  formRef.value?.reset();
  showModal.value = true;
}

async function editItem(x: any) {
  formRef.value?.resetValidation();
  await menuSvc.retrieveById(x.id)
    .then((res: any) => {
      if (res.data.id) {
        editedItem.value = res.data;
        if (editedItem.value.action) {
          let action = editedItem.value.action.split(",");
          editedItem.value.actionList = action;
        }  
        isEditing.value = true;
        showModal.value = true;
      }
    });
};

const onSubmit = async () => {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;
  
  loading.value = true;
  let action = editedItem.value.actionList.join(",");
  editedItem.value.action = action || null;
  editedItem.value.level = Number(editedItem.value.level);
  editedItem.value.seq = Number(editedItem.value.seq);
  menuSvc.save(editedItem.value)
  .then((res: any) => {
    handleClose();
    swal.toast(isEditing.value ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan', 'success');
    loadAll();
  })
  .catch((err: any) => {
    loading.value = false;
    console.error("Failed to save user", err);
  });
};

const deleteItem = async (row: any) => {
  const result = await swal.confirmDelete(row.name);
  if (result.isConfirmed) {
    menuSvc.destroy(row.id)
      .then(() => {
        swal.toast('Data berhasil dihapus', 'success');
        loadAll();
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

function handleClose() {
  loading.value = false;
  formRef.value?.reset();
  editedItem.value = { ...defaultItem };
  showModal.value = false;
}
</script>
