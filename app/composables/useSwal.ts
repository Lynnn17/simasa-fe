import Swal from 'sweetalert2'
import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2'

export const useSwal = () => {
    // Success alert
    const success = (title: string, text?: string) => {
        return Swal.fire({
            icon: 'success',
            title,
            text,
            confirmButtonColor: '#22c55e',
            timer: 2000,
            timerProgressBar: true,
        })
    }

    // Error alert
    const error = (title: string, text?: string) => {
        return Swal.fire({
            icon: 'error',
            title,
            text,
            confirmButtonColor: '#ef4444',
        })
    }

    // Warning alert
    const warning = (title: string, text?: string) => {
        return Swal.fire({
            icon: 'warning',
            title,
            text,
            confirmButtonColor: '#f59e0b',
        })
    }

    // Info alert
    const info = (title: string, text?: string) => {
        return Swal.fire({
            icon: 'info',
            title,
            text,
            confirmButtonColor: '#3b82f6',
        })
    }

    // Confirm dialog
    const confirm = (
        title: string,
        text?: string
    ): Promise<SweetAlertResult> => {
        return Swal.fire({
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        })
    }

    // Delete confirmation
    const confirmDelete = (
        itemName?: string,
        options?: {
            title?: string;
            text?: string;
            confirmText?: string;
            cancelText?: string;
            preConfirm?: () => Promise<any>;
        }
    ): Promise<SweetAlertResult> => {
        const defaultText = itemName
            ? `Apakah Anda yakin ingin menghapus "${itemName}"?`
            : 'Apakah Anda yakin ingin menghapus data ini?';

        return Swal.fire({
            icon: 'warning',
            title: options?.title || 'Hapus Data?',
            text: options?.text || defaultText,
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: options?.confirmText || 'Ya, Hapus',
            cancelButtonText: options?.cancelText || 'Batal',
            allowOutsideClick: () => !Swal.isLoading(),
            showLoaderOnConfirm: !!options?.preConfirm,
            preConfirm: options?.preConfirm,
        })
    }

    // Loading indicator
    const loading = (title = 'Memproses...') => {
        Swal.fire({
            title,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })
    }

    // Close loading
    const closeLoading = () => {
        Swal.close()
    }

    // Toast notification
    const toast = (
        title: string,
        icon: 'success' | 'error' | 'warning' | 'info' = 'success'
    ) => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: false,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer
                toast.onmouseleave = Swal.resumeTimer
            },
        })
        return Toast.fire({ icon, title })
    }

    // Custom fire
    const fire = (options: SweetAlertOptions) => {
        return Swal.fire(options)
    }

    return {
        success,
        error,
        warning,
        info,
        confirm,
        confirmDelete,
        loading,
        closeLoading,
        toast,
        fire,
    }
}
