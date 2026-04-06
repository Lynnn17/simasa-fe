<script setup lang="ts">
definePageMeta({
  layout: "admin",
  permission: "DASHBOARD.VIEW",
});

useHead({
  title: "Dashboard",
});
</script>

<template>
  <PagesDashboardContent />
</template>

