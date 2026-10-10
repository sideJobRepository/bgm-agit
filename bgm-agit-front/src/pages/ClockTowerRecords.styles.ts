import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, cardStyle, focusRing, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 선인승/악마승 진영색. 의미를 담은 색이라 토큰으로 바꾸지 않는다
const GOOD_COLOR = '#1565C0';
const EVIL_COLOR = '#6A1B9A';

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

export const HeaderButtons = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${theme.space.sm};

  @media ${theme.device.mobile} {
    > button {
      flex: 1;
    }
  }
`;

export const CreateButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
`;

export const GhostButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'md')};
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.lg};
  margin-top: ${theme.space.xl};

  @media ${theme.device.mobile} {
    grid-template-columns: 1fr;
    gap: ${theme.space.md};
    margin-top: ${theme.space.lg};
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

  ${focusRing};
`;

export const Thumb = styled.div`
  flex: 0 0 84px;
  width: 84px;
  height: 84px;
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
  font-size: 30px;
  color: ${c.textSubtle};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  min-width: 0;
`;

export const CardTitle = styled.div<WithTheme>`
  min-width: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.textStrong};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 진영색 배지(흰 글씨)
export const ResultTag = styled.span<{ $evil: boolean }>`
  ${badgeStyle('primary')};
  flex: 0 0 auto;
  color: ${c.onPrimary};
  background: ${({ $evil }) => ($evil ? EVIL_COLOR : GOOD_COLOR)};
`;

// 임시저장 = 골드 배지
export const DraftTag = styled.span`
  ${badgeStyle('accent')};
  flex: 0 0 auto;
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.md};
  margin: 6px 0 4px;
  font-size: 13px;
  color: ${c.textMuted};
`;

export const Participants = styled.div<WithTheme>`
  font-size: 14px;
  color: ${c.textBody};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Writer = styled.div<WithTheme>`
  margin-top: auto;
  padding-top: 6px;
  font-size: 12px;
  color: ${c.textMuted};
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

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
