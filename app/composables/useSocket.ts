import { ref, onUnmounted } from "vue";

// === SHARED STATE (singleton across all components) ===
const eventSource = ref<EventSource | null>(null);
const isConnected = ref(false);

// Map<eventName, Map<callbackFn, wrappedListenerFn>>
// We store the wrapped listener so we can properly removeEventListener later
const listenerRegistry = new Map<
  string,
  Map<(data: any) => void, (e: MessageEvent) => void>
>();

function wrapCallback(callback: (data: any) => void) {
  return (e: MessageEvent) => {
    try {
      callback(JSON.parse(e.data));
    } catch {
      callback(e.data);
    }
  };
}

export const useSocket = () => {
  const authStore = useAuthStore();

  const connect = () => {
    if (eventSource.value) return;

    const user = authStore.user;
    if (!user) return;

    const url = `/sse/events?userId=${user.id}&roleId=${user.roleId}`;
    console.log("🔌 Connecting SSE to:", url);

    const es = new EventSource(url);

    es.addEventListener("connected", () => {
      isConnected.value = true;
      console.log("✅ SSE Connected successfully");
    });

    es.onerror = () => {
      console.error("❌ SSE Connection error, will auto-reconnect...");
      isConnected.value = false;
    };

    // Re-attach all previously registered listeners to the new EventSource
    listenerRegistry.forEach((callbackMap, event) => {
      callbackMap.forEach((wrapped) => {
        es.addEventListener(event, wrapped);
      });
    });

    eventSource.value = es;
  };

  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
      isConnected.value = false;
      console.log("🔌 SSE Disconnected");
    }
  };

  const onEvent = (event: string, callback: (data: any) => void) => {
    const wrapped = wrapCallback(callback);

    // Register in the global registry
    if (!listenerRegistry.has(event)) {
      listenerRegistry.set(event, new Map());
    }
    listenerRegistry.get(event)!.set(callback, wrapped);

    // If EventSource already exists, attach the wrapped listener immediately
    if (eventSource.value) {
      eventSource.value.addEventListener(event, wrapped);
    }

    // Properly clean up when the component using this unmounts
    onUnmounted(() => {
      // Remove from EventSource
      if (eventSource.value) {
        eventSource.value.removeEventListener(event, wrapped);
      }
      // Remove from global registry
      listenerRegistry.get(event)?.delete(callback);
      if (listenerRegistry.get(event)?.size === 0) {
        listenerRegistry.delete(event);
      }
    });
  };

  return {
    isConnected,
    connect,
    disconnect,
    onEvent,
  };
};
