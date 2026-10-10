import styled, { css } from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, focusRing, inputStyle, type ButtonVariant } from '../styles/mixins.ts';

const c = theme.colors;

// 예전엔 color 로 바탕색을 직접 받았다. tsx 가 넘기는 같은 값을 버튼 종류로 읽는다
// (취소처럼 색이 겹치는 버튼은 tsx 에서 $variant 로 직접 지정)
const variantFromColor = (color?: string): ButtonVariant => {
  switch ((color ?? '').toUpperCase()) {
    case '#1A7D55': // 저장
      return 'primary';
    case '#FF5E57': // 삭제
      return 'danger';
    case '#F2EDEA': // 답변달기
      return 'ghost';
    default: // 수정·목록·취소
      return 'secondary';
  }
};

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

export const InputBox = styled.input<WithTheme>`
  ${inputStyle};
  flex-shrink: 0;
  margin-bottom: ${theme.space.md};
  font-size: 16px;
  font-weight: 600;
`;

export const EditorBox = styled.section<WithTheme>`
  flex: 1;
  min-height: 0; /* 이게 핵심! */

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
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.lg};
`;

export const Button = styled.button<WithTheme & { color: string; $variant?: ButtonVariant }>`
  ${({ color, $variant }) => buttonStyle($variant ?? variantFromColor(color))};
  /* 색은 예전처럼 color 로 꽉 채운다(흰 글씨). 옅은 바탕(댓글달기·답글)만 진갈색 글씨 */
  background: ${({ color }) => color};
  border-color: ${({ color }) => color};
  color: ${({ color }) => ((color ?? '').toUpperCase() === c.basicColor.toUpperCase() ? c.bronzeColor : c.white)};

  &:hover:not(:disabled) {
    background: ${({ color }) => color};
    border-color: ${({ color }) => color};
    opacity: 0.85;
  }
`;

// 글 카드의 윗부분: 작성자·날짜 줄 + 제목. 아래 파일 목록·본문과 이어져 한 장의 카드가 된다
export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${c.basicColor};
  border: 1px solid ${c.basicColor};
  border-top-color: ${c.bronzeColor};
  border-radius: ${theme.radius.lg} ${theme.radius.lg} 0 0;
  padding: ${theme.space.xl} ${theme.space.xl} ${theme.space.lg};

  div {
    display: flex;
    align-items: center;
    gap: ${theme.space.md};
    width: 100%;
    order: 2;
    margin-top: ${theme.space.sm};

    h3 {
      color: ${c.bronzeColor};
      font-size: 14px;
      font-weight: 700;
    }

    span {
      color: ${c.subColor};
      font-size: 14px;
    }
  }

  h2 {
    order: 1;
    margin: 0;
    color: ${c.subColor};
    font-family: ${theme.fonts.display};
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.4;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};

    h2 {
      font-size: 19px;
    }

    div h3,
    div span {
      font-size: 13px;
    }
  }
`;

// 글 카드의 본문 (ck-content 규칙은 전역에 있다)
export const ContentBox = styled.div<WithTheme>`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 360px);
  padding: ${theme.space.xl};
  margin-bottom: ${theme.space.xl};
  background: ${c.surface};
  color: ${c.subColor};
  border: 1px solid ${c.basicColor};
  border-bottom-color: ${c.bronzeColor};
  border-top: none;
  border-radius: 0 0 ${theme.radius.lg} ${theme.radius.lg};
  box-shadow: ${theme.shadow.sm};
  overflow-wrap: anywhere;

  iframe {
    width: 100%;
    height: auto; /* 고정 height 제거 */
    aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
    max-width: 100%;
    border: none;
    display: block;
  }

  img {
    max-width: 100%;
    height: auto;
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

export const ReplyBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${theme.space.lg};
  padding: ${theme.space.xl};
  margin-bottom: ${theme.space.xl};
  background: ${c.surfaceAlt};
  border-radius: ${theme.radius.lg};

  .textarea-box {
    display: flex;
    padding: ${theme.space.sm} 0;
    flex-direction: column;
    gap: ${theme.space.sm};
    justify-content: right;

    .reply-button-box {
      justify-content: flex-end;
    }
  }

  .reply-button-box {
    display: flex;
    flex-wrap: wrap;
    margin-top: ${theme.space.sm};
    gap: ${theme.space.xs};

    button {
      height: 34px;
      padding: 0 12px;
      font-size: 13px;

      @media ${theme.device.mobile} {
        height: 44px;
        padding: 0 16px;
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

    h3 {
      display: flex;
      align-items: center;
      gap: ${theme.space.sm};
      color: ${c.bronzeColor};
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.02em;

      svg {
        color: ${c.bronzeColor};
      }

      span {
        color: ${c.bronzeColor};
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

  .reply-children-box {
    display: flex;
    gap: ${theme.space.sm};
    margin-top: ${theme.space.md};
    padding: ${theme.space.md};
    background: ${c.surface};
    border-radius: ${theme.radius.md};

    > svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: ${c.textSubtle};
    }

    > div {
      flex: 1;
      min-width: 0;
    }
  }

  .reply-top {
    font-size: 13px;
    color: ${c.navColor};
    margin-bottom: ${theme.space.sm};

    strong {
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

  /* 관리자 답변 글: 회색 판 위의 흰 카드. 본문 높이는 내용만큼 */
  ${ContentBox} {
    min-height: 160px;
    margin-bottom: 0;
  }

  ${ButtonBox} {
    margin-bottom: 0;
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

// 첨부 파일: 글 카드 가운데 띠. 수정 화면(EditorWrapper 안)에서는 카드 없이 놓인다
export const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: ${theme.space.sm};
  padding: ${theme.space.md} ${theme.space.xl};
  background: ${c.surface};
  border: 1px solid ${c.basicColor};
  border-top: none;
  color: ${c.bronzeColor};

  li {
    display: flex;
    align-items: center;
    gap: ${theme.space.sm};
    min-width: 0;
    font-size: 13px;

    a {
      display: flex;
      align-items: center;
      gap: ${theme.space.sm};
      min-height: 36px;
      max-width: 100%;
      padding: 0 12px;
      background-color: ${c.basicColor};
      border: 1px solid ${c.basicColor};
      border-radius: ${theme.radius.pill};
      color: ${c.bronzeColor};
      cursor: pointer;
      overflow-wrap: anywhere;
      ${focusRing};

      &:hover {
        background-color: ${c.subTextBoxColor};
        color: ${c.bronzeColor};
      }
    }

    > svg {
      cursor: pointer;
      color: ${c.danger};
    }
  }

  ${EditorWrapper} & {
    flex-shrink: 0;
    padding: 0;
    margin-bottom: ${theme.space.sm};
    background: transparent;
    border: none;
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.md} ${theme.space.lg};

    li a {
      min-height: 44px;
    }
  }
`;

const fileButton = css`
  height: 36px;
  margin-right: ${theme.space.md};
  padding: 0 14px;
  background: ${c.noticeColor};
  color: ${c.white};
  border: 1px solid ${c.noticeColor};
  border-radius: ${theme.radius.md};
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

export const StyledFileInput = styled.input<WithTheme>`
  flex-shrink: 0;
  margin-bottom: ${theme.space.md};
  width: 100%;
  padding: ${theme.space.sm} 0;
  border: none;
  color: ${c.textMuted};
  font-size: 14px;

  /* 두 선택자를 한 규칙에 묶으면 모르는 쪽 브라우저가 규칙 전체를 버린다 */
  &::file-selector-button {
    ${fileButton};
  }

  &::-webkit-file-upload-button {
    ${fileButton};
  }

  ${focusRing};
`;
