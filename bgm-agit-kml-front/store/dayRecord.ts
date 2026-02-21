import { create } from 'zustand/index';

interface Row {
  nickname: string;
  point: number;
  rank: number;
  score: number;
  seat: string;
  winner: boolean;
}

interface Record {
  createNicname: string;
  matchsId: number;
  registDate: string;
  rows: Row[];
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
