import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, cardStyle, focusRing, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 선인승/악마승 진영색. 의미를 담은 색이라 토큰으로 바꾸지 않는다
const GOOD_COLOR = '#1565C0';
const EVIL_COLOR = '#6A1B9A';
// 시계탑 기록 화면 고유색(예전 화면 값 그대로) — 머리띠 위 기록하기 버튼 글자 / 임시저장 배지
const CT_GREEN = '#2E7D32';
const DRAFT_COLOR = '#B5651D';

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

  @media ${({ theme }) => theme.device.mobile} {
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
  background: ${c.white};
  color: ${CT_GREEN};
  border-color: ${c.white};

  &:hover:not(:disabled) {
    background: ${c.white};
    border-color: ${c.white};
    opacity: 0.9;
  }
`;

export const GhostButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'md')};
  background: transparent;
  color: ${c.white};
  border-color: ${c.white};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }
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
  border-color: ${c.lineColor};
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
  background: ${c.basicColor};

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
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${c.navColor};
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
  color: ${c.subColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 진영색 배지(흰 글씨)
export const ResultTag = styled.span<{ $evil: boolean }>`
  ${badgeStyle('primary')};
  flex: 0 0 auto;
  color: ${c.white};
  background: ${({ $evil }) => ($evil ? EVIL_COLOR : GOOD_COLOR)};
`;

// 임시저장 = 주황 갈색 배지(예전 화면)
export const DraftTag = styled.span`
  ${badgeStyle('accent')};
  flex: 0 0 auto;
  color: ${c.white};
  background: ${DRAFT_COLOR};
`;

export const Meta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.md};
  margin: 6px 0 4px;
  font-size: 13px;
  color: ${c.navColor};
`;

export const Participants = styled.div<WithTheme>`
  font-size: 14px;
  color: ${c.subColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Writer = styled.div<WithTheme>`
  margin-top: auto;
  padding-top: 6px;
  font-size: 12px;
  color: ${c.navColor};
`;

export const Empty = styled.div<WithTheme>`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: ${c.navColor};
  font-size: 15px;
  font-weight: 600;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;
