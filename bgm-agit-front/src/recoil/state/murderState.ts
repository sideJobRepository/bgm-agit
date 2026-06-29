import { atom } from 'recoil';
import type {
  MemberHistory,
  MonthlyStats,
  MurderGame,
  PagedMurderGame,
  PagedPlayRecord,
  PlayRecordDetail,
} from '../../types/murder.ts';

const emptyPage = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

export const murderGameListState = atom<PagedMurderGame>({
  key: 'murderGameListState',
  default: { ...emptyPage, size: 12 },
});

export const murderGameDetailState = atom<MurderGame | null>({
  key: 'murderGameDetailState',
  default: null,
});

export const playRecordListState = atom<PagedPlayRecord>({
  key: 'playRecordListState',
  default: { ...emptyPage },
});

export const playRecordDetailState = atom<PlayRecordDetail | null>({
  key: 'playRecordDetailState',
  default: null,
});

export const playStatsState = atom<MonthlyStats | null>({
  key: 'playStatsState',
  default: null,
});

export const playHistoryState = atom<MemberHistory | null>({
  key: 'playHistoryState',
  default: null,
});
