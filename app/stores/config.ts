import { defineStore } from "pinia";
import { COLOR_PALETTE } from "~/constants/colors";

export interface AppConfig {
    // Theme settings
    theme: "light" | "dark" | "system";
    primaryColor: string;

    // Sidebar settings
    sidebarLayout: "vertical" | "horizontal";
    sidebarCollapsed: boolean;
    contentLayout: "full" | "box";

    // App settings
    language: string;
    pageSize: number;
    dateFormat: string;

    // Notification settings
    emailNotifications: boolean;
    pushNotifications: boolean;
}

const defaultConfig: AppConfig = {
    theme: "light",
    primaryColor: COLOR_PALETTE.red,
    sidebarLayout: "vertical",
    sidebarCollapsed: false,
    contentLayout: "full",
    language: "id",
    pageSize: 10,
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    pushNotifications: true,
};

export const useConfigStore = defineStore("config", {
    state: (): AppConfig => ({ ...defaultConfig }),

    getters: {
        isDarkTheme: (state) => {
            if (state.theme === "system") {
                if (typeof window !== "undefined") {
                    return window.matchMedia("(prefers-color-scheme: dark)").matches;
                }
                return false;
            }
            return state.theme === "dark";
        },
    },

    actions: {
        setTheme(theme: "light" | "dark" | "system") {
            this.theme = theme;
            this.applyTheme();
        },

        toggleTheme() {
            if (this.theme === "light") {
                this.setTheme("dark");
            } else if (this.theme === "dark") {
                this.setTheme("light");
            } else {
                // If system, toggle based on current dark state
                const isDark = this.isDarkTheme;
                this.setTheme(isDark ? "light" : "dark");
            }
        },

        applyTheme() {
            if (typeof window === "undefined") return;

            let isDark = false;
            if (this.theme === "system") {
                isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            } else {
                isDark = this.theme === "dark";
            }

            if (isDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        },

        setPrimaryColor(hex: string) {
            this.primaryColor = hex;
            this.applyPrimaryColor();
        },

        applyPrimaryColor() {
            if (typeof window === "undefined") return;

            const color = this.primaryColor;
            const root = document.documentElement;
            
            // Only set the base color, all shades are derived from this via CSS color-mix
            root.style.setProperty("--color-primary-base", color);
        },

        setSidebarLayout(layout: "vertical" | "horizontal") {
            this.sidebarLayout = layout;
        },

        setSidebarCollapsed(collapsed: boolean) {
            this.sidebarCollapsed = collapsed;
        },

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },

        setContentLayout(layout: "full" | "box") {
            this.contentLayout = layout;
        },

        setLanguage(lang: string) {
            this.language = lang;
        },

        setPageSize(size: number) {
            this.pageSize = size;
        },

        setDateFormat(format: string) {
            this.dateFormat = format;
        },

        setEmailNotifications(enabled: boolean) {
            this.emailNotifications = enabled;
        },

        setPushNotifications(enabled: boolean) {
            this.pushNotifications = enabled;
        },

        resetToDefaults() {
            Object.assign(this, defaultConfig);
            this.applyTheme();
            this.applyPrimaryColor();
        },

        // Initialize store - apply saved settings
        initConfig() {
            this.applyTheme();
            this.applyPrimaryColor();
        },
    },

    // Persist entire config to localStorage
    persist: {
        key: "app-config",
        storage: typeof window !== "undefined" ? localStorage : undefined,
    },
});
