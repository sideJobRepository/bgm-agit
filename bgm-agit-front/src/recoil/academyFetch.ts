//아카데미
import { useRequest } from './useRequest.ts';
import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import {curriculumDataState} from "./state/academy.ts";

export function useCurriiculumFetch() {
  const { request } = useRequest();
  const setCurriiculum = useSetRecoilState(curriculumDataState);

  const fetchCurriiculum = (params: any) => {
    request(() => api.get('/bgm-agit/curriculum', { params }).then(res => res.data), setCurriiculum);
  };

  return fetchCurriiculum;
}


