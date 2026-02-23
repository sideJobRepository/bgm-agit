'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLoginPost } from '@/services/auth.service';


export default function RedirectPage() {

  const { postUser } = useLoginPost();

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedRedirect = sessionStorage.getItem('post_login_redirect');
    const redirectPath =
      storedRedirect && storedRedirect.startsWith('/') ? storedRedirect : '/';
    const code = new URL(window.location.href).searchParams.get('code');

    const provider = pathname.split('/')[2];

    if (!code) {
      sessionStorage.removeItem('post_login_redirect');
      router.replace('/');
      return;
    }

    postUser(code, provider, () => {
      sessionStorage.removeItem('post_login_redirect');
      router.replace(redirectPath);
    });
  }, []);

  return null;
}
