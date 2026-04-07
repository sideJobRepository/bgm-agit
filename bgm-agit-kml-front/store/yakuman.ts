import { create } from 'zustand/index';

export interface YakumanRow {
  chiihou: number;
  chinroutou: number;
  chuurenPoutou: number;
  countedYakuman: number;
  daisangen: number;
  daisuushii: number;
  kokushi13Wait: number;
  kokushiMusou: number;

  memberId: number;
  nickname: string;

  pureChuuren: number;
  ryuuiisou: number;
  sharin: number;
  shousuushii: number;
  suuankou: number;
  suuankouTanki: number;

  suukantsu: number;
  tenhou: number;
  tsuuiisou: number;

  totalCount: number;
}

interface YakumanRecord {
  content: YakumanRow[];
  page: number;
  size: number;
  totalPages: number;
}

interface YakumanStore {
  yakuman: YakumanRecord | null;
  setYakuman: (dayRecord: YakumanRecord) => void;
}

export const useYakumanRecordStore = create<YakumanStore>((set) => ({
  yakuman: null,
  setYakuman: (yakuman) => set({ yakuman }),
}));

//디테일 역만
export interface DetailYakumanRow {
  fileUrl: string;
  nickname: string;
  registDate: string;
  yakumanCont: string;
  yakumanName: string;
}

interface DetailYakumanRecord {
  content: DetailYakumanRow[];
  page: number;
  size: number;
  totalPages: number;
}

interface DetailYakumanStore {
  detailYakuman: DetailYakumanRecord | null;
  setDetailYakuman: (dayRecord: DetailYakumanRecord) => void;
}

export const useDetailYakumanRecordStore = create<DetailYakumanStore>((set) => ({
  detailYakuman: null,
  setDetailYakuman: (detailYakuman) => set({ detailYakuman }),
}));
