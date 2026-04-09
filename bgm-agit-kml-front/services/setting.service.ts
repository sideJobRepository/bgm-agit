import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useSettingRefundStore, useSettingStore } from '@/store/setting';

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

export function useFetchSettingRefund() {
  const { request } = useRequest();
  const setSettingRefund = useSettingRefundStore((state) => state.setSettingRefund);

  const fetchSettingRefund = () => {
    request(() => api.get(`/bgm-agit/settings/refund`).then((res) => res.data), setSettingRefund, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchSettingRefund;
}
