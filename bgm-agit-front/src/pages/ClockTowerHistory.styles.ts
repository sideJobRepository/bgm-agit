import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, cardStyle, focusRing, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  padding: ${theme.space.xl} 0 ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xl};
  }
`;

// 예전엔 bgColor 색 띠였다. 흰 바탕 제목 영역으로 바꾸면서 bgColor 는 받기만 하고 쓰지 않는다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding: 0 0 ${theme.space.xl};
  border-bottom: 1px solid ${c.border};

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
  flex-shrink: 0;
  gap: ${theme.space.md};

  @media ${theme.device.mobile} {
    > div {
      flex: 1;
    }
  }
`;

// 이번달 / 누적 숫자 타일
export const Badge = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 96px;
  padding: ${theme.space.md} ${theme.space.lg};

  span {
    ${badgeStyle('accent')};
  }

  strong {
    color: ${c.primary};
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: ${theme.space.xxl} 0 ${theme.space.md};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.textStrong};

  @media ${theme.device.mobile} {
    margin-top: ${theme.space.xl};
    font-size: 17px;
  }
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.lg};

  @media ${theme.device.mobile} {
    grid-template-columns: 1fr;
    gap: ${theme.space.md};
  }
`;

export const Card = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  align-items: center;
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

  ${focusRing};
`;

export const Thumb = styled.div`
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.surfaceAlt};

  img {
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
  font-size: 26px;
  color: ${c.textSubtle};
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardTitle = styled.div<WithTheme>`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.textStrong};
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
  font-size: 13px;
`;

export const Last = styled.span<WithTheme>`
  font-size: 13px;
  color: ${c.textMuted};
`;

export const MonthlyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
`;

export const MonthlyItem = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  min-height: 44px;
  padding: 0 ${theme.space.lg};
  background: ${c.surface};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.pill};

  span {
    font-size: 14px;
    color: ${c.textMuted};
  }

  strong {
    font-size: 14px;
    font-weight: 800;
    color: ${c.primary};
  }
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: ${c.textMuted};
  font-size: 15px;
  font-weight: 600;
`;
