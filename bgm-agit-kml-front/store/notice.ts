import { create } from 'zustand';

export interface NoticeItem {
  id: number;
  title: string;
  cont: string;
  registDate: string;
}

export interface NoticePage {
  content: NoticeItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface NoticeStore {
  notice: NoticePage | null
  setNotice: (notice: NoticePage) => void;
}


export const useNoticeListStore = create<NoticeStore>((set) => ({
  notice: null,
  setNotice: (notice) => set({notice}),
}))