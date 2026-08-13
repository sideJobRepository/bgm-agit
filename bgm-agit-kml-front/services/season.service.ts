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

export type SeasonSaveRequest = {
  name: string;
  startDate: string;
  endDate: string;
  baseRating: number;
  firstScore: number;
  secondScore: number;
  thirdScore: number;
  fourthScore: number;
  eastMultiple: number;
  southMultiple: number;
  westMultiple: number;
  northMultiple: number;
  resetType: string | null;
  carryRate: number | null;
};

export function useFetchSeasons() {
  const { request } = useRequest();
  const setSeasons = useSeasonStore((state) => state.setSeasons);

  const fetchSeasons = () => {
    request(() => api.get('/bgm-agit/rating/seasons').then((res) => res.data), setSeasons, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchSeasons;
}

export async function fetchSeasonTiers(seasonId: string) {
  const res = await api.get<TierResponse[]>(`/bgm-agit/rating/seasons/${seasonId}/tiers`);
  return res.data;
}

export async function saveSeasonTiers(seasonId: string, payload: TierSaveRequest) {
  const res = await api.put<TierResponse[]>(`/bgm-agit/rating/seasons/${seasonId}/tiers`, payload);
  return res.data;
}

export async function createSeason(payload: SeasonSaveRequest) {
  const res = await api.post('/bgm-agit/rating/seasons', payload);
  return res.data;
}

export async function updateSeason(seasonId: number, payload: SeasonSaveRequest) {
  const res = await api.put(`/bgm-agit/rating/seasons/${seasonId}`, payload);
  return res.data;
}

export async function deleteSeasonById(seasonId: number) {
  const res = await api.delete(`/bgm-agit/rating/seasons/${seasonId}`);
  return res.data;
}

export async function startSeasonById(seasonId: number) {
  const res = await api.post(`/bgm-agit/rating/seasons/${seasonId}/start`);
  return res.data;
}

export async function closeSeasonById(seasonId: number) {
  const res = await api.post(`/bgm-agit/rating/seasons/${seasonId}/close`);
  return res.data;
}
