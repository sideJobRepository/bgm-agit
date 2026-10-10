import styled, { keyframes } from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const Wrapper = styled.div<WithTheme>`
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: auto;
  padding: 24px 8px;

  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

export const EditorWrapper = styled.div`
  display: flex;
  margin-top: 12px;
  flex-direction: column;
  height: calc(100vh - 400px);
  box-sizing: border-box;
  padding-bottom: 40px;
`;

export const InputBox = styled.input<WithTheme>`
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
  padding: 0 8px;
  color: ${({ theme }) => theme.colors.inputColor};
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  box-shadow: none;
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
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

  .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
    border-color: ${({ theme }) => theme.colors.inputColor} !important;
    box-shadow: none !important;
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  margin-bottom: 16px;
`;

export const FileButtonBox = styled.div<WithTheme>`
  display: flex;
  justify-content: end;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

export const Button = styled.button<WithTheme & { color: string }>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 8px;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.softColor};

    span {
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.desktop.sizes.xl};
      font-weight: 600;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.xl};
      }

      strong {
        margin-left: 8px;
      }
    }

    a {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      font-weight: 500;
      margin-left: 8px;
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.desktop.sizes.sm};
      cursor: pointer;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }

  h3 {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 20px 10px;
    color: ${({ theme }) => theme.colors.inputColor};
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    font-weight: 600;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
  }
`;

export const ContentBox = styled.div<WithTheme>`
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 500px);
  padding: 20px 10px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lineColor};
  margin-bottom: 20px;

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
`;

export const FileSvgBox = styled.div<{ $color: string }>`
  display: flex;
  background-color: ${({ $color }) => $color};
  padding: 2px;
  border-radius: 999px;
  align-items: center;

  svg {
    width: 10px;
    height: 10px;
    cursor: pointer;
    color: white;

    &:hover {
      opacity: 0.6;
    }
  }
`;

export const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${({ theme }) => theme.colors.inputColor};
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  li {
    display: flex;
    justify-content: end;
    margin-top: 8px;
    gap: 8px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};

    a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background-color: ${({ theme }) => theme.colors.border};
      border-radius: 4px;
      cursor: pointer;
    }
  }
`;

export const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

export const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

export const ReplyBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: 10px;

  svg {
    width: 12px;
    height: 12px;
  }

  .textarea-box {
    display: flex;
    padding: 10px 0;
    flex-direction: column;
    gap: 12px;
    justify-content: right;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .reply-button-box {
    display: flex;
    margin-top: 6px;
    gap: 4px;
    justify-content: right;
  }

  .reply-header-box {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-family: ${theme.fonts.display};

    h4 {
      display: flex;
      font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
      color: ${({ theme }) => theme.colors.inputColor};
      gap: 6px;
      align-items: center;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
      }

      span {
        font-size: ${({ theme }) => theme.desktop.sizes.xl};
        color: ${({ theme }) => theme.colors.inputColor};

        @media ${({ theme }) => theme.device.mobile} {
          font-size: ${({ theme }) => theme.mobile.sizes.xl};
        }
      }
    }
  }

  .reply-box {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .reply-top {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    color: ${({ theme }) => theme.colors.navColor};
    margin-bottom: 12px;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.md};
    }

    strong {
      font-family: ${theme.fonts.display};
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.desktop.sizes.xl};
      margin-right: 8px;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.mobile.sizes.xl};
      }
    }
  }

  .reply-center {
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xl};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

export const TextArea = styled.textarea<WithTheme>`
  width: 100%;
  padding: 8px;
  resize: none;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};
  border: 1px solid ${({ theme }) => theme.colors.grayColor};
  border-radius: 6px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputColor};
  }
`;
