import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { useLectureStore } from '@/store/lecture';

export type params = {
  year?: number;
  month?: number;
  day?: string;
};

export function useFetchLectureList() {
  const { request } = useRequest();
  const setLecture = useLectureStore((state) => state.setLecture);

  const fetchLecture = (params: params) => {
    console.log('parma', params);
    request(() => api.get(`/bgm-agit/lecture`, { params }).then((res) => res.data), setLecture, {
      ignoreErrorRedirect: true,
    });
  };

  return fetchLecture;
}
