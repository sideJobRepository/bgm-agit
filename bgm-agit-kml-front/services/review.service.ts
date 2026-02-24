import { useRequest } from '@/hooks/useRequest';
import { useNoticeDetailStore, useNoticeListStore } from '@/store/notice';
import api from '@/lib/axiosInstance';
import { useReviewDetailStore, useReviewListStore } from '@/store/review';

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

export function useFetchReviewDetail() {
  const { request } = useRequest();
  const setDetailReview = useReviewDetailStore((state) => state.setDetailReview);

  const fetchDetailReview = (id: string) => {
    request(() => api.get(`/bgm-agit/review/${id}`).then((res) => res.data), setDetailReview, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchDetailReview;
}
