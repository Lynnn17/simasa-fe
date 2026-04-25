<script setup lang="ts">
definePageMeta({
  layout: "admin",
  permission: "TASK_MENTOR.VIEW", 
});

useHead({
  title: "Manajemen Tugas",
});
</script>

<template>
  <PagesInternshipTasksMentorDashboard />
</template>
