import { create }  from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isMuted: boolean;
  showHistory: boolean;
  isAnimationsEnabled: boolean;
  
  toggleMute: () => void;
  toggleHistory: () => void;
  toggleAnimations: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isMuted: false,
      showHistory: true,
      isAnimationsEnabled: true,

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),
      toggleAnimations: () => set((state) => ({ isAnimationsEnabled: !state.isAnimationsEnabled })),
    }),
    {
      name: 'chaos_age_ui_settings',
    }
  )
);
