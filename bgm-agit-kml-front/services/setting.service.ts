import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useDayRecordStore } from '@/store/dayRecord';
import { useSettingStore } from '@/store/setting';

export function useFetchSetting() {
  const { request } = useRequest();
  const setSetting = useSettingStore((state) => state.setSetting);

  const fetchSetting = () => {
    request(() => api.get(`/bgm-agit/settings`).then((res) => res.data), setSetting, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchSetting;
}
