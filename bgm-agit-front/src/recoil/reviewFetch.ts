import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance.ts';
import { useRequest } from './useRequest.ts';
import { detailReviewState, reviewState } from './state/reviewState.ts';

export type ReviewParams = {
  page?: number;
  titleOrCont?: string;
};

export function useReviewFetch() {
  const { request } = useRequest();
  const setReview = useSetRecoilState(reviewState);

  const fetchReview = (params: ReviewParams) => {
    console.log('pa', params);
    request(() => api.get('/bgm-agit/review?size=5', { params }).then(res => res.data), setReview, {
      ignoreHttpError: true,
    });
  };

  return fetchReview;
}

export function useDetailReviewFetch() {
  const { request } = useRequest();
  const setDetailReview = useSetRecoilState(detailReviewState);

  const fetchDetailReview = (id: string) => {
    request(() => api.get(`/bgm-agit/review/${id}`).then(res => res.data), setDetailReview, {
      ignoreHttpError: true,
    });
  };

  return fetchDetailReview;
}
