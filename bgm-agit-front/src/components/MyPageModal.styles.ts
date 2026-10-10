import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const ModalWrapper = styled.div<WithTheme>`
  display: flex;
  width: 400px;
  margin: 0 auto;
  flex-direction: column;
  gap: 30px;
  padding-bottom: 36px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.topBg};
  @media ${({ theme }) => theme.device.mobile} {
    width: calc(100vw - 40px);
  }
`;

export const TopModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  padding: 20px;
  border-radius: 12px 12px 0 0;

  svg {
    color: ${({ theme }) => theme.colors.menuColor};
    margin-left: auto;
    width: 22px;
    height: 22px;
    cursor: pointer;
  }
`;

export const CenterModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px 0;

  img {
    border-radius: 999px;
    height: 48px;
  }

  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.bigLarge};
    color: ${({ theme }) => theme.colors.purpleColor};
    font-weight: 600;
  }
`;

export const BottomModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 28px;

  button {
    margin-top: 8px;
    width: 100%;
    padding: 12px 60px;
    gap: 16px;
    background-color: ${({ theme }) => theme.colors.purpleColor};
    color: #ffffff;
    border: 1px solid rgba(225, 225, 225, 1);
    border-radius: 80px;
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: 500;
    cursor: pointer;
  }
`;

export const MahjongBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};

  p {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.subColor};
    text-align: center;
  }

  /* BottomModalBox의 기본 버튼(보라) 대신 보조 스타일로 오버라이드 */
  button {
    margin-top: 0;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.bronzeColor};
    border: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  }

  button.cancel {
    color: #ff5e57;
    border-color: #ff5e57;
  }
`;

export const PasswordBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};

  h3 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.medium};
    color: ${({ theme }) => theme.colors.purpleColor};
    font-weight: 600;
    text-align: left;
  }
`;

export const InputBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 4px;

  label {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    text-align: left;
    color: ${({ theme }) => theme.colors.bronzeColor};
    font-weight: 600;
    padding: 0 8px;
    white-space: nowrap;
  }

  input {
    height: 40px;
    width: 100%;
    padding: 0 8px;
    border: 1px solid #c4c4c4; /* CKEditor 기본 테두리 색상 */
    border-radius: 4px;
    box-shadow: none;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.noticeColor};
    }

    /* iOS Safari 자동 줌 방지 */
    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
    }
  }

  .readonly-input {
    background-color: transparent;
    border: none;
  }
`;
