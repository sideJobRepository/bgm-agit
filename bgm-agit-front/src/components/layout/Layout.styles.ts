import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

// 상단 고정 헤더 높이. TopHeader.styles.ts 의 HEADER_HEIGHT 와 같은 값이어야 한다
const HEADER_HEIGHT = '80px';

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
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
  height: ${HEADER_HEIGHT};
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 3;
`;

export const NavArea = styled.nav<WithTheme & { $home: boolean }>`
  display: flex;
  height: ${({ $home }) => ($home ? '0' : '40px')};
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
  margin-top: ${HEADER_HEIGHT};
  overflow: hidden;
`;

export const MainArea = styled.main<WithTheme>`
  flex: 1;
  padding: 20px;
  display: flex;
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;
  background-color: ${({ theme }) => theme.colors.surfaceSunken};

  @media ${({ theme }) => theme.device.tablet} {
    padding: 20px 16px;
  }
`;

export const FooterBox = styled.footer<WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.footer};
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.6;
  justify-content: center;
  z-index: 2;
`;
