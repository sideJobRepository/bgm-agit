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
        const response = await api.get<MenuItem[]>('/bgm-agit/main-menu'); // 실제 API 경로
        setMainMenu(response.data);
      } catch (error) {
        console.error('메인 메뉴 불러오기 실패:', error);

        // 임시 메뉴 데이터 하드코딩
        const fallbackMenu: MenuItem[] = [
          {
            name: '소개',
            subMenu: [
              { name: 'BGM 아지트 소개', link: '/about' },
              { name: '보유게임', link: '/detail/game' },
            ],
          },
          {
            name: '예약하기',
            subMenu: [
              { name: '룸', link: '/detail/room' },
              { name: '대탁', link: '' },
              { name: '마작 강의 예약', link: '' },
            ],
          },
          {
            name: '메뉴',
            subMenu: [
              { name: '음료', link: '/detail/drink' },
              { name: '식사', link: '/detail/food' },
            ],
          },
          {
            name: '커뮤니티',
            subMenu: [
              { name: '공지사항', link: '/notice' },
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
