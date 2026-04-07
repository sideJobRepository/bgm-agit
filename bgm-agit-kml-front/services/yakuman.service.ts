import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useDetailYakumanRecordStore, useYakumanRecordStore } from '@/store/yakuman';

export type params = {
  page?: number;
  nickName: string;
};

export type detailParams = {
  page?: number;
};

export function useFetchYakumanList() {
  const { request } = useRequest();
  const setYakuman = useYakumanRecordStore((state) => state.setYakuman);

  const fetchYakuan = (params: params) => {
    request(
      () => api.get(`/bgm-agit/yakuman-pivot?size=6`, { params }).then((res) => res.data),
      setYakuman,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchYakuan;
}

export function useFetchDetailYakumanList() {
  const { request } = useRequest();
  const setDetailYakuman = useDetailYakumanRecordStore((state) => state.setDetailYakuman);

  const fetchDetailYakuan = (params: detailParams) => {
    request(
      () => api.get(`/bgm-agit/yakuman-detail?size=6`, { params }).then((res) => res.data),
      setDetailYakuman,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchDetailYakuan;
}
