import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginPost } from '../recoil/fetch.ts';

export default function RedirectPage() {
  const navigate = useNavigate();
  const { postUser } = useLoginPost();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');

    const pathname = window.location.pathname;
    const provider = pathname.split('/')[2];

    if (!code) {
      navigate('/');
      return;
    }

    postUser(code, provider, () => {
      navigate('/');
    });
  }, []);

  return null;
}
