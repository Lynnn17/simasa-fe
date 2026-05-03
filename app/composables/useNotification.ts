import Swal from "sweetalert2";

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  category?: 'task' | 'grade' | 'registration' | 'logbook' | 'revision';
}

export const useNotification = () => {
  const notifications = useState<AppNotification[]>('app_notifications', () => []);
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  /**
   * Show a toast notification and add it to the notification list
   */
  const notify = (payload: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'type'> & { type?: AppNotification['type'] }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date();
    const type = payload.type || 'info';

    const newNotification: AppNotification = {
      id,
      timestamp,
      read: false,
      type,
      ...payload
    };

    // Add to list (at the top)
    notifications.value = [newNotification, ...notifications.value].slice(0, 50);

    // Trigger Toast (using SweetAlert2 for now, or a custom one)
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: payload.title,
      text: payload.message,
    });

    return id;
  };

  const markAsRead = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value[index].read = true;
    }
  };

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true);
  };

  const clearAll = () => {
    notifications.value = [];
  };

  return {
    notifications,
    unreadCount,
    notify,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};
