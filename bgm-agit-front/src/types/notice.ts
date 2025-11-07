// 개별 공지사항 타입
export type NoticeContent = {
  bgmAgitPopupUseStatus: string;
  bgmAgitNoticeId: number | null;
  bgmAgitNoticeTitle: string;
  bgmAgitNoticeCont: string;
  bgmAgitNoticeType: 'NOTICE' | 'EVENT';
  bgmAgitNoticeFileList: any[];
  registDate?: string;
};

// 공지사항 페이징 응답
export type PagedNotice = {
  content: NoticeContent[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type params = {
  page?: number;
  titleOrCont?: string;
};
