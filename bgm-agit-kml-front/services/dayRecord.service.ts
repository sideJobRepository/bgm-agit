import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useDayRecordStore } from '@/store/dayRecord';

export type params = {
  page?: number;
  startDate: string | null;
  endDate: string | null;
  nickName: string;
  tournamentStatus?: string;
  // '' 전체 / 'YAKUMAN' 역만 / 'SANBAEMAN' 삼배만
  bonusType?: string;
};

export function useFetchDayRecordList() {
  const { request } = useRequest();
  const setDayRecord = useDayRecordStore((state) => state.setDayRecord);

  const fetchDayRecord = (params: params) => {
    request(
      () => api.get(`/bgm-agit/record?size=6`, { params }).then((res) => res.data),
      setDayRecord,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchDayRecord;
}
