<script setup lang="ts">
import { useConfigStore } from "~/stores/config";
import { getColorPresets } from "~/constants/colors";

const configStore = useConfigStore();
const isOpen = ref(false);

const colorPresets = getColorPresets();

const closePanel = () => {
  isOpen.value = false;
};
</script>

<template>
  <!-- FAB Button -->
  <button
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center group"
    @click="isOpen = true"
  >
    <svg 
      class="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>

  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
      @click="closePanel"
    />
  </Transition>

  <!-- Settings Panel -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="isOpen"
      class="fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Customization</h2>
        <button
          class="p-2 -m-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          @click="closePanel"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-8">
        <!-- Theme Mode -->
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Theme Mode</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all',
                configStore.theme === 'light'
                  ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              ]"
              @click="configStore.setTheme('light')"
            >
              <svg class="w-5 h-5" :class="configStore.theme === 'light' ? 'text-amber-500' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-sm font-medium" :class="configStore.theme === 'light' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">Light</span>
            </button>
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all',
                configStore.theme === 'dark'
                  ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              ]"
              @click="configStore.setTheme('dark')"
            >
              <svg class="w-5 h-5" :class="configStore.theme === 'dark' ? 'text-indigo-500' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span class="text-sm font-medium" :class="configStore.theme === 'dark' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">Dark</span>
            </button>
          </div>
        </div>

        <!-- Primary Color -->
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Primary Color</h3>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="preset in colorPresets"
              :key="preset.value"
              :class="[
                'w-full aspect-square rounded-xl transition-all hover:scale-110',
                configStore.primaryColor === preset.value 
                  ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900' 
                  : ''
              ]"
              :style="{ backgroundColor: preset.color }"
              :title="preset.name"
              @click="configStore.setPrimaryColor(preset.value)"
            />
          </div>
        </div>

        <!-- Sidebar Layout -->
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Sidebar Layout</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all',
                configStore.sidebarLayout === 'vertical' 
                  ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              ]"
              @click="configStore.setSidebarLayout('vertical')"
            >
              <div class="w-6 h-6 border-2 rounded flex overflow-hidden" :class="configStore.sidebarLayout === 'vertical' ? 'border-slate-700 dark:border-slate-300' : 'border-slate-400'">
                <div class="w-2 border-r-2" :class="configStore.sidebarLayout === 'vertical' ? 'border-slate-700 dark:border-slate-300' : 'border-slate-400'" />
                <div class="flex-1" />
              </div>
              <span class="text-sm font-medium" :class="configStore.sidebarLayout === 'vertical' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">Vertical</span>
            </button>
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all',
                configStore.sidebarLayout === 'horizontal' 
                  ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              ]"
              @click="configStore.setSidebarLayout('horizontal')"
            >
              <div class="w-6 h-6 border-2 rounded flex flex-col overflow-hidden" :class="configStore.sidebarLayout === 'horizontal' ? 'border-primary-500' : 'border-slate-400'">
                <div class="h-2 border-b-2" :class="configStore.sidebarLayout === 'horizontal' ? 'border-primary-500' : 'border-slate-400'" />
                <div class="flex-1" />
              </div>
              <span class="text-sm font-medium" :class="configStore.sidebarLayout === 'horizontal' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">Horizontal</span>
            </button>
          </div>
        </div>

        <!-- Content Layout -->
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Content Layout</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all',
                configStore.contentLayout === 'full' 
                  ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              ]"
              @click="configStore.setContentLayout('full')"
            >
              <div class="w-6 h-6 border-2 rounded flex overflow-hidden" :class="configStore.contentLayout === 'full' ? 'border-slate-700 dark:border-slate-300' : 'border-slate-400'">
                <div class="flex-1 m-0.5 rounded-sm" :class="configStore.contentLayout === 'full' ? 'bg-slate-700 dark:bg-slate-300' : 'bg-slate-400'" />
              </div>
              <span class="text-sm font-medium" :class="configStore.contentLayout === 'full' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">Full</span>
            </button>
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all',
                configStore.contentLayout === 'box' 
                  ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              ]"
              @click="configStore.setContentLayout('box')"
            >
              <div class="w-6 h-6 border-2 rounded flex items-center justify-center overflow-hidden" :class="configStore.contentLayout === 'box' ? 'border-primary-500' : 'border-slate-400'">
                <div class="w-3 h-3 rounded-sm" :class="configStore.contentLayout === 'box' ? 'bg-primary-500' : 'bg-slate-400'" />
              </div>
              <span class="text-sm font-medium" :class="configStore.contentLayout === 'box' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">Box</span>
            </button>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            class="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            @click="configStore.resetToDefaults()"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>
