import { ref, watch, onUnmounted } from "vue";

// === SHARED STATE (singleton across all components) ===
const eventSource = ref<EventSource | null>(null);
const isConnected = ref(false);
const listeners = new Map<string, Set<(data: any) => void>>();

export const useSocket = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  const connect = () => {
    if (eventSource.value) return;

    const user = authStore.user;
    if (!user) return;

    const baseUrl = config.public.sseUrl;
    const url = `${baseUrl}/events?userId=${user.id}&roleId=${user.roleId}`;

    console.log("Connecting SSE to:", url);
    const es = new EventSource(url);

    es.addEventListener("connected", () => {
      isConnected.value = true;
      console.log("✅ SSE Connected successfully");
    });

    es.onerror = () => {
      console.error("❌ SSE Connection error, will auto-reconnect...");
      isConnected.value = false;
    };

    // Attach all existing listeners to the new EventSource
    listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        es.addEventListener(event, (e: MessageEvent) => {
          try {
            callback(JSON.parse(e.data));
          } catch {
            callback(e.data);
          }
        });
      });
    });

    eventSource.value = es;
  };

  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
      isConnected.value = false;
      console.log("SSE Disconnected");
    }
  };

  const onEvent = (event: string, callback: (data: any) => void) => {
    // Store listener globally
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(callback);

    // If EventSource already exists, attach listener immediately
    if (eventSource.value) {
      eventSource.value.addEventListener(event, (e: MessageEvent) => {
        try {
          callback(JSON.parse(e.data));
        } catch {
          callback(e.data);
        }
      });
    }

    onUnmounted(() => {
      listeners.get(event)?.delete(callback);
    });
  };

  return {
    isConnected,
    connect,
    disconnect,
    onEvent,
  };
};
