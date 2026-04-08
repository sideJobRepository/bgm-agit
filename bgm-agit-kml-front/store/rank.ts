import { create } from 'zustand';

export interface RankItem {
  memberId: number;
  memberNickname: string;

  rank: number;
  avgRank: number;

  totalCount: number;

  firstCount: number;
  secondCount: number;
  thirdCount: number;
  fourthCount: number;

  plusCount: number;
  plus3Count: number;

  minus2Count: number;

  tobiCount: number;
  tobiRate: number;
  tobiMinus3Count: number;
  tobiMinus3Rate: number;

  firstRate: number;
  plusRate: number;
  plus3Rate: number;
  minus2Rate: number;
  fourthRate: number;
  top2Rate: number;

  recordSumPoint: number;
  pointRate: number | null;
}

export interface LankPage {
  content: RankItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface RankStore {
  rank: LankPage | null;
  setRank: (notice: LankPage) => void;
}

export const useRankListStore = create<RankStore>((set) => ({
  rank: null,
  setRank: (rank) => set({ rank }),
}));
