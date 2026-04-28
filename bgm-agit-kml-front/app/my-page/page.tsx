'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMyPageStore } from '@/store/myPage';

export default function MyPageRoute() {
  const router = useRouter();
  const open = useMyPageStore((state) => state.open);

  useEffect(() => {
    open();
    router.replace('/');
  }, [open, router]);

  return null;
}
