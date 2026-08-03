import { atom } from 'recoil';
import type { NoticeContent, PagedNotice } from '../../types/notice';

export const noticeState = atom<PagedNotice>({
  key: 'noticeState',
  default: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  },
});

// 공지 상세(단건). 목록 페이지에 없는 글도 열 수 있게 별도 조회
export const noticeDetailState = atom<NoticeContent | null>({
  key: 'noticeDetailState',
  default: null,
});

export const noticePopupState = atom<NoticeContent[]>({
  key: 'noticePopupState',
  default: [],
});
