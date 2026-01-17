import Swal from 'sweetalert2'

// Base configuration for minimalist look
const baseConfig = {
    background: 'var(--cui-body-bg)',
    color: 'var(--cui-body-color)',
    padding: '1.5rem',
    buttonsStyling: false,
    customClass: {
        popup: 'shadow-lg rounded-1 border-0',
        confirmButton: 'btn btn-primary px-4 mx-2 rounded-1',
        cancelButton: 'btn btn-outline-secondary px-4 mx-2 rounded-1',
        denyButton: 'btn btn-danger px-4 mx-2 rounded-1',
        title: 'fs-4 fw-semibold',
        htmlContainer: 'text-muted',
    },
}

// Toast configuration
export const Toast = Swal.mixin({
    ...baseConfig,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    padding: '0.5rem',
    customClass: {
        popup: 'shadow rounded-1 border-0',
        title: 'fs-6 fw-normal mx-2',
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
})

// Confirmation Modal configuration
export const Modal = Swal.mixin({
    ...baseConfig,
    showCancelButton: true,
    reverseButtons: true, // CoreUI style: Cancel on left, Action on right
})

export const Confirm = Modal;

// Message Modal (Success/Error/Info)
export const Alert = {
    success: (title, text) =>
        Swal.fire({
            ...baseConfig,
            icon: 'success',
            title,
            text,
            iconColor: 'var(--cui-success)',
        }),
    error: (title, text) =>
        Swal.fire({
            ...baseConfig,
            icon: 'error',
            title,
            text,
            iconColor: 'var(--cui-danger)',
        }),
    info: (title, text) =>
        Swal.fire({
            ...baseConfig,
            icon: 'info',
            title,
            text,
            iconColor: 'var(--cui-info)',
        }),
    warning: (title, text) =>
        Swal.fire({
            ...baseConfig,
            icon: 'warning',
            title,
            text,
            iconColor: 'var(--cui-warning)',
        }),
}

export default Swal
