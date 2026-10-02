'use client';

import { useEffect } from 'react';
import { setupPwa } from '@/lib/pwa';

// 홈 화면 설치(PWA) 시작점. 판정·등록은 lib/pwa.ts
export default function PwaSetup() {
  useEffect(() => {
    setupPwa();
  }, []);
  return null;
}
