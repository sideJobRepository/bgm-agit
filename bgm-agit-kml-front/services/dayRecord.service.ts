import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useDayRecordStore } from '@/store/dayRecord';

export type params = {
  page?: number;
};

export function useFetchDayRecordList() {
  const { request } = useRequest();
  const setDayRecord = useDayRecordStore((state) => state.setDayRecord);

  const fetchNotice = (params: params) => {
    request(
      () => api.get(`/bgm-agit/record?size=6`, { params }).then((res) => res.data),
      setDayRecord,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchNotice;
}
