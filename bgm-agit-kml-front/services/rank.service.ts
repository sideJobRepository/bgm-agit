import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useRankListStore } from '@/store/rank';

export type RankType = 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export type params = {
  page?: number;
  type?: RankType;
  baseDate?: string;
  startDateTime?: string;
  endDateTime?: string;
};

export function useFetchRankList() {
  const { request } = useRequest();
  const setRank = useRankListStore((state) => state.setRank);

  const fetchRank = (params: params) => {
    request(() => api.get(`/bgm-agit/ranks?size=5`, { params }).then((res) => res.data), setRank, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchRank;
}
