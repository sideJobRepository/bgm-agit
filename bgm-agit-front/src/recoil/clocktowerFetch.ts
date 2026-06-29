import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import {
  clockTowerGameDetailState,
  clockTowerGameListState,
  clockTowerHistoryState,
  clockTowerRecordDetailState,
  clockTowerRecordListState,
  clockTowerStatsState,
} from './state/clocktowerState.ts';

// ---------- 시계탑 게임 카탈로그 ----------
export function useClockTowerGameListFetch() {
  const { request } = useRequest();
  const setList = useSetRecoilState(clockTowerGameListState);

  return (page: number, keyword?: string) => {
    request(
      () =>
        api
          .get('/bgm-agit/clocktower-games', {
            params: { page, ...(keyword ? { keyword } : null) },
          })
          .then(res => res.data),
      setList
    );
  };
}

export function useClockTowerGameDetailFetch() {
  const { request } = useRequest();
  const setDetail = useSetRecoilState(clockTowerGameDetailState);

  return (id: number) => {
    request(() => api.get(`/bgm-agit/clocktower-games/${id}`).then(res => res.data), setDetail);
  };
}

// ---------- 시계탑 기록 ----------
type ClockTowerRecordParams = {
  page: number;
  gameId?: number;
  memberId?: number;
  year?: number;
  month?: number;
};

export function useClockTowerRecordListFetch() {
  const { request } = useRequest();
  const setList = useSetRecoilState(clockTowerRecordListState);

  return (params: ClockTowerRecordParams) => {
    request(
      () =>
        api
          .get('/bgm-agit/clocktower-records', {
            params: {
              page: params.page,
              ...(params.gameId ? { gameId: params.gameId } : null),
              ...(params.memberId ? { memberId: params.memberId } : null),
              ...(params.year ? { year: params.year } : null),
              ...(params.month ? { month: params.month } : null),
            },
          })
          .then(res => res.data),
      setList
    );
  };
}

export function useClockTowerRecordDetailFetch() {
  const { request } = useRequest();
  const setDetail = useSetRecoilState(clockTowerRecordDetailState);

  return (id: number) => {
    request(() => api.get(`/bgm-agit/clocktower-records/${id}`).then(res => res.data), setDetail);
  };
}

// ---------- 통계 / 이력 ----------
export function useClockTowerStatsFetch() {
  const { request } = useRequest();
  const setStats = useSetRecoilState(clockTowerStatsState);

  return (year?: number, month?: number) => {
    request(
      () =>
        api
          .get('/bgm-agit/clocktower-stats/monthly', {
            params: { ...(year ? { year } : null), ...(month ? { month } : null) },
          })
          .then(res => res.data),
      setStats
    );
  };
}

export function useClockTowerHistoryFetch() {
  const { request } = useRequest();
  const setHistory = useSetRecoilState(clockTowerHistoryState);

  return (memberId?: number) => {
    request(
      () =>
        api
          .get('/bgm-agit/clocktower-records/my-history', {
            params: { ...(memberId ? { memberId } : null) },
          })
          .then(res => res.data),
      setHistory
    );
  };
}
