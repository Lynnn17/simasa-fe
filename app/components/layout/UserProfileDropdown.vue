<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const showDropdown = ref(false);

const navigateAndClose = (path: string) => {
  showDropdown.value = false;
  navigateTo(path);
};

const handleLogout = async () => {
  showDropdown.value = false;

  const swal = useSwal();
  const result = await swal.confirm(
    "Logout",
    "Apakah Anda yakin ingin keluar dari akun ini?",
  );

  if (result.isConfirmed) {
    authStore.logout();
    navigateTo("/login");
  }
};

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-profile-dropdown-container")) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="user-profile-dropdown-container relative">
    <button
      class="flex items-center gap-3 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
      @click="showDropdown = !showDropdown"
    >
      <UiAvatar :name="authStore.user?.name || 'User'" size="sm" />
      <div class="hidden md:block text-left">
        <p class="text-sm font-medium text-slate-900 dark:text-white">
          {{ authStore.user?.name || "User" }}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{
            typeof authStore.user?.role === "object"
              ? authStore.user?.role?.name
              : authStore.user?.role || "Guest"
          }}
        </p>
      </div>
      <svg
        class="hidden md:block w-4 h-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="px-5 py-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            User Profile
          </h3>
        </div>

        <!-- User Info -->
        <div class="px-5 pb-4 flex items-center gap-4">
          <UiAvatar
            :name="authStore.user?.name || 'User'"
            size="lg"
            class="ring-4 ring-primary-100 dark:ring-primary-900/30"
          />
          <div>
            <h4 class="font-semibold text-slate-900 dark:text-white">
              {{ authStore.user?.name || "User" }}
            </h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{
                typeof authStore.user?.role === "object"
                  ? authStore.user?.role?.name
                  : authStore.user?.role || "Guest"
              }}
            </p>
            <div
              class="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-slate-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{{ authStore.user?.email || "user@example.com" }}</span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700"></div>



        <!-- Upgrade Banner -->
        <!-- <div class="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-primary-100 to-cyan-100 dark:from-primary-900/30 dark:to-cyan-900/30 relative overflow-hidden">
          <div class="relative z-10">
            <h4 class="font-bold text-slate-900 dark:text-white">Unlimited<br>Access</h4>
            <button class="mt-3 px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
              Upgrade
            </button>
          </div>
          <div class="absolute right-0 bottom-0 w-24 h-24 opacity-50">
            <svg viewBox="0 0 100 100" fill="currentColor" class="text-primary-300 dark:text-primary-700">
              <circle cx="70" cy="70" r="40" fill="currentColor" opacity="0.3" />
              <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.4" />
            </svg>
          </div>
        </div> -->

        <!-- Logout Button -->
        <div class="p-4 pt-0">
          <button
            @click="handleLogout"
            class="w-full py-2.5 text-center text-primary-500 font-medium border border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
