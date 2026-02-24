import { useRequest } from '@/hooks/useRequest';
import { useNoticeListStore } from '@/store/notice';
import api from '@/lib/axiosInstance';
import { useReviewListStore } from '@/store/review';

export type params = {
  page?: number;
  titleAndCont?: string;
};

export function useFetchReviewList() {
  const { request } = useRequest();
  const setReview = useReviewListStore((state) => state.setReview);

  const fetchReview = (params: params) => {
    request(
      () => api.get(`/bgm-agit/review?size=5`, { params }).then((res) => res.data),
      setReview,
      { ignoreErrorRedirect: true }
    );
  };

  return fetchReview;
}
