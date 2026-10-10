import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, cardStyle, inputStyle, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
  }
`;

// 개편 전처럼 bgColor 색 띠 + 흰 글씨. 색 띠라 안쪽 여백(예전 값 20px/14px)을 같이 준다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding: 20px;
  background-color: ${({ bgColor }) => bgColor};
  color: ${c.white};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding: 14px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    color: ${c.white};
    font-size: 30px;
  }

  p {
    color: ${c.white};
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: 24px;
    }
  }
`;

export const CreateButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
  /* 개편 전: 색 띠 위 흰 버튼 + 남색 글씨 */
  background: ${c.white};
  border-color: ${c.white};
  color: ${c.info};

  &:hover:not(:disabled) {
    background: ${c.white};
    border-color: ${c.white};
    opacity: 0.9;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
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
    /* 개편 전: 남색 채운 버튼 */
    background: ${c.info};
    border-color: ${c.info};

    &:hover:not(:disabled) {
      background: ${c.info};
      border-color: ${c.info};
      opacity: 0.9;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    margin: ${theme.space.lg} 0;
  }
`;

// 카탈로그형 카드 그리드
export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${theme.space.xl} ${theme.space.lg};

  @media ${theme.device.tablet} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media ${theme.device.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.space.md};
  }
`;

export const Card = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: ${theme.space.md};
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
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.surfaceAlt};

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
    padding: ${theme.space.sm} 2px 2px;
  }
`;

export const CardTitle = styled.div<WithTheme>`
  margin-bottom: ${theme.space.sm};
  color: ${c.subColor};
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    ${badgeStyle('neutral')};
  }

  span:first-child {
    ${badgeStyle('primary')};
  }
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  padding: 56px 0;
  text-align: center;
  color: ${c.navColor};
  font-size: 15px;
  font-weight: 600;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
