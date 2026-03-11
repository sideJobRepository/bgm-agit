import { useRequest } from '@/hooks/useRequest';
import { useNoticeListStore } from '@/store/notice';
import api from '@/lib/axiosInstance';
import { useRecordUserStore } from '@/store/user';
import { useDetailRecordStore, useHistRecordStore, useYakumanStore } from '@/store/record';

export function useFetchRecordUser() {
  const { request } = useRequest();
  const setRecordUser = useRecordUserStore((state) => state.setRecordUser);

  const fetchRecordUser = () => {
    request(() => api.get(`/bgm-agit/mahjong-members`).then((res) => res.data), setRecordUser, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchRecordUser;
}

export function useFetchYakuman() {
  const { request } = useRequest();
  const setYakuman = useYakumanStore((state) => state.setYakuman);

  const fetchYakuman = () => {
    request(() => api.get(`/bgm-agit/yakumanType`).then((res) => res.data), setYakuman, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchYakuman;
}

export function useFetchDetailWrite() {
  const { request } = useRequest();
  const setDetailRecord = useDetailRecordStore((state) => state.setDetailRecord);

  const fetchDetailWrite = (id: string) => {
    request(() => api.get(`/bgm-agit/record/${id}`).then((res) => res.data), setDetailRecord, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchDetailWrite;
}

export function useFetchHistWrite() {
  const { request } = useRequest();
  const setHistRecord = useHistRecordStore((state) => state.setHistRecord);

  const fetchHistWrite = (id: number) => {
    request(() => api.get(`/bgm-agit/history/${id}`).then((res) => res.data), setHistRecord, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchHistWrite;
}
