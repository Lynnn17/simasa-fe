<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  layout: "admin",
  permission: "LOGBOOK.VIEW", // Make sure this permission exists
});

const authStore = useAuthStore();
const userRole = computed(() => authStore.getUserRole);

useHead({
  title: "Logbook Magang",
});
</script>

<template>
  <div>
    <PagesInternshipLogbooksStudentHistory v-if="userRole === 'HA02'" />
    <PagesInternshipLogbooksMentorDashboard v-else-if="userRole === 'HA04'" />
    <div v-else class="p-8 text-center">
      <h3 class="text-lg font-medium text-slate-900 dark:text-white">
        Akses Terbatas
      </h3>
      <p class="text-slate-500">
        Hanya mahasiswa dan mentor yang dapat mengakses halaman ini.
      </p>
    </div>
  </div>
</template>
