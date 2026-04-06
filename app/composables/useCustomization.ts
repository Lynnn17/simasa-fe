/**
 * Customization settings composable
 * Manages theme colors, sidebar layout, and other UI customizations
 */
export const useCustomization = () => {
    // Sidebar layout: 'vertical' (left side) or 'horizontal' (top)
    const sidebarLayout = useState<"vertical" | "horizontal">("sidebar-layout", () => "vertical");

    // Primary color presets
    const colorPresets = [
        { name: "Blue", value: "250", color: "#3b82f6" },
        { name: "Purple", value: "280", color: "#8b5cf6" },
        { name: "Green", value: "160", color: "#10b981" },
        { name: "Orange", value: "30", color: "#f97316" },
        { name: "Pink", value: "330", color: "#ec4899" },
        { name: "Cyan", value: "190", color: "#06b6d4" },
        { name: "Red", value: "15", color: "#ef4444" },
        { name: "Teal", value: "175", color: "#14b8a6" },
    ];

    // Current primary color hue (oklch hue value)
    const primaryHue = useState<string>("primary-hue", () => "250");

    // Settings panel visibility
    const isSettingsPanelOpen = useState<boolean>("settings-panel-open", () => false);

    // Initialize customization from localStorage
    const initCustomization = () => {
        if (import.meta.client) {
            const savedLayout = localStorage.getItem("sidebar-layout") as "vertical" | "horizontal" | null;
            if (savedLayout) {
                sidebarLayout.value = savedLayout;
            }

            const savedHue = localStorage.getItem("primary-hue");
            if (savedHue) {
                primaryHue.value = savedHue;
                applyPrimaryColor(savedHue);
            }
        }
    };

    // Apply primary color to CSS variables
    const applyPrimaryColor = (hue: string) => {
        if (import.meta.client) {
            const root = document.documentElement;
            root.style.setProperty("--color-primary-50", `oklch(0.97 0.02 ${hue})`);
            root.style.setProperty("--color-primary-100", `oklch(0.93 0.04 ${hue})`);
            root.style.setProperty("--color-primary-200", `oklch(0.87 0.08 ${hue})`);
            root.style.setProperty("--color-primary-300", `oklch(0.78 0.12 ${hue})`);
            root.style.setProperty("--color-primary-400", `oklch(0.67 0.16 ${hue})`);
            root.style.setProperty("--color-primary-500", `oklch(0.55 0.2 ${hue})`);
            root.style.setProperty("--color-primary-600", `oklch(0.48 0.2 ${hue})`);
            root.style.setProperty("--color-primary-700", `oklch(0.4 0.18 ${hue})`);
            root.style.setProperty("--color-primary-800", `oklch(0.33 0.14 ${hue})`);
            root.style.setProperty("--color-primary-900", `oklch(0.27 0.1 ${hue})`);
            root.style.setProperty("--color-primary-950", `oklch(0.2 0.08 ${hue})`);
        }
    };

    // Set primary color
    const setPrimaryColor = (hue: string) => {
        primaryHue.value = hue;
        if (import.meta.client) {
            localStorage.setItem("primary-hue", hue);
        }
        applyPrimaryColor(hue);
    };

    // Set sidebar layout
    const setSidebarLayout = (layout: "vertical" | "horizontal") => {
        sidebarLayout.value = layout;
        if (import.meta.client) {
            localStorage.setItem("sidebar-layout", layout);
        }
    };

    // Toggle settings panel
    const toggleSettingsPanel = () => {
        isSettingsPanelOpen.value = !isSettingsPanelOpen.value;
    };

    const openSettingsPanel = () => {
        isSettingsPanelOpen.value = true;
    };

    const closeSettingsPanel = () => {
        isSettingsPanelOpen.value = false;
    };

    return {
        sidebarLayout,
        colorPresets,
        primaryHue,
        isSettingsPanelOpen,
        initCustomization,
        setPrimaryColor,
        setSidebarLayout,
        toggleSettingsPanel,
        openSettingsPanel,
        closeSettingsPanel,
    };
};
