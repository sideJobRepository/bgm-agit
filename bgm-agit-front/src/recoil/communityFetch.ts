//자유게시판
import { useRequest } from './useRequest.ts';
import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import type { params } from '../types/community.ts';
import { communityState, detailCommunityState } from './state/community.ts';

export function useCommunityFetch() {
  const { request } = useRequest();
  const setCommunity = useSetRecoilState(communityState);

  const fetchCommunity = (params: params) => {
    request(() => api.get('/bgm-agit/free', { params }).then(res => res.data), setCommunity);
  };

  return fetchCommunity;
}

export function useDetailCommunityFetch() {
  const { request } = useRequest();
  const setDetailCommunity = useSetRecoilState(detailCommunityState);

  const fetchDetailCommunity = (id: string) => {
    request(() => api.get(`/bgm-agit/free/${id}`).then(res => res.data), setDetailCommunity);
  };

  return fetchDetailCommunity;
}
