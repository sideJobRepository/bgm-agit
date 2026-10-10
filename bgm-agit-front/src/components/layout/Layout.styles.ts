import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
`;

export const Inner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const TopArea = styled.header<WithTheme>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.topBg};
  z-index: 3;
`;

export const NavArea = styled.nav<WithTheme & { $home: boolean }>`
  display: flex;
  height: ${({ $home }) => ($home ? '0' : '30px')};
  background-color: ${({ theme }) => theme.colors.softColor};
  margin-top: 100px;
`;

export const MainArea = styled.main<WithTheme>`
  flex: 1;
  padding: 20px;
  display: flex;
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;
  @media ${({ theme }) => theme.device.tablet} {
    padding: 20px 10px;
  }
`;

export const FooterBox = styled.footer<WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.bottomBg};
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.5;
  justify-content: center;
  z-index: 2;
`;
