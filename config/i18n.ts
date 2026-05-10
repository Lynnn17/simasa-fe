export const i18nConfig = {
    locales: [
        { code: 'id', name: 'Indonesia', iso: 'id-ID' },
        { code: 'en', name: 'English', iso: 'en-US' },
    ],
    defaultLocale: 'id' as const,
    strategy: 'no_prefix' as const,
    bundle: {
        optimizeTranslationDirective: false
    },
    detectBrowserLanguage: false,
}

