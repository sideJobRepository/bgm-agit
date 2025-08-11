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
      navigate('/');
    });
  }, []);

  return null;
}
