// hooks/useRequest.ts
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { errorState, loadingState } from './state/mainState';
import { toast } from 'react-toastify';

interface RequestOptions {
  ignoreHttpError?: boolean;
}

export function useRequest() {
  const setLoading = useSetRecoilState(loadingState);
  const setError = useSetRecoilState(errorState);
  const navigate = useNavigate();

  const request = async <T>(
    fetchFn: () => Promise<T>,
    onSuccess: (data: T) => void,
    options?: RequestOptions
  ): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchFn();
      onSuccess(data);
    } catch (e) {
      setError(true);
      if (!options?.ignoreHttpError) navigate('/error');
      else toast.error('오류가 발생했습니다.');
      throw e; // 필요 시 상위로
    } finally {
      setLoading(false);
    }
  };

  return { request };
}
