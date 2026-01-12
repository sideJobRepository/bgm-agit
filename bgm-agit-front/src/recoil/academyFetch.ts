//아카데미
import { useRequest } from './useRequest.ts';
import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import {academyClassDataState, academyDataState, curriculumDataState} from "./state/academy.ts";

export function useCurriiculumFetch() {
  const { request } = useRequest();
  const setCurriiculum = useSetRecoilState(curriculumDataState);

  const fetchCurriiculum = (params: any) => {
    request(() => api.get('/bgm-agit/curriculum', { params }).then(res => res.data), setCurriiculum);
  };

  return fetchCurriiculum;
}

export function useAcademyFetch() {
  const { request } = useRequest();
  const setAcademy = useSetRecoilState(academyDataState);

  const fetchAcademy = (params: any) => {
    request(() => api.get('/bgm-agit/inputs', { params }).then(res => res.data), setAcademy);
  };

  return fetchAcademy;
}



export function useAcademyClassFetch() {
  const { request } = useRequest();
  const setAcademyClass = useSetRecoilState(academyClassDataState);

  const fetchAcademyClass = (params: any) => {
    request(() => api.get('/bgm-agit/inputs/class', { params }).then(res => res.data), setAcademyClass);
  };

  return fetchAcademyClass;
}

