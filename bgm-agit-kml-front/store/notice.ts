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

interface DetailNoticeStore {
  cont: string;
  files: []
  id: number;
  title: string;
  registDate: string;
}

interface NoticeStore {
  notice: NoticePage | null
  setNotice: (notice: NoticePage) => void;
}


export const useNoticeListStore = create<NoticeStore>((set) => ({
  notice: null,
  setNotice: (notice) => set({notice}),
}))

interface NoticeDetailStore {
  noticeDetail: DetailNoticeStore | null
  setDetailNotice: (noticeDetail: DetailNoticeStore) => void;
}

export const useNoticeDetailStore = create<NoticeDetailStore>((set) => ({
  noticeDetail: null,
  setDetailNotice: (noticeDetail) => set({noticeDetail}),
}))