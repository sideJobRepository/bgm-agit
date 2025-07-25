import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoginPost } from '../recoil/fetch.ts';

export default function KakaoRedirectPage() {
  const navigate = useNavigate();
  const { postUser } = useLoginPost();

  useEffect(() => {
    const toastId = toast.loading('로그인 중 입니다.');
    const code = new URL(window.location.href).searchParams.get('code');

    if (!code) {
      toast.update(toastId, {
        render: '로그인 인가 코드가 없습니다.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      navigate('/');
      return;
    }

    postUser(code, () => {
      toast.update(toastId, {
        render: '로그인에 성공하였습니다.',
        type: 'success',
        isLoading: false,
        autoClose: 1000,
      });

      // BroadcastChannel 전역 저장
      const channel = new BroadcastChannel('auth');
      channel.postMessage({ type: 'login', user: JSON.parse(sessionStorage.getItem('user')!) });
      channel.close();

      navigate('/');
    });
  }, []);

  return null;
}
