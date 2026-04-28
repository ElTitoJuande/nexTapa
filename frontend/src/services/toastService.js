import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 4000,
};

export const toastService = {
  success(message, options = {}) {
    return toast.success(message, { ...baseOptions, ...options });
  },

  error(message, options = {}) {
    return toast.error(message, { ...baseOptions, ...options });
  },

  info(message, options = {}) {
    return toast.info(message, { ...baseOptions, ...options });
  },

  loading(message, options = {}) {
    return toast.loading(message, { ...baseOptions, ...options });
  },

  promise(promise, messages, options = {}) {
    return toast.promise(promise, messages, { ...baseOptions, ...options });
  },

  dismiss(toastId) {
    if (toastId) {
      toast.dismiss(toastId);
      return;
    }
    toast.dismiss();
  },
};
