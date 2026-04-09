import { create } from 'zustand/index';

interface Setting {
  firstUma: number;
  fourthUma: number;
  secondUma: number;
  thirdUma: number;
  turning: number;
}

interface SettingStore {
  setting: Setting | null;
  setSetting: (setting: Setting) => void;
}

export const useSettingStore = create<SettingStore>((set) => ({
  setting: null,
  setSetting: (setting) => set({ setting }),
}));

interface SettingRefundStore {
  refund: number | null;
  setSettingRefund: (refund: number) => void;
}

export const useSettingRefundStore = create<SettingRefundStore>((set) => ({
  refund: null,
  setSettingRefund: (refund) => set({ refund }),
}));
