import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import {
  murderGameDetailState,
  murderGameListState,
  playHistoryState,
  playRecordDetailState,
  playRecordListState,
  playStatsState,
} from './state/murderState.ts';

// ---------- 머미 게임 카탈로그 ----------
export function useMurderGameListFetch() {
  const { request } = useRequest();
  const setList = useSetRecoilState(murderGameListState);

  return (page: number, keyword?: string) => {
    request(
      () =>
        api
          .get('/bgm-agit/murder-games', {
            params: { page, ...(keyword ? { keyword } : null) },
          })
          .then(res => res.data),
      setList
    );
  };
}

export function useMurderGameDetailFetch() {
  const { request } = useRequest();
  const setDetail = useSetRecoilState(murderGameDetailState);

  return (id: number) => {
    request(() => api.get(`/bgm-agit/murder-games/${id}`).then(res => res.data), setDetail);
  };
}

// ---------- 플레이 기록 ----------
type PlayRecordParams = {
  page: number;
  gameId?: number;
  memberId?: number;
  year?: number;
  month?: number;
};

export function usePlayRecordListFetch() {
  const { request } = useRequest();
  const setList = useSetRecoilState(playRecordListState);

  return (params: PlayRecordParams) => {
    request(
      () =>
        api
          .get('/bgm-agit/play-records', {
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

export function usePlayRecordDetailFetch() {
  const { request } = useRequest();
  const setDetail = useSetRecoilState(playRecordDetailState);

  return (id: number) => {
    request(() => api.get(`/bgm-agit/play-records/${id}`).then(res => res.data), setDetail);
  };
}

// ---------- 통계 / 이력 ----------
export function usePlayStatsFetch() {
  const { request } = useRequest();
  const setStats = useSetRecoilState(playStatsState);

  return (year?: number, month?: number) => {
    request(
      () =>
        api
          .get('/bgm-agit/play-stats/monthly', {
            params: { ...(year ? { year } : null), ...(month ? { month } : null) },
          })
          .then(res => res.data),
      setStats
    );
  };
}

export function usePlayHistoryFetch() {
  const { request } = useRequest();
  const setHistory = useSetRecoilState(playHistoryState);

  return (memberId?: number) => {
    request(
      () =>
        api
          .get('/bgm-agit/play-records/my-history', {
            params: { ...(memberId ? { memberId } : null) },
          })
          .then(res => res.data),
      setHistory
    );
  };
}
