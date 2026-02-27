import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import { useRequest } from './useRequest.ts';
import { myPageListState } from './state/myPageState.ts';
import type { MyPageParams } from '../types/myPage.ts';

export function useMyPageFetch() {
  const { request } = useRequest();
  const setMyPage = useSetRecoilState(myPageListState);

  const fetchMyPage = (params: MyPageParams) => {
    request(
      () => api.get('/bgm-agit/my-academy?size=5', { params }).then(res => res.data),
      setMyPage,
      { ignoreHttpError: true }
    );
  };

  return fetchMyPage;
}
