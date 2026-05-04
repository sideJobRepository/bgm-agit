'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';

export default function MyRankRedirectPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?redirect=${encodeURIComponent('/my-rank')}`);
      return;
    }
    if (user) {
      router.replace(`/rank/${user.id}`);
    }
  }, [user, router]);

  return null;
}
