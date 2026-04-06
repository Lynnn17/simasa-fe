// Simple toast notification system
interface Toast {
    id: number;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    duration?: number;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export function useToast() {
    const add = (toast: Omit<Toast, "id">) => {
        const id = ++toastId;
        const newToast: Toast = {
            id,
            duration: 5000,
            ...toast,
        };

        toasts.value.push(newToast);

        // Auto remove after duration
        if (newToast.duration) {
            setTimeout(() => {
                remove(id);
            }, newToast.duration);
        }

        return id;
    };

    const remove = (id: number) => {
        const index = toasts.value.findIndex((t) => t.id === id);
        if (index > -1) {
            toasts.value.splice(index, 1);
        }
    };

    const success = (title: string, message?: string) =>
        add({ type: "success", title, message });

    const error = (title: string, message?: string) =>
        add({ type: "error", title, message });

    const warning = (title: string, message?: string) =>
        add({ type: "warning", title, message });

    const info = (title: string, message?: string) =>
        add({ type: "info", title, message });

    const clear = () => {
        toasts.value = [];
    };

    return {
        toasts: readonly(toasts),
        add,
        remove,
        success,
        error,
        warning,
        info,
        clear,
    };
}
