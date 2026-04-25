<script setup lang="ts">
definePageMeta({
  layout: "admin",
  permission: "TASK_MAHASISWA.VIEW",
});

useHead({
  title: "Tugas Magang",
});
</script>

<template>
  <PagesInternshipTasksStudentDashboard />
</template>
