import { useRecoilValue } from 'recoil';
import { mainMenuState } from '../../recoil';
import { IoChevronForward } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MainMenu } from '../../types/menu.ts';
import { Wrapper, NavBox } from './Nav.styles.ts';

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const menus = useRecoilValue(mainMenuState);
  const pathname = location.pathname;

  // 메뉴에 없는 상세 화면은 속한 메뉴 경로로 찾는다
  const menuPath = pathname === '/serviceRequestDetail' ? '/service-request' : pathname;
  const { mainMenu, subMenu } = findMenuByPath(menuPath, menus);
  const isReviewDetailPath = pathname.startsWith('/review/');

  function findMenuByPath(path: string, menus: MainMenu[]) {
    for (const main of menus) {
      for (const sub of main.subMenu) {
        if (sub.link === path) {
          return { mainMenu: main, subMenu: sub };
        }
      }
    }
    return { mainMenu: null, subMenu: null };
  }


  return (
    <Wrapper>
      <NavBox>
        {mainMenu && (
          <>
            <a
              onClick={() => {
                navigate('/');
              }}
            >
              홈
            </a>
            <IoChevronForward />
            <span>{mainMenu.name}</span>
            <IoChevronForward />
            <span>{subMenu?.name}</span>
          </>
        )}
        {!mainMenu && pathname !== '/' && (
          <>
            <a
              onClick={() => {
                navigate('/');
              }}
            >
              홈
            </a>
            <IoChevronForward />
            <span>커뮤니티</span>
            <IoChevronForward />
            <a
              onClick={() => {
                let path = '/notice';
                if (pathname === '/noticeDetail') {
                  path = '/notice';
                } else if (pathname === '/freeDetail') {
                  path = '/free';
                } else if (pathname === '/inquiryDetail') {
                  path = '/inquiry';
                } else if (pathname === '/review/new' || isReviewDetailPath) {
                  path = '/review';
                }
                navigate(path);
              }}
            >
              {pathname === '/noticeDetail' && '공지사항'}
              {pathname === '/freeDetail' && '자유 게시판'}
              {pathname === '/inquiryDetail' && '1:1문의'}
              {(pathname === '/review/new' || isReviewDetailPath) && '후기'}
            </a>
          </>
        )}
      </NavBox>
    </Wrapper>
  );
}
