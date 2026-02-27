import { useRequest } from './useRequest.ts';
import api from '../utils/axiosInstance.ts';
import { useSetRecoilState } from 'recoil';
import { matchDataState } from './state/match.ts';

export type params = {
  year?: number;
  month?: number;
  day?: number;
};

export function useFetchMatchList() {
  const { request } = useRequest();
  const setMatch = useSetRecoilState(matchDataState);

  const fetchMatch = (params: params) => {
    console.log('parma', params);
    request(() => api.get(`/bgm-agit/lecture`, { params }).then(res => res.data), setMatch, {});
  };

  return fetchMatch;
}
