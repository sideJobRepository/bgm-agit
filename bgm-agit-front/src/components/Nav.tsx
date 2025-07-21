import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { useRecoilValue } from 'recoil';
import { mainMenuState } from '../recoil';
import { IoChevronForward } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
import type { MainMenu } from '../types/menu.ts';

export default function Nav() {
  const location = useLocation();
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
      {mainMenu && (
        <>
          <span>{mainMenu.name}</span>
          <IoChevronForward />
        </>
      )}
      <span>{subMenu?.name}</span>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
  width: 100%;
  height: 30px;
  display: flex;
  padding: 0 20px;
  align-items: center;
  justify-content: end;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
