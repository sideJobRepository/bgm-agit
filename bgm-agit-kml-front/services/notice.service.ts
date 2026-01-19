import { useRequest } from '@/hooks/useRequest';
import { useNoticeListStore } from '@/store/notice';
import api from '@/lib/axiosInstance';

export type params = {
  page?: number;
  titleOrCont?: string;
};

export function useFetchNoticeList() {
  const { request } = useRequest();
  const setNotice = useNoticeListStore((state) => state.setNotice);

  const fetchNotice = (params: params) => {
    request(() => api.get('/bgm-agit/kml-notice', { params }).then(res => res.data), setNotice);
  };

  return fetchNotice;
}