import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useDetailSanbaemanRecordStore, useSanbaemanRecordStore } from '@/store/sanbaeman';

export type params = {
  page?: number;
  nickName: string;
};

export type detailParams = {
  page?: number;
};

export function useFetchSanbaemanList() {
  const { request } = useRequest();
  const setSanbaeman = useSanbaemanRecordStore((state) => state.setSanbaeman);

  const fetchSanbaeman = (params: params) => {
    request(
      () => api.get(`/bgm-agit/sanbaeman-pivot?size=20`, { params }).then((res) => res.data),
      setSanbaeman,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchSanbaeman;
}

export function useFetchDetailSanbaemanList() {
  const { request } = useRequest();
  const setDetailSanbaeman = useDetailSanbaemanRecordStore((state) => state.setDetailSanbaeman);

  const fetchDetailSanbaeman = (params: detailParams) => {
    request(
      () => api.get(`/bgm-agit/sanbaeman-detail?size=6`, { params }).then((res) => res.data),
      setDetailSanbaeman,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchDetailSanbaeman;
}
