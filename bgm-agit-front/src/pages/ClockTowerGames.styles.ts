import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle, focusRing, inputStyle, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 시계탑 화면 고유의 보라(예전 화면 값 그대로)
const CT_PURPLE = '#4A2C82';

export const Box = styled.div`
  padding: ${theme.space.xl} 0 ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xl};
  }
`;

// 예전 화면처럼 bgColor 색 띠 + 흰 글자
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding: ${theme.space.xl};
  background-color: ${({ bgColor }) => bgColor};
  color: ${c.white};

  @media ${theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding: ${theme.space.lg};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2,
  p {
    color: ${c.white};
  }

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    font-size: 30px;
  }

  @media ${theme.device.mobile} {
    h2 {
      font-size: 24px;
    }
  }
`;

export const CreateButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
  flex-shrink: 0;
  background: ${c.white};
  color: ${CT_PURPLE};
  border-color: ${c.white};

  &:hover:not(:disabled) {
    background: ${c.white};
    border-color: ${c.white};
    opacity: 0.9;
  }
`;

export const SearchRow = styled.div<WithTheme>`
  display: flex;
  gap: ${theme.space.sm};
  margin: ${theme.space.xl} 0;

  input {
    ${inputStyle};
    flex: 1;
    min-width: 0;
  }

  button {
    ${buttonStyle('primary', 'md')};
    flex-shrink: 0;
    background: ${CT_PURPLE};
    border-color: ${CT_PURPLE};
    color: ${c.white};

    &:hover:not(:disabled) {
      background: ${CT_PURPLE};
      border-color: ${CT_PURPLE};
      opacity: 0.9;
    }
  }

  @media ${theme.device.mobile} {
    margin: ${theme.space.lg} 0;
  }
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${theme.space.xl};

  @media ${theme.device.tablet} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.space.lg};
  }

  @media ${theme.device.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.space.md};
  }
`;

export const Card = styled.div<WithTheme>`
  ${cardStyle};
  ${focusRing};
  border-color: ${c.lineColor};
  display: flex;
  flex-direction: column;
  padding: ${theme.space.md};
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: ${c.borderStrong};
    box-shadow: ${theme.shadow.md};
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.sm};
  }
`;

export const Cover = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: ${c.basicColor};
  border-radius: ${theme.radius.md};
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${c.navColor};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

export const CardBody = styled.div`
  padding: ${theme.space.md} ${theme.space.xs} ${theme.space.xs};

  @media ${theme.device.mobile} {
    padding: ${theme.space.sm} ${theme.space.xs} ${theme.space.xs};
  }
`;

export const CardTitle = styled.div<WithTheme>`
  margin-bottom: 6px;
  color: ${c.subColor};
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
  word-break: keep-all;

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  color: ${c.navColor};
  font-size: 14px;

  span + span::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 3px;
    margin-right: 10px;
    border-radius: ${theme.radius.pill};
    background: ${c.navColor};
    vertical-align: middle;
  }

  @media ${theme.device.mobile} {
    font-size: 13px;
  }
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  padding: 48px 0;
  color: ${c.navColor};
  font-size: 15px;
  font-weight: 600;
  text-align: center;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
