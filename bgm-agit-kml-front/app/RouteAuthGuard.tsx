'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { refreshToken } from '@/lib/axiosInstance';
import { useUserStore } from '@/store/user';
import { isProtectedPath } from '@/lib/authPaths';

export default function RouteAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    let mounted = true;

    if (!isProtectedPath(pathname) || user) return;

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
