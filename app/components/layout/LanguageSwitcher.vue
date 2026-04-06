<script setup lang="ts">
// i18n
const { locale, locales, setLocale } = useI18n();

// Language switcher state
const showDropdown = ref(false);

// Get available locales with flag emojis
const languages = computed(() => {
  const flags: Record<string, string> = {
    id: '🇮🇩',
    en: '🇺🇸',
  };
  
  return (locales.value as Array<{ code: string; name: string }>).map(l => ({
    code: l.code,
    name: l.name,
    flag: flags[l.code] || '🌐',
  }));
});

const setLanguage = async (code: string) => {
  await setLocale(code as 'id' | 'en');
  showDropdown.value = false;
};

const currentLanguage = computed(() => languages.value.find(l => l.code === locale.value));

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.lang-dropdown-container')) {
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
  <div class="relative lang-dropdown-container">
    <button
      class="flex items-center gap-1.5 px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
      @click="showDropdown = !showDropdown"
    >
      <span class="text-lg">{{ currentLanguage?.flag }}</span>
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <!-- Language Dropdown -->
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
        class="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          :class="{ 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400': locale === lang.code }"
          @click="setLanguage(lang.code)"
        >
          <span class="text-lg">{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
