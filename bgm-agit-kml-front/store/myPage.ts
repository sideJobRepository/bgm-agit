import { create } from 'zustand';

interface MyPageStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useMyPageStore = create<MyPageStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
