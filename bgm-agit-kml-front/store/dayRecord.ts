import { create } from 'zustand/index';

interface Row {
  nickname: string;
  point: number;
  rank: number;
  score: number;
  seat: string;
  winner: boolean;
}

interface Yakuman {
  nickname: string;
  yakumanName: string;
  imageUrl?: string | null;
  fileId?: number | null;
}

interface Sanbaeman {
  nickname: string;
  sanbaemanName?: string | null;
  imageUrl?: string | null;
  fileId?: number | null;
}

interface Record {
  createNicname: string;
  matchsId: number;
  registDate: string;
  matchsWind: string;
  tournamentStatus: string;
  // 'Y' 면 삭제된 기록 (멘토+ 에게만 응답에 포함됨), 'N' 정상
  delStatus?: string;
  rows: Row[];
  // 이 대국에서 화료된 역만/삼배만 (없으면 빈 배열)
  yakumans?: Yakuman[];
  sanbaemans?: Sanbaeman[];
}

interface DayRecord {
  content: Record[];
  page: number;
  size: number;
  totalPages: number;
}

interface DayRecordStore {
  dayReord: DayRecord | null;
  setDayRecord: (dayRecord: DayRecord) => void;
}

export const useDayRecordStore = create<DayRecordStore>((set) => ({
  dayReord: null,
  setDayRecord: (dayReord) => set({ dayReord }),
}));
