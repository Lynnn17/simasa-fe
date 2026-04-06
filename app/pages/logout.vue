<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-4"></div>
      <p class="text-slate-600 dark:text-slate-400">Logging out...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "blank",
});

const authStore = useAuthStore();
const router = useRouter();
onMounted(() => {
  authStore.logout();
  setTimeout(() => {
    router.push("/login");
  }, 1000);
});
</script>

