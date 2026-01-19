import { useRequest } from '@/hooks/useRequest';
import { useNoticeDetailStore, useNoticeListStore } from '@/store/notice';
import api from '@/lib/axiosInstance';

export type params = {
  page?: number;
  titleAndCont?: string;
};

export function useFetchNoticeList() {
  const { request } = useRequest();
  const setNotice = useNoticeListStore((state) => state.setNotice);

  const fetchNotice = (params: params) => {
    request(() => api.get(`/bgm-agit/kml-notice?size=5`, { params }).then(res => res.data), setNotice);
  };

  return fetchNotice;
}

export function useFetchNoticeDetailL() {
  const { request } = useRequest();
  const setDetailNotice = useNoticeDetailStore((state) => state.setDetailNotice);

  const fetchDetailNotice = (id: string) => {
    request(() => api.get(`/bgm-agit/kml-notice/${id}`).then(res => res.data), setDetailNotice);
  };

  return fetchDetailNotice;
}