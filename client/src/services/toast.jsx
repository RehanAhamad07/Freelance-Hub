import { toast } from 'react-toastify';

// Simple text-based toasts for react-toastify v11 compatibility
// v11 changed closeOnClick behavior and custom JSX can block click events

export const showToast = {
  success: (message, title = 'Success') => {
    toast.success(`${title}: ${message}`, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  },

  error: (message, title = 'Error') => {
    toast.error(`${title}: ${message}`, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  },

  info: (message, title = 'Info') => {
    toast.info(`${title}: ${message}`, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  },

  warning: (message, title = 'Warning') => {
    toast.warning(`${title}: ${message}`, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  },

  loading: (message, title = 'Loading') => {
    return toast.loading(`${title}: ${message}`, {
      position: 'top-right',
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      theme: 'colored',
    });
  },

  updateLoading: (toastId, message, type = 'success') => {
    const titles = {
      success: 'Success',
      error: 'Error',
      info: 'Complete'
    };

    toast.update(toastId, {
      render: `${titles[type]}: ${message}`,
      type,
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      theme: 'colored',
    });
  }
};

export default showToast;
