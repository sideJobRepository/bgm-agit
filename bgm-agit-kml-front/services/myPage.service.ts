import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useMyPageStore } from '@/store/myPage';

export type params = {
  page?: number;
  titleAndCont?: string;
};

export function useFetchMyPageList() {
  const { request } = useRequest();
  const setMyPage = useMyPageStore((state) => state.setMyPage);

  const fetchMyPage = (params: params) => {
    request(
      () => api.get(`/bgm-agit/my-academy?size=5`, { params }).then((res) => res.data),
      setMyPage,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchMyPage;
}
