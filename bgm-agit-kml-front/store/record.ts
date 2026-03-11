import { create } from 'zustand/index';

interface Yakuman {
  id: number;
  orders: number;
  yakumanName: string;
}

interface YakumanStore {
  yakuman: Yakuman[] | [];
  setYakuman: (yakuman: Yakuman[]) => void;
}

export const useYakumanStore = create<YakumanStore>((set) => ({
  yakuman: [],
  setYakuman: (yakuman) => set({ yakuman }),
}));

//detail write

// 방향 공통 타입
export type DirectionKey = 'EAST' | 'WEST' | 'SOUTH' | 'NORTH';

// records
export interface RecordItem {
  memberId: number;
  nickName: string;
  recordId: number;
  recordScore: number;
  recordSeat: DirectionKey;
}

// yakuman
export interface YakumanItem {
  memberId: number;
  nickName: string;
  yakumanId: number;
  yakumanName: string;
  yakumanCont: string;
  imageUrl: string;
}

// detail 전체 데이터
export interface DetailRecordData {
  matchsId: number;
  wind: DirectionKey;
  tournamentStatus: string;
  records: RecordItem[];
  yakumans: YakumanItem[];
}

interface DetailRecordStore {
  detailRecord: DetailRecordData | null;
  setDetailRecord: (detailRecord: DetailRecordData | null) => void;
}

export const useDetailRecordStore = create<DetailRecordStore>((set) => ({
  detailRecord: null,
  setDetailRecord: (detailRecord) => set({ detailRecord }),
}));

//hist

export interface RecordHistory {
  recordId: number;
  nickName: string;
  score: number;
  rank: number;
  point: number;
  seat: string;
  winner?: boolean;
}

export interface HistRecord {
  changeReason: string;
  changeType: string;
  delStatus: string;
  firstUma: number;
  secondUma: number;
  thirdUma: number;
  fourthUma: number;
  matchHistoryId: number;
  matchId: number;
  matchsWind: string;
  modifyDate: string;
  modifyName: string;
  recordHistory: RecordHistory[];
  tournamentStatus: string;
  turing: number;
}

interface HistRecordStore {
  histRecord: HistRecord[] | null;
  setHistRecord: (histRecord: HistRecord[] | null) => void;
}

export const useHistRecordStore = create<HistRecordStore>((set) => ({
  histRecord: null,
  setHistRecord: (histRecord) => set({ histRecord }),
}));
