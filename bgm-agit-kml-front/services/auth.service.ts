import { useUserStore } from '@/store/user';
import { useRequest } from '@/hooks/useRequest';
import api from '@/lib/axiosInstance';
import { tokenStore } from '@/services/tokenStore';
import Swal from 'sweetalert2';
import { alertDialog } from '@/utils/alert';

export function useLoginPost() {
  const { request } = useRequest();
  const setUser = useUserStore((state) => state.setUser);

  const postUser = (code: string, name: string, onSuccess?: () => void) => {
    request(
      () =>
        api.post(`/bgm-agit/next/${name}-login`, { code }).then(res => {
          const token = res.data.token as string;
          tokenStore.set(token);

          const user = res.data.user;

          return user;
        }),
      user => {
        setUser(user);

        onSuccess?.();
        alertDialog('로그인에 성공하였습니다..', 'success');

      }
    );
  };

  return { postUser };
}