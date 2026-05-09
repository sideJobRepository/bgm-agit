import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useRankListStore } from '@/store/rank';

export type RankType = 'ALL' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface MemberStatsCards {
  totalCount: number;
  avgRank: number;
  firstCount: number;
  firstRate: number;
  fourthCount: number;
  fourthRate: number;
  tobiCount: number;
  tobiRate: number;
  plusCount: number;
  plusRate: number;
  minus2Count: number;
  minus2Rate: number;
  sumPoint: number;
}

export interface SeatRankRow {
  label: string;
  all: number;
  east: number;
  south: number;
  west: number;
  north: number;
}

export interface SeatRankBlock {
  wind: 'EAST' | 'SOUTH' | 'WEST' | 'NORTH';
  totalGames: number;
  rows: SeatRankRow[];
}

export interface TopRival {
  memberId: number;
  memberNickname: string;
  playedCount: number;
}

export interface MemberStatsResponse {
  memberId: number;
  memberNickname: string | null;
  cards: MemberStatsCards;
  seatStats: SeatRankBlock[];
  topRivals: TopRival[];
}

export interface RecentGamePlayer {
  memberId: number | null;
  memberNickname: string | null;
  seat: 'EAST' | 'SOUTH' | 'WEST' | 'NORTH' | null;
  rank: number | null;
  score: number | null;
}

export interface MemberRecentGame {
  matchsId: number;
  registDate: string;
  matchsWind: 'EAST' | 'SOUTH' | 'WEST' | 'NORTH' | null;
  mySeat: 'EAST' | 'SOUTH' | 'WEST' | 'NORTH' | null;
  myRank: number | null;
  myScore: number | null;
  myPoint: number | null;
  players: RecentGamePlayer[];
}

export interface MemberRecentGamePage {
  content: MemberRecentGame[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export function useFetchMemberStats() {
  const { request } = useRequest();
  return (memberId: number, year?: number) =>
    request(
      () =>
        api
          .get<MemberStatsResponse>(`/bgm-agit/ranks/${memberId}/stats`, {
            params: year ? { year } : undefined,
          })
          .then((res) => res.data),
      undefined,
      { ignoreErrorRedirect: true }
    );
}

export function useFetchMemberRecentGames() {
  const { request } = useRequest();
  return (memberId: number, page: number, year?: number) =>
    request(
      () =>
        api
          .get<MemberRecentGamePage>(`/bgm-agit/ranks/${memberId}/games`, {
            params: { page, size: 10, ...(year ? { year } : {}) },
          })
          .then((res) => res.data),
      undefined,
      { ignoreErrorRedirect: true }
    );
}

export type params = {
  page?: number;
  type?: RankType;
  baseDate?: string;
  year?: number;
  month?: number;
  startDateTime?: string;
  endDateTime?: string;
};

export function useFetchRankList() {
  const { request } = useRequest();
  const setRank = useRankListStore((state) => state.setRank);

  const fetchRank = (params: params) => {
    request(() => api.get(`/bgm-agit/ranks?size=100`, { params }).then((res) => res.data), setRank, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchRank;
}
