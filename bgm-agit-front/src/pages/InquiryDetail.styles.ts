import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

export const InputBox = styled.input<WithTheme>`
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0 8px;

  border: 1px solid #c4c4c4; /* CKEditor 기본 테두리 색상 */
  border-radius: 4px;
  box-shadow: none;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.noticeColor};
  }
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

  .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
    border-color: ${({ theme }) => theme.colors.noticeColor} !important;
    box-shadow: none !important;
  }
`;

export const ButtonBox = styled.div`
  flex-shrink: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 10px;
`;

export const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.basicColor};

  div {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.basicColor};

    h3 {
      display: flex;
      align-items: center;
      color: ${({ theme }) => theme.colors.bronzeColor};
      font-size: ${({ theme }) => theme.sizes.menu};
      font-weight: ${({ theme }) => theme.weight.bold};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.large};
      }
    }
    span {
      margin-left: auto;
      color: ${({ theme }) => theme.colors.subColor};
      font-size: ${({ theme }) => theme.sizes.medium};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.small};
      }
    }
  }

  h2 {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 20px 10px;
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.sizes.xlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    font-family: ${theme.fonts.display};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.menu};
    }
  }
`;

export const ContentBox = styled.div<WithTheme>`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 360px);
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  margin-bottom: 20px;

  iframe {
    width: 100%;
    height: auto; /* 고정 height 제거 */
    aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
    max-width: 100%;
    border: none;
    display: block;
  }

  figure.media {
    margin: 20px 0;
    max-height: unset;
    overflow: visible;
  }
`;

export const ReplyBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;

  .reply-header-box {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-family: ${theme.fonts.display};

    h3 {
      display: flex;
      color: ${({ theme }) => theme.colors.bronzeColor};
      gap: 6px;
      align-items: center;

      span {
        font-size: ${({ theme }) => theme.sizes.medium};
        color: ${({ theme }) => theme.colors.bronzeColor};
      }
    }

    button {
      color: ${({ theme }) => theme.colors.bronzeColor};
      font-family: ${theme.fonts.display};
    }
  }
`;

export const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  color: ${({ theme }) => theme.colors.bronzeColor};
  padding-top: 10px;
  gap: 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.basicColor};

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background-color: ${({ theme }) => theme.colors.basicColor};
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }
    }

    svg {
      cursor: pointer;
    }
  }
`;

export const StyledFileInput = styled.input<WithTheme>`
  margin-bottom: 10px;
  width: 100%;
  padding: 10px 0;
  border: none;

  &::-webkit-file-upload-button {
    background: ${({ theme }) => theme.colors.noticeColor};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
