<template>
  <div class="px-4">
    <div class="flex items-end gap-4 mb-6">
      <div class="w-64">
        <UiSelect
          v-model="filter.roleId"
          :options="listRole"
          label="Role"
          placeholder="Pilih Role"
          item-value="id"
          item-title="name"
          @change="handleRoleChange"
        />
      </div>
      <UiButton 
        color="primary" 
        :loading="isLoading"
        :disabled="!filter.roleId"
        @click="save"
      >
        Simpan
      </UiButton>
    </div>

    <!-- Permission Table -->
    <div class="overflow-x-auto mb-6">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-700/50">
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 w-1/2">
              Menu
            </th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 w-24">
              View
            </th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 w-24">
              Create
            </th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 w-24">
              Update
            </th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 w-24">
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="menu in listMenu" :key="menu.id">
            <!-- Parent Menu -->
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors bg-slate-100/50 dark:bg-slate-800/50">
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <UiIcon :name="menu.icon || 'IconFolder'" type="tabler" size="lg" color="black" />
                  <span class="text-sm text-slate-700 dark:text-slate-200">{{ menu.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="menu.viewVisible"
                  v-model="menu.view" 
                  :disabled="!filter.roleId"
                />
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="menu.createVisible"
                  v-model="menu.create" 
                  :disabled="!filter.roleId"
                />
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="menu.updateVisible"
                  v-model="menu.update" 
                  :disabled="!filter.roleId"
                />
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="menu.deleteVisible"
                  v-model="menu.delete" 
                  :disabled="!filter.roleId"
                />
              </td>
            </tr>
            
            <!-- Child Menus -->
            <tr 
              v-for="child in menu.children" 
              :key="child.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-3 pl-8">
                  <UiIcon :name="child.icon || 'IconCircle'" type="tabler" size="lg" color="black" />
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ child.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="child.viewVisible"
                  v-model="child.view" 
                  :disabled="!filter.roleId"
                />
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="child.createVisible"
                  v-model="child.create" 
                  :disabled="!filter.roleId"
                />
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="child.updateVisible"
                  v-model="child.update" 
                  :disabled="!filter.roleId"
                />
              </td>
              <td class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">
                <UiCheckbox 
                  v-if="child.deleteVisible"
                  v-model="child.delete" 
                  :disabled="!filter.roleId"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div 
        v-if="listMenu.length === 0 && filter.roleId" 
        class="text-center py-8 text-slate-400"
      >
        Tidak ada data menu
      </div>
      
      <div 
        v-if="!filter.roleId" 
        class="text-center py-8 text-slate-400"
      >
        Pilih role untuk melihat permission
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import menuService from "@/services/menu.service";
import roleService from "@/services/role.service";
import { useAuthStore } from "@/stores/auth";

const menuSvc = menuService();
const roleSvc = roleService();
const swal = useSwal();
const authStore = useAuthStore();

// State
const filter: any = ref({
  roleId: null,
});
const listMenu: any = ref([]);
const listRole: any = ref([]);
const isLoading = ref(false);

// Load roles on mount
onMounted(() => {
  loadAllRole();
});

// Load all roles
function loadAllRole() {
  roleSvc.retrieveAll({})
    .then((res: any) => {
      listRole.value = res.data || [];
    });
}

// Handle role change
function handleRoleChange(role: any) {
  if (role) {
    loadMenus();
  } else {
    listMenu.value = [];
  }
}

// Load menus with permissions
function loadMenus() {
  menuSvc.retrieveRoleMenuTrx({
      roleId: filter.value.roleId,
    })
    .then((response: any) => {
      let menus = response.data || [];
      listMenu.value = menus;

      for (let index = 0; index < listMenu.value.length; index++) {
        let el: any = listMenu.value[index];

        // Check permission
        el.view = hasMenuPermission(el.permissionList, "VIEW");
        el.create = hasMenuPermission(el.permissionList, "CREATE");
        el.update = hasMenuPermission(el.permissionList, "UPDATE");
        el.delete = hasMenuPermission(el.permissionList, "DELETE");

        el.viewVisible = hasMenuPermission(el.actionList, "VIEW");
        el.createVisible = hasMenuPermission(el.actionList, "CREATE");
        el.updateVisible = hasMenuPermission(el.actionList, "UPDATE");
        el.deleteVisible = hasMenuPermission(el.actionList, "DELETE");

        if (el.children) {
          for (let ind = 0; ind < el.children.length; ind++) {
            const el2 = el.children[ind];

            // Check permission
            el2.view = hasMenuPermission(el2.permissionList, "VIEW");
            el2.create = hasMenuPermission(el2.permissionList, "CREATE");
            el2.update = hasMenuPermission(el2.permissionList, "UPDATE");
            el2.delete = hasMenuPermission(el2.permissionList, "DELETE");

            el2.viewVisible = hasMenuPermission(el2.actionList, "VIEW");
            el2.createVisible = hasMenuPermission(el2.actionList, "CREATE");
            el2.updateVisible = hasMenuPermission(el2.actionList, "UPDATE");
            el2.deleteVisible = hasMenuPermission(el2.actionList, "DELETE");
          }
        }
      }
    });
}

// Check if menu has specific permission
function hasMenuPermission(arr: any, val: any): boolean {
  if (!arr) return false;
  const find = arr.find((el: any) => el === val);
  return find ? true : false;
}

// Join permissions into string
function joinPermission(x: any): string {
  let permission = [];
  if (x.view) permission.push("VIEW");
  if (x.create) permission.push("CREATE");
  if (x.update) permission.push("UPDATE");
  if (x.delete) permission.push("DELETE");
  return permission.join(",");
}

// Reload menu store after save
async function loadMenuStore() {
  const roleID = authStore.user?.roleId;
  if (roleID !== filter.value.roleId) {
    return;
  }

  await authStore
    .loadAuthMenu({
      roleId: roleID,
    })
    .catch((err: any) => {
      console.log("err log: ", err);
    });
}

// Save permissions
function save() {
  if (!filter.value.roleId) {
    swal.warning('Peringatan', 'Pilih role terlebih dahulu');
    return;
  }

  let menu: any = [];
  listMenu.value.forEach((el: any) => {
    let permission = joinPermission(el);
    if (permission) {
      menu.push({
        id: el.id,
        menuId: el.menuId,
        roleId: filter.value.roleId,
        permission: permission || null,
      });
    }

    if (el.children) {
      el.children.forEach((el2: any) => {
        let permission = joinPermission(el2);
        if (permission) {
          menu.push({
            id: el2.id,
            menuId: el2.menuId,
            roleId: filter.value.roleId,
            permission: permission || null,
          });
        }
      });
    }
  });

  isLoading.value = true;
  menuSvc.CreateBulkRoleMenu({ data: menu })
    .then(() => {
      isLoading.value = false;
      swal.toast('Permission berhasil disimpan', 'success');
      loadMenus();
      loadMenuStore();
    })
    .catch((err: any) => {
      isLoading.value = false;
      console.error(err);
    });
}
</script>
