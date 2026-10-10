import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, cardStyle, sectionTitleStyle } from '../styles/mixins.ts';

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

export const Badges = styled.div`
  display: flex;
  gap: ${theme.space.md};
  flex-shrink: 0;

  @media ${theme.device.mobile} {
    > div {
      flex: 1;
    }
  }
`;

// 통계 타일 (이번달 / 누적)
export const Badge = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  padding: ${theme.space.md} ${theme.space.lg};

  span {
    color: ${c.textMuted};
    font-size: 13px;
    font-weight: 700;
  }

  strong {
    margin-top: 2px;
    color: ${c.primary};
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: ${theme.space.xl} 0 ${theme.space.md};
  color: ${c.textStrong};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.md};

  @media ${theme.device.mobile} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Card = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  gap: ${theme.space.md};
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
`;

export const Thumb = styled.div`
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.surfaceAlt};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${c.textSubtle};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CardTitle = styled.div<WithTheme>`
  color: ${c.textStrong};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.sm};
`;

export const Count = styled.span`
  ${badgeStyle('primary')};
`;

export const Last = styled.span<WithTheme>`
  color: ${c.textMuted};
  font-size: 13px;
`;

export const MonthlyList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${theme.space.sm};
`;

export const MonthlyItem = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.sm};
  padding: ${theme.space.md} ${theme.space.lg};
  border-radius: ${theme.radius.md};

  span {
    color: ${c.textMuted};
    font-size: 14px;
  }

  strong {
    color: ${c.textStrong};
    font-size: 15px;
    font-weight: 800;
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
