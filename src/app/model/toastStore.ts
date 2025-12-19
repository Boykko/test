import { v4 as uuidv4 } from "uuid";
import { create }       from "zustand";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (title: string, type?: ToastType, message?: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (title, type = 'info', message) => {
    const id = uuidv4();
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }]
    }));

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
