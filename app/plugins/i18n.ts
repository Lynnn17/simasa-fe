import id from '../locales/id.json';
import en from '../locales/en.json';

export default defineNuxtPlugin((nuxtApp) => {
    // Wait for i18n to be available
    // Using 'any' cast to avoid TypeScript errors with injected properties
    const i18n = nuxtApp.$i18n as any;

    // Guard clause if i18n is not initialized
    if (!i18n || !i18n.setLocaleMessage) return;

    // Manually merge locale messages imported from JSON files
    // This approach keeps the messages in standard .json files
    i18n.setLocaleMessage('id', id);
    i18n.setLocaleMessage('en', en);
});
