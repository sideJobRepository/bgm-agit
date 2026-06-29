import { atom } from 'recoil';
import type {
  MemberHistory,
  MonthlyStats,
} from '../../types/murder.ts';
import type {
  ClockTowerGame,
  ClockTowerRecordDetail,
  PagedClockTowerGame,
  PagedClockTowerRecord,
} from '../../types/clocktower.ts';

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

export const clockTowerGameListState = atom<PagedClockTowerGame>({
  key: 'clockTowerGameListState',
  default: { ...emptyPage, size: 12 },
});

export const clockTowerGameDetailState = atom<ClockTowerGame | null>({
  key: 'clockTowerGameDetailState',
  default: null,
});

export const clockTowerRecordListState = atom<PagedClockTowerRecord>({
  key: 'clockTowerRecordListState',
  default: { ...emptyPage },
});

export const clockTowerRecordDetailState = atom<ClockTowerRecordDetail | null>({
  key: 'clockTowerRecordDetailState',
  default: null,
});

export const clockTowerStatsState = atom<MonthlyStats | null>({
  key: 'clockTowerStatsState',
  default: null,
});

export const clockTowerHistoryState = atom<MemberHistory | null>({
  key: 'clockTowerHistoryState',
  default: null,
});
