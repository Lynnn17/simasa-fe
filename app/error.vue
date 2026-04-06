<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

const errorCode = computed(() => props.error?.statusCode || 500);
const errorMessage = computed(() => {
  if (errorCode.value === 404) {
    return "Page Not Found";
  }
  if (errorCode.value === 403) {
    return "Access Denied";
  }
  if (errorCode.value === 500) {
    return "Something Went Wrong";
  }
  return props.error?.message || "An Error Occurred";
});

const errorDescription = computed(() => {
  if (errorCode.value === 404) {
    return "The page you're looking for doesn't exist or has been moved.";
  }
  if (errorCode.value === 403) {
    return "You don't have permission to access this resource.";
  }
  if (errorCode.value === 500) {
    return "We're experiencing some technical difficulties. Please try again later.";
  }
  return "Please try again or contact support if the problem persists.";
});

const handleGoHome = () => {
  clearError({ redirect: '/' });
};

const handleGoBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    clearError({ redirect: '/' });
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
    </div>

    <!-- Content -->
    <div class="relative text-center max-w-2xl mx-auto">
      <!-- 404 Illustration -->
      <div class="mb-8 relative">
        <svg 
          class="w-64 h-64 sm:w-80 sm:h-80 mx-auto" 
          viewBox="0 0 400 300" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Background circle -->
          <circle cx="200" cy="150" r="120" fill="url(#gradient1)" opacity="0.1"/>
          
          <!-- Main monitor/screen -->
          <rect x="100" y="60" width="200" height="140" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
          <rect x="110" y="70" width="180" height="115" rx="6" fill="#0f172a"/>
          
          <!-- Error content on screen -->
          <text x="200" y="130" text-anchor="middle" fill="url(#gradient2)" font-size="48" font-weight="bold" font-family="system-ui">
            {{ errorCode }}
          </text>
          <rect x="140" y="145" width="120" height="3" rx="1.5" fill="#475569"/>
          <rect x="155" y="155" width="90" height="3" rx="1.5" fill="#334155"/>
          
          <!-- Screen stand -->
          <path d="M180 200 L220 200 L230 230 L170 230 Z" fill="#1e293b"/>
          <rect x="160" y="230" width="80" height="8" rx="2" fill="#334155"/>
          
          <!-- Floating elements -->
          <circle cx="80" cy="100" r="8" fill="#3b82f6" opacity="0.6" class="animate-float"/>
          <circle cx="320" cy="120" r="6" fill="#8b5cf6" opacity="0.5" class="animate-float" style="animation-delay: 0.5s"/>
          <circle cx="90" cy="200" r="5" fill="#06b6d4" opacity="0.4" class="animate-float" style="animation-delay: 1s"/>
          <circle cx="310" cy="220" r="7" fill="#f97316" opacity="0.5" class="animate-float" style="animation-delay: 1.5s"/>
          
          <!-- Question marks -->
          <text x="70" y="160" fill="#475569" font-size="24" font-weight="bold" opacity="0.6">?</text>
          <text x="330" cy="180" fill="#475569" font-size="20" font-weight="bold" opacity="0.5">?</text>
          
          <!-- Broken link icon -->
          <g transform="translate(50, 50)">
            <path d="M8 12L4 16M8 12L16 4M8 12L12 8" stroke="#ef4444" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
          </g>
          <g transform="translate(320, 60)">
            <path d="M8 12L4 16M8 12L16 4M8 12L12 8" stroke="#ef4444" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </g>
          
          <!-- Gradients -->
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f87171"/>
              <stop offset="50%" stop-color="#fb923c"/>
              <stop offset="100%" stop-color="#fbbf24"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Error Message -->
      <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">
        {{ errorMessage }}
      </h1>
      <p class="text-lg text-slate-400 mb-10 max-w-md mx-auto">
        {{ errorDescription }}
      </p>

      <!-- Action Buttons - Using consistent UiButton styling -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <UiButton variant="primary" size="lg" @click="handleGoHome">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Homepage
        </UiButton>
        <UiButton variant="secondary" size="lg" @click="handleGoBack">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </UiButton>
      </div>

      <!-- Help Link -->
      <p class="mt-10 text-sm text-slate-500">
        Need help? 
        <NuxtLink to="/support" class="text-primary-400 hover:text-primary-300 underline underline-offset-4 transition-colors">
          Contact Support
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
