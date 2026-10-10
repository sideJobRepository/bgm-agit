import styled, { keyframes } from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, focusRing, inputStyle, type ButtonVariant } from '../styles/mixins.ts';

const c = theme.colors;

// 예전엔 color 로 바탕색을 직접 받았다. tsx 가 넘기는 같은 값을 버튼 종류로 읽는다
// (취소처럼 색이 겹치는 버튼은 tsx 에서 $variant 로 직접 지정)
const variantFromColor = (color?: string): ButtonVariant => {
  switch ((color ?? '').toUpperCase()) {
    case '#4A90E2': // 저장·댓글 작성
    case '#1A7D55':
      return 'primary';
    case '#D9625E': // 삭제
    case '#FF5E57':
      return 'danger';
    default: // 수정·파일 첨부
      return 'secondary';
  }
};

export const Wrapper = styled.div<WithTheme>`
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: auto;
  padding: ${theme.space.xl} ${theme.space.sm};

  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
    padding: ${theme.space.lg} 0;
  }
`;

export const EditorWrapper = styled.div`
  display: flex;
  margin-top: ${theme.space.md};
  flex-direction: column;
  height: calc(100vh - 400px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

export const InputBox = styled.input<WithTheme>`
  ${inputStyle};
  flex-shrink: 0;
  margin-bottom: ${theme.space.md};
  font-size: 18px;
  font-weight: 700;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
  }
`;

export const EditorBox = styled.section<WithTheme>`
  flex: 1;
  min-height: 0;

  .ck-editor {
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
  }

  .ck-editor__main {
    height: 100% !important;
  }

  .ck-editor__editable_inline {
    height: 100% !important;
    min-height: 0 !important;
    box-sizing: border-box;
    overflow: auto;
  }

  .ck.ck-toolbar {
    border-color: ${c.borderStrong} !important;
    border-radius: ${theme.radius.md} ${theme.radius.md} 0 0 !important;
    background: ${c.surfaceAlt} !important;
  }

  .ck.ck-editor__editable:not(.ck-focused) {
    border-color: ${c.borderStrong} !important;
  }

  .ck.ck-editor__main > .ck-editor__editable {
    border-radius: 0 0 ${theme.radius.md} ${theme.radius.md} !important;
    background: ${c.surface};
  }

  .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
    border-color: ${c.primary} !important;
    box-shadow: 0 0 0 3px ${c.primarySoft} !important;
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.space.sm};
  flex: 1;
  margin-bottom: ${theme.space.lg};
`;

export const FileButtonBox = styled.div<WithTheme>`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding-top: ${theme.space.sm};
  border-top: 1px solid ${c.lineColor};
`;

// 아이콘만 든 버튼이 많아서 최소 폭을 높이와 같게 둔다
export const Button = styled.button<WithTheme & { color: string; $variant?: ButtonVariant }>`
  ${({ color, $variant }) => buttonStyle($variant ?? variantFromColor(color))};
  /* 색은 예전처럼 color 로 꽉 채운다(흰 글씨) */
  background: ${({ color }) => color};
  border-color: ${({ color }) => color};
  color: ${c.white};
  min-width: 44px;

  &:hover:not(:disabled) {
    background: ${({ color }) => color};
    border-color: ${({ color }) => color};
    opacity: 0.8;
  }
  padding: 0 12px;

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

// 글 카드의 윗부분: 날짜·작성자·돌아가기 줄 + 제목. 아래 파일 목록·본문과 이어져 한 장의 카드가 된다
export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${c.softColor};
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.lg} ${theme.radius.lg} 0 0;
  padding: ${theme.space.xl} ${theme.space.xl} ${theme.space.lg};

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.md};
    width: 100%;
    order: 2;
    margin-top: ${theme.space.sm};

    span {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      min-width: 0;
      color: ${c.grayColor};
      font-size: 14px;

      strong {
        margin-left: ${theme.space.sm};
        color: ${c.grayColor};
        font-weight: 700;
      }
    }

    a {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: ${theme.space.xs};
      min-height: 36px;
      padding: 0 12px;
      border-radius: ${theme.radius.pill};
      color: ${c.grayColor};
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      ${focusRing};

      &:hover {
        background: ${c.lineColor};
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  h3 {
    order: 1;
    display: flex;
    align-items: center;
    margin: 0;
    color: ${c.inputColor};
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.4;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${theme.space.lg};

    h3 {
      font-size: 19px;
    }

    > div span {
      font-size: 13px;
    }

    > div a {
      min-height: 44px;
    }
  }
`;

// 글 카드의 본문 (ck-content 규칙은 전역에 있다)
export const ContentBox = styled.div<WithTheme>`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 500px);
  padding: ${theme.space.xl};
  margin-bottom: ${theme.space.xl};
  background: ${c.surface};
  color: ${c.subColor};
  border: 1px solid ${c.lineColor};
  border-top: none;
  border-radius: 0 0 ${theme.radius.lg} ${theme.radius.lg};
  box-shadow: ${theme.shadow.sm};
  overflow-wrap: anywhere;

  iframe {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    max-width: 100%;
    border: none;
    display: block;
  }

  figure.media {
    margin: 20px 0;
    max-height: unset;
    overflow: visible;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

// 파일 옆 작은 원형 아이콘. 예전 색값을 의미로 읽는다(빨강=삭제, 그 외=받기)
export const FileSvgBox = styled.div<{ $color: string }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: ${theme.radius.pill};
  background-color: ${({ $color }) => $color};

  svg {
    width: 12px;
    height: 12px;
    cursor: pointer;
    color: ${c.white};

    &:hover {
      opacity: 0.6;
    }
  }
`;

// 첨부 파일: 글 카드 가운데 띠. 수정 화면(EditorWrapper 안)에서는 카드 없이 놓인다
export const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  gap: ${theme.space.sm};
  padding: ${theme.space.md} ${theme.space.xl};
  background: ${c.surface};
  border: 1px solid ${c.lineColor};
  border-top: none;
  color: ${c.inputColor};

  li {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: ${theme.space.sm};
    max-width: 100%;
    font-size: 13px;
    overflow-wrap: anywhere;

    a {
      display: flex;
      align-items: center;
      gap: ${theme.space.sm};
      min-height: 36px;
      max-width: 100%;
      padding: 0 12px;
      background-color: ${c.border};
      border: 1px solid ${c.border};
      border-radius: ${theme.radius.pill};
      color: ${c.inputColor};
      cursor: pointer;
      ${focusRing};

      &:hover {
        background-color: ${c.lineColor};
      }
    }
  }

  ${EditorWrapper} & {
    flex-shrink: 0;
    padding: ${theme.space.sm} 0;
    margin-bottom: ${theme.space.sm};
    background: transparent;
    border: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${theme.space.md} ${theme.space.lg};

    li a {
      min-height: 44px;
    }
  }
`;

export const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

// 불러오는 동안의 자리 표시(빛이 지나가는 효과)
export const SkeletonBox = styled.div`
  background: linear-gradient(90deg, ${c.surfaceAlt} 25%, ${c.border} 50%, ${c.surfaceAlt} 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${theme.radius.sm};
`;

export const ReplyBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${theme.space.lg};
  padding: ${theme.space.xl};
  background: ${c.surfaceAlt};
  border-radius: ${theme.radius.lg};

  .textarea-box {
    display: flex;
    padding: ${theme.space.sm} 0;
    flex-direction: column;
    gap: ${theme.space.sm};
    justify-content: right;
  }

  .reply-button-box {
    display: flex;
    flex-wrap: wrap;
    margin-top: ${theme.space.sm};
    gap: ${theme.space.xs};
    justify-content: flex-end;

    button {
      height: 34px;
      min-width: 34px;
      padding: 0 10px;
      font-size: 13px;

      svg {
        width: 16px;
        height: 16px;
      }

      @media ${({ theme }) => theme.device.mobile} {
        height: 44px;
        min-width: 44px;
      }
    }
  }

  .reply-header-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.md};
    padding-bottom: ${theme.space.lg};
    border-bottom: 1px solid ${c.border};
    font-family: ${theme.fonts.display};

    h4 {
      display: flex;
      align-items: center;
      gap: ${theme.space.sm};
      color: ${c.inputColor};
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.02em;

      svg {
        width: 18px;
        height: 18px;
        color: ${c.inputColor};
      }

      span {
        color: ${c.inputColor};
        font-size: 15px;
      }
    }
  }

  .reply-box {
    display: flex;
    flex-direction: column;
    padding-bottom: ${theme.space.lg};
    border-bottom: 1px solid ${c.border};
  }

  .reply-top {
    font-size: 13px;
    color: ${c.navColor};
    margin-bottom: ${theme.space.sm};

    strong {
      font-family: ${theme.fonts.display};
      color: ${c.text};
      font-size: 15px;
      font-weight: 700;
      margin-right: ${theme.space.sm};
    }
  }

  .reply-center {
    color: ${c.subColor};
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const TextArea = styled.textarea<WithTheme>`
  ${inputStyle};
  min-height: 96px;
  resize: vertical;
  line-height: 1.6;
  color: ${c.inputColor};
  border-color: ${c.grayColor};

  &:focus {
    border-color: ${c.inputColor};
    box-shadow: none;
  }
`;
