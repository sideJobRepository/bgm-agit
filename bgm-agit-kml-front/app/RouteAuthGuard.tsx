'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { refreshToken } from '@/lib/axiosInstance';
import { useUserStore } from '@/store/user';

const protectedPrefixes = ['/write', '/myPage'];

export default function RouteAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    let mounted = true;

    const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!isProtected || user) return;

    (async () => {
      const token = await refreshToken();
      if (!mounted) return;

      if (!token) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname, user, router]);

  return null;
}
