import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { useRecoilValue } from 'recoil';
import { mainMenuState } from '../../recoil';
import { IoChevronForward } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MainMenu } from '../../types/menu.ts';

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const menus = useRecoilValue(mainMenuState);
  const pathname = location.pathname;

  const { mainMenu, subMenu } = findMenuByPath(pathname, menus);
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

const Wrapper = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  max-width: 1500px;
  min-width: 1280px;
  padding: 0 30px;
  margin: 0 auto;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const NavBox = styled.div<WithTheme>`
  display: flex;
  gap: 2px;
  justify-content: end;
  height: 100%;
  align-items: center;

  a {
    cursor: pointer;
  }
`;
