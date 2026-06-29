import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginPost } from '../recoil/fetch.ts';

export default function RedirectPage() {
  const navigate = useNavigate();
  const { postUser } = useLoginPost();
  // OAuth code는 1회용 → 콜백이 두 번 실행돼도 로그인 요청은 단 한 번만 보낸다
  // (두 번 보내면 2번째가 "코드 이미 사용됨"으로 실패해 로그인 실패 토스트가 뜸)
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = new URL(window.location.href).searchParams.get('code');

    const pathname = window.location.pathname;
    const provider = pathname.split('/')[2];

    if (!code) {
      navigate('/');
      return;
    }

    postUser(
      code,
      provider,
      () => navigate('/'),
      () => navigate('/'),
    );
  }, []);

  return null;
}
