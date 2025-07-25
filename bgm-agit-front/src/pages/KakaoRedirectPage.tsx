import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginPost } from '../recoil/fetch.ts';

export default function KakaoRedirectPage() {
  const navigate = useNavigate();
  const { postUser } = useLoginPost();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');

    if (!code) {
      navigate('/');
      return;
    }

    postUser(code, () => {
      // BroadcastChannel 전역 저장
      const channel = new BroadcastChannel('auth');
      channel.postMessage({ type: 'login', user: JSON.parse(sessionStorage.getItem('user')!) });
      channel.close();

      navigate('/');
    });
  }, []);

  return null;
}
