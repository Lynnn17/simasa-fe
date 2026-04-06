/**
 * useTranslation - Composable wrapper untuk i18n
 * 
 * Mempermudah penggunaan i18n dalam script dengan cara:
 * const { t, locale, setLang, isLang } = useTranslation();
 */
export const useTranslation = () => {
    const { t, locale, locales, setLocale } = useI18n();

    /**
     * Translate key
     * @example t('common.save') // 'Simpan' atau 'Save'
     */
    const translate = (key: string, params?: Record<string, any>) => {
        return t(key, params || {});
    };

    /**
     * Get current locale code
     * @returns 'id' | 'en'
     */
    const currentLocale = computed(() => locale.value);

    /**
     * Check if current locale matches
     * @example isLang('id') // true jika bahasa Indonesia
     */
    const isLang = (code: string) => locale.value === code;

    /**
     * Set language/locale
     * @example setLang('en') // switch to English
     */
    const setLang = async (code: 'id' | 'en') => {
        await setLocale(code);
    };

    /**
     * Get all available locales
     */
    const availableLocales = computed(() => {
        return (locales.value as Array<{ code: string; name: string }>).map(l => ({
            code: l.code,
            name: l.name,
        }));
    });

    /**
     * Toggle between ID and EN
     */
    const toggleLang = async () => {
        const newLang = locale.value === 'id' ? 'en' : 'id';
        await setLocale(newLang);
    };

    /**
     * Translate with fallback
     * @example tf('custom.key', 'Default Text')
     */
    const tf = (key: string, fallback: string, params?: Record<string, any>) => {
        const result = t(key, params || {});
        // If translation returns the key itself, use fallback
        return result === key ? fallback : result;
    };

    return {
        // Core translation
        t: translate,
        tf,

        // Locale management
        locale: currentLocale,
        setLang,
        isLang,
        toggleLang,
        availableLocales,

        // Raw i18n access for advanced usage
        i18n: { t, locale, locales, setLocale },
    };
};
