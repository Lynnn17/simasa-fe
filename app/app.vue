<script setup lang="ts">
const { connect, disconnect } = useSocket();
const authStore = useAuthStore();

// Watch authentication status to connect/disconnect socket
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    connect();
  } else {
    disconnect();
  }
}, { immediate: true });
</script>

<template>
  <NuxtLayout>
    <GlobalNotification />
    <NuxtPage />
  </NuxtLayout>
</template>
