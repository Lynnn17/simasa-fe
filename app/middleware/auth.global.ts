import { useAuthStore } from "~/stores/auth";

// Track if menus have been loaded in this session
let menusLoadedThisSession = false;

export default defineNuxtRouteMiddleware(async (to) => {
    // Skip middleware on server-side to avoid hydration issues
    // Pinia persistence only works on client-side
    if (import.meta.server) {
        return;
    }

    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const tokenCookie = useCookie(config.public.tokenKey);

    // Sync token from cookies to store if not already synced
    if (tokenCookie.value && !authStore.token) {
        authStore.token = tokenCookie.value;
        authStore.isAuthenticated = true;
    }

    const publicRoutes = ["/login", "/login-v2", "/login-v3", "/register", "/forgot-password", "/logout", "/course"];

    // If user is already authenticated and trying to access login, redirect to dashboard
    const hasToken = !!authStore.token || !!tokenCookie.value;
    const isAuthenticated = authStore.isAuthenticated && hasToken;

    if (isAuthenticated && (to.path === "/login" || to.path === "/" || to.path === "/register")) {
        const roleId = authStore.user?.roleId;
        let target = "/";

        if (roleId === "HA03") {
            target = "/hrd/dashboard";
        } else if (roleId === "HA04") {
            target = "/internship/logbooks/mentor";
        } else if (roleId === "HA02") {
            target = "/internship/logbooks/student";
        }
        
        return navigateTo(target, { external: true });
    }

    if (publicRoutes.includes(to.path)) {
        menusLoadedThisSession = false;
        return;
    }


    if (!isAuthenticated) {
        menusLoadedThisSession = false;
        return navigateTo("/login", { external: true });
    }

    // Load menus on first navigation of this session (after page refresh or login)
    // This ensures menus are always fresh from API
    if (authStore.user?.roleId && !menusLoadedThisSession) {
        await authStore.loadAuthMenu({
            roleId: authStore.user.roleId,
        });
        menusLoadedThisSession = true;
    }

    // ============ RBAC Permission Check ============
    // Check if route has permission requirement in meta
    const requiredPermission = to.meta.permission as string | undefined;

    if (requiredPermission) {
        const permissions = authStore.permissions || [];
        if (permissions.length === 0 && !menusLoadedThisSession) {
            // Allow first navigation after login - permissions will be checked on next navigation
            return;
        }

        const hasPermission = permissions.includes(requiredPermission);

        if (!hasPermission) {
            useSwal().toast("Anda tidak memiliki akses ke halaman ini", 'error');
            return navigateTo("/logout");
        }
    }
});

