import { create } from 'zustand/index';

export interface SanbaemanRow {
  memberId: number;
  nickname: string;
  // 회원별 삼배만 총 횟수
  totalCount: number;
}

interface SanbaemanRecord {
  content: SanbaemanRow[];
  page: number;
  size: number;
  totalPages: number;
}

interface SanbaemanStore {
  sanbaeman: SanbaemanRecord | null;
  setSanbaeman: (record: SanbaemanRecord) => void;
}

export const useSanbaemanRecordStore = create<SanbaemanStore>((set) => ({
  sanbaeman: null,
  setSanbaeman: (sanbaeman) => set({ sanbaeman }),
}));

//디테일 삼배만
export interface DetailSanbaemanRow {
  // legacy: BgmAgitCommonFile 의 풀 URL
  fileUrl: string | null;
  // new: BgmAgitFile id (presigned URL 은 /bgm-agit/file-view 로 일괄 조회)
  fileId: number | null;
  nickname: string;
  registDate: string;
  sanbaemanCont: string;
  sanbaemanName: string;
}

interface DetailSanbaemanRecord {
  content: DetailSanbaemanRow[];
  page: number;
  size: number;
  totalPages: number;
}

interface DetailSanbaemanStore {
  detailSanbaeman: DetailSanbaemanRecord | null;
  setDetailSanbaeman: (record: DetailSanbaemanRecord) => void;
}

export const useDetailSanbaemanRecordStore = create<DetailSanbaemanStore>((set) => ({
  detailSanbaeman: null,
  setDetailSanbaeman: (detailSanbaeman) => set({ detailSanbaeman }),
}));
