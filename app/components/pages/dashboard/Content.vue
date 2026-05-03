<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import internshipLogbookService from "@/services/internship-logbook.service";

const authStore = useAuthStore();
const userRole = computed(() => authStore.getUserRole);
const userName = computed(() => authStore.user?.name || "User");

// Role Checks
const isStudent = computed(() => userRole.value === 'HA02' || userRole.value === 'Mahasiswa');
const isHRD = computed(() => userRole.value === 'HA03' || userRole.value === 'HRD');
const isMentor = computed(() => userRole.value === 'HA04' || userRole.value === 'Mentor');
const isSuperadmin = computed(() => userRole.value === 'HA01' || userRole.value === 'Superadmin');

const logbookService = internshipLogbookService();
const hasFilledLogbookToday = ref(true);
const isCheckingLogbook = ref(false);

const todayDate = computed(() => {
  return new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());
});

const checkLogbookStatus = async () => {
  if (!isStudent.value || !authStore.user?.id) return;
  
  isCheckingLogbook.value = true;
  try {
    const res: any = await logbookService.getStudentHistory(authStore.user.id);
    const logbooks = res?.data || [];
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogbook = logbooks.find((l: any) => {
      if (!l.logDate) return false;
      const logDate = new Date(l.logDate).toISOString().split('T')[0];
      return logDate === today;
    });
    
    hasFilledLogbookToday.value = !!todayLogbook;
  } catch (error) {
    console.error("Failed to check logbook status", error);
  } finally {
    isCheckingLogbook.value = false;
  }
};

onMounted(() => {
  if (isStudent.value) {
    checkLogbookStatus();
  }
});
</script>

<template>
  <div class="w-full space-y-8 animate-fade-in pb-10">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 shadow-xl shadow-primary-500/20 text-white">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold">Selamat Datang, {{ userName }}!</h1>
          <p class="mt-2 text-primary-100 opacity-90 max-w-md">
            Anda login sebagai <span class="font-bold border-b-2 border-primary-400 pb-0.5">{{ isSuperadmin ? 'Superadmin' : isStudent ? 'Mahasiswa' : isHRD ? 'HRD' : 'Mentor' }}</span>. 
            Semoga hari Anda menyenangkan dan produktif hari ini.
          </p>
          <div class="mt-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <UiIcon name="mdi-calendar" size="sm" />
            </div>
            <span class="text-sm font-medium">{{ todayDate }}</span>
          </div>
        </div>
        <div class="hidden lg:block shrink-0">
          <div class="relative h-40 w-40">
            <div class="absolute inset-0 animate-pulse rounded-full bg-white/10"></div>
            <div class="absolute inset-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <UiIcon name="mdi-shield-check" size="xl" class="text-primary-100" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Abstract Background Shapes -->
      <div class="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/5"></div>
      <div class="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-primary-400/10"></div>
    </div>

    <!-- Student Logbook Alert -->
    <div v-if="isStudent && !isCheckingLogbook" class="w-full">
      <div v-if="hasFilledLogbookToday" class="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 gap-4 shadow-sm">
        <div class="flex items-start sm:items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-800/50 dark:text-emerald-400">
            <UiIcon name="mdi-check-decagram" size="md" />
          </div>
          <div>
            <h3 class="font-bold text-emerald-900 dark:text-emerald-300">Logbook Hari Ini Selesai!</h3>
            <p class="text-sm text-emerald-700 dark:text-emerald-400/80 mt-0.5">Kerja bagus! Anda sudah mengisi kegiatan magang hari ini.</p>
          </div>
        </div>
        <NuxtLink to="/internship/logbooks/student" class="flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
          Lihat Riwayat <UiIcon name="mdi-arrow-right" size="sm" />
        </NuxtLink>
      </div>
      
      <div v-else class="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 gap-4 shadow-sm">
        <div class="flex items-start sm:items-center gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-800/50 dark:text-red-400">
            <UiIcon name="mdi-alert-octagon" size="md" />
          </div>
          <div>
            <h3 class="font-bold text-red-900 dark:text-red-300">Logbook Belum Terisi</h3>
            <p class="text-sm text-red-700 dark:text-red-400/80 mt-0.5">Jangan lupa mengisi aktivitas harian Anda sebelum jam kerja berakhir ya!</p>
          </div>
        </div>
        <NuxtLink to="/internship/logbooks/student?create=true" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95">
          Isi Sekarang
        </NuxtLink>
      </div>
    </div>

    <!-- Mentor Summary Badges -->
    <div v-if="isMentor" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <UiIcon name="mdi-account-group" size="sm" />
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Bimbingan</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">12 Peserta</p>
          </div>
        </div>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <UiIcon name="mdi-file-clock" size="sm" />
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tugas Submitted</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">5 Menunggu</p>
          </div>
        </div>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UiIcon name="mdi-check-all" size="sm" />
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sudah Dinilai</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">18 Selesai</p>
          </div>
        </div>
      </div>
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <UiIcon name="mdi-book-remove" size="sm" />
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Belum Isi Logbook</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">3 Mahasiswa</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

