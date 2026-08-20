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

export type SeasonOption = {
  id: number;
  name: string;
  progressStatus: 'SCHEDULED' | 'ONGOING' | 'CLOSED';
  progressStatusLabel: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type MemberStanding = {
  seasonId: number;
  seasonName: string;
  memberId: number;
  memberName: string | null;
  rating: number | string | null;
  gameCount: number;
  seasonRank: number | null;
  provisional: boolean;
  tierName: string | null;
  tierMinRating: number | null;
  nextTierName: string | null;
  nextTierMinRating: number | null;
  pointsToNextTier: number | string | null;
  seasonHigh: number | string | null;
  seasonHighDateTime: string | null;
  seasonLow: number | string | null;
  seasonLowDateTime: string | null;
  recentDeltas: (number | string)[];
};

export type SeasonStandingRank = {
  seasonRank: number;
  tierName: string | null;
  memberId: number;
  memberNickname: string | null;
  rating: number | string | null;
  gameCount: number;
  firstRate: number;
  fourthRate: number;
  avgRank: number;
};

export type SeasonStandingPage = {
  content: SeasonStandingRank[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
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

export function useFetchSeasonOptions() {
  const { request } = useRequest();

  const fetchSeasonOptions = (onSuccess?: (seasons: SeasonOption[]) => void) => {
    return request(
      () => api.get<SeasonOption[]>('/bgm-agit/rating/seasons/options').then((res) => res.data),
      onSuccess,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchSeasonOptions;
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

export function useFetchMySeasonStanding() {
  const { request } = useRequest();

  const fetchMySeasonStanding = (
    seasonId: string,
    onSuccess?: (standing: MemberStanding) => void
  ) => {
    return request(
      () =>
        api
          .get<MemberStanding>(`/bgm-agit/rating/seasons/${seasonId}/standings/me`)
          .then((res) => res.data),
      onSuccess,
      { ignoreErrorRedirect: false }
    );
  };

  return fetchMySeasonStanding;
}

export function useFetchSeasonStandings() {
  const { request } = useRequest();

  const fetchSeasonStandings = (
    seasonId: string,
    page: number,
    size: number,
    onSuccess?: (standings: SeasonStandingPage) => void
  ) => {
    return request(
      () =>
        api
          .get<SeasonStandingPage>(`/bgm-agit/rating/seasons/${seasonId}/standings`, {
            params: { page, size },
          })
          .then((res) => res.data),
      onSuccess,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchSeasonStandings;
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
