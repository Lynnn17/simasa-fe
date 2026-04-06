<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();

// Active tab
const activeTab = ref('account');
const tabs = [
  { id: 'account', label: 'Akun', icon: 'user' },
  { id: 'security', label: 'Keamanan', icon: 'lock' },
  { id: 'activity', label: 'Aktivitas', icon: 'clock' },
];

// User profile data
const profile = ref({
  name: authStore.user?.name || 'John Doe',
  email: authStore.user?.email || 'john.doe@example.com',
  phone: '+62 812 3456 7890',
  address: 'Jakarta, Indonesia',
  bio: 'Passionate learner with a focus on web development and design.',
  avatar: '',
});

// Edit mode
const isEditing = ref(false);
const editedProfile = ref({ ...profile.value });

const startEditing = () => {
  editedProfile.value = { ...profile.value };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const saveProfile = () => {
  profile.value = { ...editedProfile.value };
  isEditing.value = false;
  // TODO: Save to backend
};

// Password change
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordError = ref('');
const passwordSuccess = ref(false);

const changePassword = () => {
  passwordError.value = '';
  passwordSuccess.value = false;
  
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    passwordError.value = 'Harap isi semua field';
    return;
  }
  
  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'Password minimal 8 karakter';
    return;
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Password tidak cocok';
    return;
  }
  
  // TODO: Save to backend
  passwordSuccess.value = true;
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
  
  setTimeout(() => {
    passwordSuccess.value = false;
  }, 3000);
};

// Stats
const stats = [
  { label: 'Courses Enrolled', value: 12, icon: 'book', color: 'primary' },
  { label: 'Completed', value: 8, icon: 'check', color: 'emerald' },
  { label: 'In Progress', value: 4, icon: 'clock', color: 'amber' },
  { label: 'Certificates', value: 5, icon: 'award', color: 'violet' },
];

// Activity
const recentActivity = [
  { id: 1, action: 'Completed quiz', course: 'Advanced JavaScript', time: '2 hours ago', type: 'quiz' },
  { id: 2, action: 'Started new course', course: 'React Fundamentals', time: '1 day ago', type: 'course' },
  { id: 3, action: 'Earned certificate', course: 'Vue.js Mastery', time: '3 days ago', type: 'certificate' },
  { id: 4, action: 'Submitted assignment', course: 'Node.js Backend', time: '1 week ago', type: 'assignment' },
  { id: 5, action: 'Updated profile', course: 'Account Settings', time: '2 weeks ago', type: 'assignment' },
  { id: 6, action: 'Changed password', course: 'Security', time: '1 month ago', type: 'quiz' },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Profil Saya</h1>
      <p class="text-slate-500 dark:text-slate-400">Kelola informasi akun Anda</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="lg:col-span-1">
        <UiCard>
          <div class="text-center py-6">
            <!-- Avatar -->
            <div class="relative inline-block">
              <UiAvatar :name="profile.name" size="xl" class="ring-4 ring-primary-100 dark:ring-primary-900/30" />
              <button class="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors shadow-lg">
                <UiIcon name="mdi-camera" size="sm" />
              </button>
            </div>
            
            <h3 class="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{{ profile.name }}</h3>
            <p class="text-slate-500 dark:text-slate-400">{{ typeof authStore.user?.role === 'object' ? authStore.user?.role?.name : authStore.user?.role || 'Student' }}</p>
            
            <!-- Contact Info -->
            <div class="mt-6 space-y-3 text-left px-4">
              <div class="flex items-center gap-3 text-sm">
                <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <UiIcon name="mdi-email-outline" size="sm" color="primary" />
                </div>
                <span class="text-slate-600 dark:text-slate-400">{{ profile.email }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <UiIcon name="mdi-phone-outline" size="sm" color="success" />
                </div>
                <span class="text-slate-600 dark:text-slate-400">{{ profile.phone }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <UiIcon name="mdi-map-marker-outline" size="sm" color="warning" />
                </div>
                <span class="text-slate-600 dark:text-slate-400">{{ profile.address }}</span>
              </div>
            </div>

            <!-- Bio -->
            <div class="mt-6 px-4">
              <p class="text-sm text-slate-500 dark:text-slate-400 italic">"{{ profile.bio }}"</p>
            </div>

            <!-- Edit Button -->
            <div class="mt-6 px-4">
              <UiButton 
                color="primary"
                variant="filled"
                class="w-full"
                @click="startEditing"
              >
                Ubah Profil
              </UiButton>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tabs Navigation -->
        <div class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
            :class="activeTab === tab.id 
              ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            @click="activeTab = tab.id"
          >
            <svg v-if="tab.icon === 'user'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <svg v-if="tab.icon === 'lock'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <svg v-if="tab.icon === 'clock'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ tab.label }}
          </button>
        </div>

        <!-- Account Tab -->
        <template v-if="activeTab === 'account'">
        <!-- Edit Profile Form -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-slate-900 dark:text-white">Ubah Profil</h3>
          </template>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UiInput 
                v-model="editedProfile.name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
              />
              <UiInput 
                v-model="editedProfile.email"
                type="email"
                label="Email"
                placeholder="Masukkan email"
              />
              <UiInput 
                v-model="editedProfile.phone"
                type="tel"
                label="No. Telepon"
                placeholder="Masukkan no. telepon"
              />
              <UiInput 
                v-model="editedProfile.address"
                label="Alamat"
                placeholder="Masukkan alamat"
              />
            </div>
            <UiTextarea 
              v-model="editedProfile.bio"
              label="Bio"
              placeholder="Ceritakan tentang diri Anda"
              :rows="3"
            />
            <div class="flex gap-3 justify-end pt-2">
              <UiButton 
                variant="ghost"
                color="secondary"
                @click="cancelEditing"
              >
                Batal
              </UiButton>
              <UiButton 
                color="primary"
                @click="saveProfile"
              >
                Simpan Perubahan
              </UiButton>
            </div>
          </div>
        </UiCard>
        </template>

        <!-- Security Tab -->
        <template v-if="activeTab === 'security'">
          <UiCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <UiIcon name="mdi-lock-outline" size="lg" color="error" />
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white">Ubah Password</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">Perbarui password akun Anda</p>
                </div>
              </div>
            </template>

            <!-- Success Message -->
            <div v-if="passwordSuccess" class="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div class="flex items-center gap-3">
                <UiIcon name="mdi-check-circle-outline" size="lg" color="success" />
                <p class="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Password berhasil diubah</p>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="passwordError" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-700 dark:text-red-400 font-medium">{{ passwordError }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Current Password -->
              <UiInput 
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                label="Password Saat Ini"
                placeholder="Masukkan password saat ini"
              >
                <template #suffix>
                  <button 
                    type="button"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <svg v-if="showCurrentPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </template>
              </UiInput>

              <!-- New Password -->
              <div>
                <UiInput 
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  label="Password Baru"
                  placeholder="Masukkan password baru"
                >
                  <template #suffix>
                    <button 
                      type="button"
                      class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <svg v-if="showNewPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </template>
                </UiInput>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Password minimal 8 karakter</p>
              </div>

              <!-- Confirm New Password -->
              <UiInput 
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Konfirmasi Password Baru"
                placeholder="Masukkan ulang password baru"
              >
                <template #suffix>
                  <button 
                    type="button"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </template>
              </UiInput>

              <div class="flex justify-end pt-2">
                <UiButton 
                  color="primary"
                  @click="changePassword"
                >
                  Perbarui Password
                </UiButton>
              </div>
            </div>
          </UiCard>

          <!-- Two Factor Authentication -->
          <UiCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <UiIcon name="mdi-shield-check-outline" size="lg" color="success" />
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white">Autentikasi Dua Faktor</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">Tambahkan lapisan keamanan ekstra ke akun Anda</p>
                </div>
              </div>
            </template>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Status: <span class="font-medium text-red-500">Nonaktif</span>
                </p>
              </div>
              <UiButton color="success" size="sm">
                Aktifkan 2FA
              </UiButton>
            </div>
          </UiCard>
        </template>

        <!-- Activity Tab -->
        <template v-if="activeTab === 'activity'">
           <!-- Stats Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              v-for="stat in stats" 
              :key="stat.label"
              class="card p-4 text-center"
            >
              <div 
                class="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                :class="{
                  'bg-primary-100 dark:bg-primary-900/30': stat.color === 'primary',
                  'bg-emerald-100 dark:bg-emerald-900/30': stat.color === 'emerald',
                  'bg-amber-100 dark:bg-amber-900/30': stat.color === 'amber',
                  'bg-violet-100 dark:bg-violet-900/30': stat.color === 'violet',
                }"
              >
                <svg 
                  v-if="stat.icon === 'book'" 
                  class="w-6 h-6 text-primary-500" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <svg 
                  v-if="stat.icon === 'check'" 
                  class="w-6 h-6 text-emerald-500" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg 
                  v-if="stat.icon === 'clock'" 
                  class="w-6 h-6 text-amber-500" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg 
                  v-if="stat.icon === 'award'" 
                  class="w-6 h-6 text-violet-500" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stat.value }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
            </div>
          </div>

          <UiCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h3>
                <a href="#" class="text-sm text-primary-500 hover:text-primary-600">Lihat Semua</a>
              </div>
            </template>
            <div class="space-y-4">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="flex items-center gap-4"
              >
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="{
                    'bg-primary-100 dark:bg-primary-900/30': activity.type === 'quiz',
                    'bg-cyan-100 dark:bg-cyan-900/30': activity.type === 'course',
                    'bg-emerald-100 dark:bg-emerald-900/30': activity.type === 'certificate',
                    'bg-amber-100 dark:bg-amber-900/30': activity.type === 'assignment',
                  }"
                >
                  <svg 
                    v-if="activity.type === 'quiz'"
                    class="w-5 h-5 text-primary-500" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <svg 
                    v-if="activity.type === 'course'"
                    class="w-5 h-5 text-cyan-500" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <svg 
                    v-if="activity.type === 'certificate'"
                    class="w-5 h-5 text-emerald-500" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <svg 
                    v-if="activity.type === 'assignment'"
                    class="w-5 h-5 text-amber-500" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ activity.action }}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ activity.course }}</p>
                </div>
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ activity.time }}</span>
              </div>
            </div>
          </UiCard>
        </template>
      </div>
    </div>
  </div>
</template>
