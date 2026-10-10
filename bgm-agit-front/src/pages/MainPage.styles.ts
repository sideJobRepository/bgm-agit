import styled, { css } from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { cardStyle, focusRing, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 메인 섹션 카드 공통 — 흰 카드 + 1px 테두리 + 넉넉한 안쪽 여백
const sectionCard = css`
  ${cardStyle};
  padding: ${theme.space.xl};
  color: ${c.textBody};
  min-width: 0;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

// "더보기" 링크. href 가 없는 a 라 포커스는 못 받지만 마우스·터치 영역은 넉넉히 둔다
const moreLink = css`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: ${theme.radius.pill};
  color: ${c.primary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${c.primarySoft};
  }

  ${focusRing}

  @media ${theme.device.mobile} {
    min-height: 44px;
    font-size: 14px;
  }
`;

export const TopSection = styled.section<WithTheme>`
  ${sectionCard};
  display: flex;
  gap: ${theme.space.xl};
  width: 100%;
  height: 100%;
  margin-top: ${theme.space.xl};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    gap: ${theme.space.lg};
    margin-top: ${theme.space.lg};
  }
`;

export const LeftSection = styled.section<WithTheme>`
  width: 36%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${theme.space.xl};
  min-width: 0;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    gap: ${theme.space.lg};
  }
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.lg};

  div {
    display: flex;
    align-items: center;
    line-height: 1;

    /* 작은 머리글 — 골드는 여기에만 쓴다(본문 대비를 위해 accentText) */
    p {
      display: inline-flex;
      align-items: center;
      padding: 5px 10px;
      border-radius: ${theme.radius.pill};
      background: ${c.accentSoft};
      color: ${c.accentText};
      font-size: 13px;
      font-weight: 700;
    }

    a {
      ${moreLink};
      margin-left: auto;
    }
  }

  h2 {
    margin: 0;
    color: ${c.textStrong};
    font-size: 28px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -0.02em;
  }

  @media ${({ theme }) => theme.device.mobile} {
    gap: ${theme.space.md};

    h2 {
      font-size: 20px;
    }
  }
`;

export const LogoBox = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.space.sm};
  padding: ${theme.space.lg} ${theme.space.sm};
  border-radius: ${theme.radius.lg};
  background: ${c.surfaceSunken};
  justify-items: center;
  align-items: start;

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${theme.space.md} ${theme.space.xs};
  }
`;

// 특징 아이콘 — 연보라 원 위 보라 아이콘
export const GridItem = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;

  svg {
    box-sizing: content-box;
    width: 22px;
    height: 22px;
    padding: 13px;
    border-radius: ${theme.radius.pill};
    background: ${c.primarySoft};
    color: ${c.primary};
  }

  span {
    margin-top: ${theme.space.sm};
    color: ${c.textBody};
    font-size: 13px;
    font-weight: 700;
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.device.mobile} {
    svg {
      width: 18px;
      height: 18px;
      padding: 11px;
    }

    span {
      font-size: 12px;
    }
  }
`;

export const RightSection = styled.section<WithTheme>`
  width: 64%;
  min-width: 0;
  border-radius: ${theme.radius.md};
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const pairRow = css`
  display: flex;
  gap: ${theme.space.xl};
  width: 100%;
  margin: ${theme.space.xl} 0;

  @media ${theme.device.mobile} {
    flex-direction: column;
    gap: ${theme.space.lg};
    margin: ${theme.space.lg} 0;
  }
`;

export const GameFoodSection = styled.section<WithTheme>`
  ${pairRow};
`;

export const ReservationNoticeSection = styled.section<WithTheme>`
  ${pairRow};
`;

const halfCard = css`
  ${sectionCard};
  width: 50%;

  @media ${theme.device.mobile} {
    width: 100%;
  }
`;

export const GameSection = styled.section<WithTheme>`
  ${halfCard};
`;

export const FoodSection = styled.section<WithTheme>`
  ${halfCard};
`;

export const ReservationSection = styled.section<WithTheme>`
  ${halfCard};
`;

export const NoticeSection = styled.section<WithTheme>`
  ${halfCard};
  position: relative;
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  width: 100%;
  margin-bottom: ${theme.space.xl};

  /* 공지 카드의 "더보기"가 제목 줄 오른쪽에 붙으므로 겹치지 않게 비운다 */
  ${NoticeSection} & {
    padding-right: 72px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    margin-bottom: ${theme.space.lg};
  }
`;

export const SliderBox = styled.div<WithTheme>`
  width: 100%;
  min-width: 0;
`;

// 공지 카드 "더보기" — 제목 줄 오른쪽 위
export const ABox = styled.div<WithTheme>`
  position: absolute;
  top: ${theme.space.xl};
  right: ${theme.space.lg};
  display: flex;

  a {
    ${moreLink};
  }

  @media ${({ theme }) => theme.device.mobile} {
    top: ${theme.space.sm};
    right: ${theme.space.sm};
  }
`;
