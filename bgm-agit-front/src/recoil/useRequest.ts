// hooks/useRequest.ts
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { errorState, loadingState } from './state/mainState';
import { toast } from 'react-toastify';

interface RequestOptions {
  ignoreHttpError?: boolean;
}

/** 서버 ErrorMessageResponse 의 message. 없거나 빈 문자열이면 null */
function extractServerMessage(error: unknown): string | null {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;
  return typeof message === 'string' && message.trim() ? message : null;
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
      // 서버가 준 사유를 그대로 띄운다.
      //
      // 예전에는 전부 "오류가 발생했습니다."로 덮어써서, 예약이 왜 안 되는지
      // (이미 예약된 시간대 / 최소 인원 미달 / 연속되지 않은 시간 / 휴무일 …)
      // 손님도 개발자도 화면만 봐서는 알 수 없었다. ExceptionController 가 ErrorMessageResponse
      // 의 message 로 내려주므로 그걸 우선 쓰고, 없을 때만 기존 문구로 떨어진다.
      else toast.error(extractServerMessage(e) ?? '오류가 발생했습니다.');
      throw e; // 필요 시 상위로
    } finally {
      setLoading(false);
    }
  };

  return { request };
}
