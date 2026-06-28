import { useSetRecoilState } from 'recoil';
import api from '../utils/axiosInstance';
import { useRequest } from './useRequest.ts';
import { gatheringDetailState, gatheringListState } from './state/gatheringState.ts';

export function useGatheringListFetch() {
  const { request } = useRequest();
  const setList = useSetRecoilState(gatheringListState);

  const fetchGatherings = (page: number, type?: string, status?: string) => {
    request(
      () =>
        api
          .get('/bgm-agit/gatherings', {
            params: {
              page,
              ...(type ? { type } : null),
              ...(status ? { status } : null),
            },
          })
          .then(res => res.data),
      setList
    );
  };

  return fetchGatherings;
}

export function useGatheringDetailFetch() {
  const { request } = useRequest();
  const setDetail = useSetRecoilState(gatheringDetailState);

  const fetchGatheringDetail = (id: number) => {
    request(() => api.get(`/bgm-agit/gatherings/${id}`).then(res => res.data), setDetail);
  };

  return fetchGatheringDetail;
}
