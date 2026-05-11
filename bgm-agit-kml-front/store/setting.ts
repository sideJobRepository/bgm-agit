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

interface TournamentSetting {
  firstUma: number;
  fourthUma: number;
  secondUma: number;
  thirdUma: number;
  turning: number;
}

interface TournamentSettingStore {
  tournamentSetting: TournamentSetting | null;
  setTournamentSetting: (setting: TournamentSetting | null) => void;
}

export const useTournamentSettingStore = create<TournamentSettingStore>((set) => ({
  tournamentSetting: null,
  setTournamentSetting: (setting) => set({ tournamentSetting: setting }),
}));

interface SettingRefundStore {
  refund: number | null;
  setSettingRefund: (refund: number) => void;
}

export const useSettingRefundStore = create<SettingRefundStore>((set) => ({
  refund: null,
  setSettingRefund: (refund) => set({ refund }),
}));
