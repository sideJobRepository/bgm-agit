import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useSeasonStore } from '@/store/season';

export type TierResponse = {
  id: number;
  seasonId: number;
  name: string | null;
  image: string | null;
  color: string | null;
  minRating: number | null;
};

export type TierSaveRequest = {
  tiers: {
    name: string;
    imageBase64: string;
    color: string;
    minRating: number;
  }[];
};

export function useFetchSeasons() {
  const { request } = useRequest();
  const setSeasons = useSeasonStore((state) => state.setSeasons);

  const fetchSeasons = () => {
    return request(() => api.get('/bgm-agit/rating/seasons').then((res) => res.data), setSeasons, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchSeasons;
}

export function useFetchSeasonTiers() {
  const { request } = useRequest();

  const fetchSeasonTiers = (seasonId: string, onSuccess?: (tiers: TierResponse[]) => void) => {
    return request(
      () =>
        api
          .get<TierResponse[]>(`/bgm-agit/rating/seasons/${seasonId}/tiers`)
          .then((res) => res.data),
      onSuccess,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchSeasonTiers;
}

export function useSaveSeasonTiers() {
  const { request } = useRequest();

  const saveSeasonTiers = (
    seasonId: string,
    payload: TierSaveRequest,
    onSuccess?: (tiers: TierResponse[]) => void
  ) => {
    return request(
      () =>
        api
          .put<TierResponse[]>(`/bgm-agit/rating/seasons/${seasonId}/tiers`, payload)
          .then((res) => res.data),
      onSuccess,
      { ignoreErrorRedirect: true }
    );
  };

  return saveSeasonTiers;
}

export function useStartSeason() {
  const { request } = useRequest();

  const startSeason = (seasonId: number) => {
    return request(
      () => api.post(`/bgm-agit/rating/seasons/${seasonId}/start`).then((res) => res.data),
      undefined,
      {
        ignoreErrorRedirect: true,
      }
    );
  };

  return startSeason;
}

export function useCloseSeason() {
  const { request } = useRequest();

  const closeSeason = (seasonId: number) => {
    return request(
      () => api.post(`/bgm-agit/rating/seasons/${seasonId}/close`).then((res) => res.data),
      undefined,
      {
        ignoreErrorRedirect: true,
      }
    );
  };

  return closeSeason;
}
