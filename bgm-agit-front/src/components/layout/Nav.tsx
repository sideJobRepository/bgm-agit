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

  const { mainMenu, subMenu } = findMenuByPath(location.pathname, menus);

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
        {!mainMenu && location.pathname !== '/' && (
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
                navigate('/notice');
              }}
            >
              공지사항
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
