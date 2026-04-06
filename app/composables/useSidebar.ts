/**
 * Sidebar state management composable
 */
export const useSidebar = () => {
    const isCollapsed = useState<boolean>("sidebar-collapsed", () => false);
    const isMobileOpen = useState<boolean>("sidebar-mobile-open", () => false);

    const toggle = () => {
        isCollapsed.value = !isCollapsed.value;
    };

    const collapse = () => {
        isCollapsed.value = true;
    };

    const expand = () => {
        isCollapsed.value = false;
    };

    const toggleMobile = () => {
        isMobileOpen.value = !isMobileOpen.value;
    };

    const openMobile = () => {
        isMobileOpen.value = true;
    };

    const closeMobile = () => {
        isMobileOpen.value = false;
    };

    return {
        isCollapsed,
        isMobileOpen,
        toggle,
        collapse,
        expand,
        toggleMobile,
        openMobile,
        closeMobile,
    };
};
