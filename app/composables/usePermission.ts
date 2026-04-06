import { useAuthStore } from "~/stores/auth";

export const usePermission = () => {
    const authStore = useAuthStore();

    // Check if user has specific permission (for UI show/hide)
    const hasPermission = (key: string): boolean => {
        const permissions = authStore.permissions || [];
        if (permissions.length === 0) return false;
        return permissions.includes(key);
    };

    // Check and redirect if no permission (for action validation)
    const checkPermission = (key: string) => {
        if (!hasPermission(key)) {
            useSwal().toast("Anda tidak memiliki akses untuk halaman ini", 'error');
            return navigateTo("/logout");
        }
        return true;
    };

    // Check multiple permissions (any of them)
    const hasAnyPermission = (keys: string[]): boolean => {
        return keys.some(key => hasPermission(key));
    };

    // Check multiple permissions (all of them)
    const hasAllPermissions = (keys: string[]): boolean => {
        return keys.every(key => hasPermission(key));
    };

    return {
        hasPermission,
        checkPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};