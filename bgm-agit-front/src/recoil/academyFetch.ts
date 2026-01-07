//아카데미
import { useRequest } from './useRequest.ts';
import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import type { params } from '../types/community.ts';
import {curriculumDataState} from "./state/academy.ts";

export function useCurriiculumFetch() {
  const { request } = useRequest();
  const setCommunity = useSetRecoilState(curriculumDataState);

  const fetchCommunity = (params: params) => {
    request(() => api.get('/bgm-agit/free', { params }).then(res => res.data), setCommunity);
  };

  return fetchCommunity;
}


