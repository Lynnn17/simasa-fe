<script setup lang="ts">
const { onEvent } = useSocket();

// Listen for all internal notifications
onEvent("new_notification", (data: any) => {
  //   const { toast } = useSwal();
  // toast(data.message, "info");
  const swalInstance = useSwal();
  swalInstance.fire({
    icon: "info",
    title: data.title || "Notifikasi",
    text: data.message,
    confirmButtonText: "Tutup",
    confirmButtonColor: "#3b82f6",
  });
});
</script>

<template>
  <div class="hidden"></div>
</template>
