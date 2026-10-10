import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, focusRing } from '../styles/mixins.ts';

const c = theme.colors;

export const PopupWrapper = styled.div<WithTheme>`
  width: 800px;
  position: relative;
  height: calc(100vh - 120px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: ${theme.radius.lg} ${theme.radius.lg} 0 0;
  background: ${c.surface};
  color: ${c.textBody};

  @media ${({ theme }) => theme.device.tablet} {
    width: calc(100vw - 40px);
  }
`;

export const ButtonBox = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.space.md} ${theme.space.lg};
  gap: ${theme.space.sm};

  @media ${theme.device.mobile} {
    padding: ${theme.space.md};
  }
`;

// 예전처럼 color 로 꽉 채운 버튼(흰 글씨) — 닫기 = 빨강, 오늘 하루 보지 않기 = 보라
export const Button = styled.button<WithTheme & { color: string }>`
  ${buttonStyle('primary', 'md')};
  background: ${({ color }) => color};
  border-color: ${({ color }) => color};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${({ color }) => color};
    border-color: ${({ color }) => color};
    opacity: 0.85;
  }

  @media ${theme.device.mobile} {
    flex: 1;
    padding: 0 12px;
    font-size: 14px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${theme.space.xl} ${theme.space.xl} ${theme.space.lg};
  background-color: ${c.basicColor};
  border-bottom: 1px solid ${c.basicColor};

  div {
    display: flex;
    align-items: center;
    gap: ${theme.space.md};
    width: 100%;

    h3 {
      ${badgeStyle('primary')};
      color: ${c.bronzeColor};
      margin: 0;
      font-size: 13px;
    }

    span {
      margin-left: auto;
      color: ${c.subColor};
      font-size: 14px;
    }
  }

  h2 {
    margin: ${theme.space.md} 0 0;
    color: ${c.subColor};
    font-family: ${theme.fonts.display};
    font-size: 24px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -0.02em;
    word-break: keep-all;

    @media ${theme.device.mobile} {
      font-size: 20px;
    }
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const ContentBox = styled.div<WithTheme>`
  width: 100%;
  padding: ${theme.space.xl};
  flex: 1;
  color: ${c.subColor};
  line-height: 1.7;

  img {
    max-width: 100%;
    height: auto;
  }

  iframe {
    width: 100%;
    height: auto; /* 고정 height 제거 */
    aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
    max-width: 100%;
    border: none;
    border-radius: ${theme.radius.md};
    display: block;
  }

  figure.media {
    margin: 20px 0;
    max-height: unset;
    overflow: visible;
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  text-align: left;
  width: 100%;
  margin: 0;
  padding: ${theme.space.md} ${theme.space.xl};
  gap: ${theme.space.sm};
  list-style: none;
  color: ${c.bronzeColor};
  border-bottom: 1px solid ${c.basicColor};

  li {
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 13px;

    a {
      display: inline-flex;
      align-items: center;
      gap: ${theme.space.sm};
      min-height: 36px;
      max-width: 100%;
      padding: 0 ${theme.space.md};
      border: 1px solid ${c.basicColor};
      border-radius: ${theme.radius.pill};
      background-color: ${c.basicColor};
      color: ${c.bronzeColor};
      font-weight: 600;
      cursor: pointer;
      word-break: break-all;
      transition:
        background 0.15s ease,
        border-color 0.15s ease;

      &:hover {
        background-color: ${c.subTextBoxColor};
        border-color: ${c.subTextBoxColor};
        color: ${c.bronzeColor};
      }

      ${focusRing}

      @media ${theme.device.mobile} {
        min-height: 44px;
      }
    }

    svg {
      flex-shrink: 0;
      color: ${c.bronzeColor};
    }
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.md} ${theme.space.lg};
  }
`;

export const PopupBox = styled.div<WithTheme>`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${c.topBg};
  border-top: 1px solid ${c.basicColor};
  z-index: 3;
  border-radius: 0 0 ${theme.radius.lg} ${theme.radius.lg};
`;
