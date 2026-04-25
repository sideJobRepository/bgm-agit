import { useUserStore } from '@/store/user';
import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { tokenStore } from '@/services/tokenStore';
import { alertDialog } from '@/utils/alert';

export interface LoginPayload {
  nickname: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  nickname: string;
  phoneNo: string;
  password: string;
}

export function useLoginPost() {
  const { request } = useRequest();
  const setUser = useUserStore((state) => state.setUser);

  const postUser = (payload: LoginPayload, onSuccess?: () => void) => {
    request(
      () =>
        api.post('/bgm-agit/next/login', payload).then((res) => {
          const token = res.data.token as string;
          tokenStore.set(token);
          return res.data.user;
        }),
      (user) => {
        setUser(user);

        onSuccess?.();
        alertDialog('로그인에 성공하였습니다.', 'success');
        const channel = new BroadcastChannel('auth');
        channel.postMessage({ type: 'LOGIN' });
        channel.close();
      },
      { ignoreErrorRedirect: true }
    );
  };

  return { postUser };
}

export function useSignupPost() {
  const { request } = useRequest();

  const postSignup = (payload: SignupPayload, onSuccess?: () => void) => {
    request(
      () => api.post('/bgm-agit/next/signup', payload).then((res) => res.data),
      (res) => {
        if (res?.success) {
          onSuccess?.();
          alertDialog(res.message ?? '회원가입이 완료되었습니다.', 'success');
        } else {
          alertDialog(res?.message ?? '회원가입에 실패했습니다.', 'error');
        }
      },
      { ignoreErrorRedirect: true }
    );
  };

  return { postSignup };
}
