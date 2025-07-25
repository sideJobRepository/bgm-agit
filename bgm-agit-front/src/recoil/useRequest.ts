// hooks/useRequest.ts
import { useSetRecoilState } from 'recoil';
import { loadingState, errorState } from './state/mainState.ts';
import { useNavigate } from 'react-router-dom';

export function useRequest() {
  const setLoading = useSetRecoilState(loadingState);
  const setError = useSetRecoilState(errorState);
  const navigate = useNavigate();

  const request = async <T>(fetchFn: () => Promise<T>, onSuccess: (data: T) => void) => {
    setLoading(true);
    try {
      const data = await fetchFn();
      onSuccess(data);
    } catch (e) {
      console.error(e);
      setError(true);
      navigate('/error');
    } finally {
      setLoading(false);
    }
  };

  return { request };
}
