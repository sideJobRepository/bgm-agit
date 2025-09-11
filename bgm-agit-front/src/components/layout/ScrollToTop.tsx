// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { searchState } from '../../recoil';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  //디테일 데이터
  const setPage = useSetRecoilState(searchState);

  useEffect(() => {
    console.log('확인');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setPage(() => ({
      name: '',
      category: null,
      page: 0, // 여기만 업데이트
    }));
  }, [pathname]);

  return null;
}
