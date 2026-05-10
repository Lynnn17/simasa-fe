import { defineStore } from "pinia";

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  roleId: string;
  status: string;
  role: Role | string;
  avatar?: string;
  organizationId?: number | null;
  institutionId?: number | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  menus?: Array<any>;
  permissions?: Array<any>;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    menus: [],
    permissions: [],
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getMenus: (state) => state.menus,
    getPermissions: (state) => state.permissions,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    getUserRole: (state) => {
      if (state.user?.role && typeof state.user.role === "object") {
        // @ts-ignore
        return state.user.role.name || "guest";
      }
      return state.user?.role || "guest";
    },
  },

  actions: {
    async login(username: string, password: string) {
      this.loading = true;
      try {
        const api = useApi();
        const res: any = await api.post("/user/login", {
          username,
          password,
        });

        const data = res.data || res;
        const accessToken = data.token?.AccessToken || data.token;
        const userData = data.user;

        if (accessToken && userData) {
          // Save token to cookies using useCookie
          const config = useRuntimeConfig();
          const tokenCookie = useCookie(config.public.tokenKey, {
            maxAge: Number(config.public.tokenMaxAge) || 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax" as const,
          });
          tokenCookie.value = accessToken;

          this.token = accessToken;
          this.user = userData;
          this.isAuthenticated = true;
          return { success: true };
        }

        // Return error if no token received
        return {
          success: false,
          error: data.error || data.message || "Login gagal",
        };
      } catch (error: any) {
        this.logout();
        return {
          success: false,
          error:
            error.response?._data?.error ||
            error.response?._data?.message ||
            error.message ||
            "Login gagal",
        };
      } finally {
        this.loading = false;
      }
    },

    logout() {
      // Accessing config and cookies safely
      try {
        const config = useRuntimeConfig();
        const tokenCookie = useCookie(config.public.tokenKey);
        tokenCookie.value = null;
      } catch (e) {
        // Fallback for context-less calls
        console.warn("Cookie could not be cleared due to lost Nuxt context");
      }

      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.menus = [];
      this.permissions = [];
    },

    setUser(user: User) {
      this.user = user;
    },

    setToken(token: string) {
      // Save token to cookies using useCookie
      const config = useRuntimeConfig();
      const tokenCookie = useCookie(config.public.tokenKey, {
        maxAge: Number(config.public.tokenMaxAge),
        path: "/",
        sameSite: "lax" as const,
      });
      tokenCookie.value = token;

      this.token = token;
      this.isAuthenticated = true;
    },

    // Sync token from cookies to store
    syncFromCookies() {
      const config = useRuntimeConfig();
      const tokenCookie = useCookie(config.public.tokenKey);
      if (tokenCookie.value && !this.token) {
        this.token = tokenCookie.value;
        this.isAuthenticated = true;
      }
    },

    // Check if session is still valid
    async checkAuth() {
      // Check cookie first using useCookie
      const config = useRuntimeConfig();
      const tokenCookie = useCookie(config.public.tokenKey);
      if (tokenCookie.value && !this.token) {
        this.token = tokenCookie.value;
        this.isAuthenticated = true;
      }

      if (!this.token) {
        return false;
      }
      // In real app, validate token with API
      return this.isAuthenticated;
    },

    async loadAuthMenu(payload: any) {
      let permissions: any = [];
      const api = useApi();
      await api
        .get("/menu-role", {
          params: {
            roleId: payload.roleId,
          },
        })
        .then((res: any) => {
          const data = Array.isArray(res) ? res : res.data || [];
          this.menus = data;

          data.forEach((el: any) => {
            if (el.permissionLabel && el.action) {
              permissions.push(`${el.permissionLabel}.${el.action}`);
            }
            if (el.permissionList && Array.isArray(el.permissionList)) {
              el.permissionList.forEach((els: any) => {
                permissions.push(els);
              });
            }

            // Process children
            if (el.children && Array.isArray(el.children)) {
              el.children.forEach((el2: any) => {
                if (el2.permissionLabel && el2.action) {
                  permissions.push(`${el2.permissionLabel}.${el2.action}`);
                }

                if (el2.permissionList && Array.isArray(el2.permissionList)) {
                  el2.permissionList.forEach((els2: any) => {
                    permissions.push(els2);
                  });
                }
              });
            }
          });

          this.permissions = permissions;
        })
        .catch((err) => {
          if (err.data) {
            useSwal().toast(err.data.message, "error");
          }
          return err;
        });
    },
  },

  // Persist state to localStorage (token now stored in cookies)
  persist: {
    key: "auth",
    storage: typeof window !== "undefined" ? localStorage : undefined,
    pick: ["user", "isAuthenticated", "menus", "permissions"],
  },
});
