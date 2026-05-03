<script setup lang="ts">
/**
 * NotificationDropdown - Global bell icon with unread indicator and list
 */
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
const showDropdown = ref(false);

const handleNotifClick = (notif: any) => {
  markAsRead(notif.id);
  if (notif.link) {
    navigateTo(notif.link);
  }
  showDropdown.value = false;
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

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'task': return 'mdi-clipboard-text-outline';
    case 'grade': return 'mdi-star-outline';
    case 'revision': return 'mdi-alert-circle-outline';
    case 'registration': return 'mdi-account-plus-outline';
    case 'logbook': return 'mdi-book-open-outline';
    default: return 'mdi-bell-outline';
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'task': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    case 'grade': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    case 'revision': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
    case 'registration': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case 'logbook': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
    default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};
</script>

<template>
  <div class="relative notification-dropdown-container">
    <button
      class="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative group active:scale-95"
      @click="showDropdown = !showDropdown"
      :title="`Notifikasi (${unreadCount})`"
    >
      <i class="mdi mdi-bell-outline text-xl group-hover:scale-110 transition-transform"></i>
      <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </span>
    </button>
    
    <!-- Notifications Dropdown -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Notifikasi</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5" v-if="unreadCount > 0">
              Anda memiliki {{ unreadCount }} pesan belum dibaca
            </p>
          </div>
          <button
            v-if="unreadCount > 0"
            class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            @click="markAllAsRead"
          >
            Baca Semua
          </button>
        </div>
        
        <!-- Notification List -->
        <div class="max-h-[400px] overflow-y-auto">
          <div v-if="notifications.length === 0" class="py-12 flex flex-col items-center justify-center text-center px-6">
            <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
              <i class="mdi mdi-bell-off-outline text-3xl"></i>
            </div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada notifikasi</p>
            <p class="text-xs text-slate-400 mt-1">Kami akan memberi tahu Anda jika ada info terbaru.</p>
          </div>
          
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="group px-5 py-4 border-b border-slate-50 dark:border-slate-700/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors relative"
            :class="{ 'bg-primary-50/30 dark:bg-primary-900/10': !notif.read }"
            @click="handleNotifClick(notif)"
          >
            <div class="flex items-start gap-4">
              <!-- Category Icon -->
              <div 
                class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-transparent transition-transform group-hover:scale-110"
                :class="getCategoryColor(notif.category)"
              >
                <i :class="['mdi text-xl', getCategoryIcon(notif.category)]"></i>
              </div>

              <!-- Text Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-bold text-slate-900 dark:text-white truncate pr-4">{{ notif.title }}</p>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap pt-0.5 font-medium">{{ formatTime(notif.timestamp) }}</span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{{ notif.message }}</p>
                
                <div v-if="!notif.read" class="absolute top-4 right-5 w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 text-center">
          <button 
            class="text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            @click="showDropdown = false"
          >
            Tutup Panel
          </button>
        </div>

      </div>
    </Transition>
  </div>
</template>

