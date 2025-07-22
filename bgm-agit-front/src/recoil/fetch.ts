import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { mainMenuState } from './menuState.ts';
import api from '../utils/axiosInstance.ts';

type SubMenu = { name: string; link: string };
type MenuItem = { name: string; subMenu: SubMenu[] };

export default function useFetchMainMenu() {
  const setMainMenu = useSetRecoilState(mainMenuState);

  useEffect(() => {
    const fetchMainMenu = async () => {
      try {
        const response = await api.get<MenuItem[]>('/main-menu'); // 실제 API 경로
        setMainMenu(response.data);
      } catch (error) {
        console.error('메인 메뉴 불러오기 실패:', error);

        // 임시 메뉴 데이터 하드코딩
        const fallbackMenu: MenuItem[] = [
          {
            name: '소개',
            subMenu: [
              { name: 'BGM아지트 소개', link: '/about' },
              { name: '보유게임', link: '' },
            ],
          },
          {
            name: '예약하기',
            subMenu: [
              { name: '룸', link: '' },
              { name: '대탁', link: '' },
              { name: '마작강의 예약', link: '' },
            ],
          },
          {
            name: '메뉴',
            subMenu: [
              { name: '음료', link: '' },
              { name: '식사', link: '' },
              { name: '스낵', link: '' },
            ],
          },
          {
            name: '커뮤니티',
            subMenu: [
              { name: '공지사항', link: '' },
              { name: '게시판', link: '' },
            ],
          },
        ];

        setMainMenu(fallbackMenu);
      }
    };

    fetchMainMenu();
  }, [setMainMenu]);
}
