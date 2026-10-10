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

// 예전엔 bgColor 색 띠였다. 지금은 흰 바탕 제목 영역이라 bgColor 는 받기만 하고 쓰지 않는다(포인트 색 하나로 통일)
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding-bottom: ${theme.space.xl};
  border-bottom: 2px solid ${c.primary};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding-bottom: ${theme.space.lg};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-size: 30px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: 24px;
    }
  }
`;

export const CreateButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};

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
  color: ${c.textSubtle};
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
  color: ${c.textStrong};
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
  color: ${c.textMuted};
  font-size: 15px;
  font-weight: 600;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
