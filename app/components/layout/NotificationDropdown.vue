<script setup lang="ts">
// Notifications state
const showDropdown = ref(false);
const notifications = ref([
  { id: 1, title: 'Tugas baru tersedia', message: 'Matematika - Bab 5 telah ditambahkan', time: '5 menit lalu', read: false },
  { id: 2, title: 'Pengumuman', message: 'Ujian semester akan dimulai minggu depan', time: '1 jam lalu', read: false },
  { id: 3, title: 'Nilai diperbarui', message: 'Nilai quiz Bahasa Indonesia telah dirilis', time: '2 jam lalu', read: true },
]);

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

const markAsRead = (id: number) => {
  const notif = notifications.value.find(n => n.id === id);
  if (notif) notif.read = true;
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.notification-dropdown-container')) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative notification-dropdown-container">
    <button
      class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
      @click="showDropdown = !showDropdown"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
        {{ unreadCount }}
      </span>
    </button>
    
    <!-- Notifications Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 class="font-semibold text-slate-900 dark:text-white">Notifikasi</h3>
          <button
            v-if="unreadCount > 0"
            class="text-xs text-primary-500 hover:text-primary-600 font-medium"
            @click="markAllAsRead"
          >
            Tandai semua dibaca
          </button>
        </div>
        
        <!-- Notification List -->
        <div class="max-h-80 overflow-y-auto">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
            :class="{ 'bg-primary-50/50 dark:bg-primary-950/30': !notif.read }"
            @click="markAsRead(notif.id)"
          >
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 mt-2 rounded-full flex-shrink-0" :class="notif.read ? 'bg-transparent' : 'bg-primary-500'"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ notif.title }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{{ notif.message }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ notif.time }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button class="w-full text-sm text-primary-500 hover:text-primary-600 font-medium">
            Lihat semua notifikasi
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
