<script setup lang="ts">
definePageMeta({
  layout: "admin",
  permission: "LOGBOOK_MENTOR.VIEW",
});

useHead({
  title: "Monitoring Logbook Mentor",
});
</script>

<template>
  <PagesInternshipLogbooksMentorDashboard />
</template>
