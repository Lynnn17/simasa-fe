<script setup lang="ts">
definePageMeta({
  layout: "admin",
  permission: "LOGBOOK_STUDENT.VIEW",
});

useHead({
  title: "Riwayat Logbook Mahasiswa",
});
</script>

<template>
  <PagesInternshipLogbooksStudentHistory />
</template>
