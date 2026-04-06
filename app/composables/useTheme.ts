/**
 * Theme management composable with dark/light mode support
 */
export const useTheme = () => {
    const colorMode = useState<"light" | "dark" | "system">("color-mode", () => "system");
    const isDark = useState<boolean>("is-dark", () => false);

    // Initialize theme on client side
    const initTheme = () => {
        if (import.meta.client) {
            // Check localStorage for saved preference
            const saved = localStorage.getItem("color-mode") as "light" | "dark" | "system" | null;
            if (saved) {
                colorMode.value = saved;
            }

            updateTheme();

            // Listen for system preference changes
            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
                if (colorMode.value === "system") {
                    isDark.value = e.matches;
                    applyTheme();
                }
            });
        }
    };

    const updateTheme = () => {
        if (colorMode.value === "system") {
            isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
        } else {
            isDark.value = colorMode.value === "dark";
        }
        applyTheme();
    };

    const applyTheme = () => {
        if (import.meta.client) {
            if (isDark.value) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    };

    const setColorMode = (mode: "light" | "dark" | "system") => {
        colorMode.value = mode;
        if (import.meta.client) {
            localStorage.setItem("color-mode", mode);
        }
        updateTheme();
    };

    const toggleDark = () => {
        if (isDark.value) {
            setColorMode("light");
        } else {
            setColorMode("dark");
        }
    };

    return {
        colorMode,
        isDark,
        initTheme,
        setColorMode,
        toggleDark,
    };
};
