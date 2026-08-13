import { create } from 'zustand';

export type SeasonResetType = 'HARD' | 'SOFT' | 'CONTINUOUS';
export type SeasonProgressStatus = 'SCHEDULED' | 'ONGOING' | 'CLOSED';

export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progressStatus: SeasonProgressStatus;
  resetType: SeasonResetType;
  carryRate: number;
  baseRating: number;
  firstScore: number;
  secondScore: number;
  thirdScore: number;
  fourthScore: number;
  eastMultiple: number;
  southMultiple: number;
  westMultiple: number;
  northMultiple: number;
}

interface SeasonStore {
  seasons: Season[];
  setSeasons: (seasons: Season[]) => void;
}

export const useSeasonStore = create<SeasonStore>((set) => ({
  seasons: [],
  setSeasons: (seasons) => set({ seasons }),
}));
