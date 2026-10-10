import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props';

export const Wrapper = styled.div<WithTheme>`
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

export const AcademyTabBox = styled.section<WithTheme>`
  position: fixed;
  top: 0;
  height: 100px;
  width: 100%;
  max-width: 1500px;
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: white;
  z-index: 1000;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

export const ImgBox = styled.div`
`
export const TabButtonBox = styled.div`
    display: flex;
  gap: 12px;
`

export const TabButton = styled.button<{ active: boolean } & WithTheme>`
  background-color: transparent;;
  color: ${({ active, theme }) => (active ? theme.colors.blueColor : theme.colors.text)};
  border: none;
  padding: 6px 10px;
  font-size: ${({ active, theme }) => (active ? theme.sizes.menu : theme.sizes.large)}; 
  font-weight: 800;
  cursor: pointer;
`;

export const TabWrap = styled.div`
    display: flex;
  flex-direction: column;
  padding: 24px;
  margin-top: 100px;
`