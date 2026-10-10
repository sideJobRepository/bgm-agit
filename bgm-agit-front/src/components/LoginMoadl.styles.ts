import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const LoginModalWrapper = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 360px;
  max-width: 92vw;
  padding-bottom: 36px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.topBg};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
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
  gap: 16px;
  padding: 4px 0;

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

export const FormBox = styled.form<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 30px;
`;

export const Input = styled.input<WithTheme>`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.inputColor};
  font-size: ${({ theme }) => theme.sizes.small};

  &::placeholder {
    color: ${({ theme }) => theme.colors.navColor};
  }

  /* iOS Safari 자동 줌 방지 */
  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
  }
`;

export const SubmitButton = styled.button<WithTheme>`
  width: 100%;
  margin-top: 4px;
  padding: 12px;
  border: none;
  border-radius: 80px;
  background-color: ${({ theme }) => theme.colors.purpleColor};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: 600;
  cursor: pointer;
`;

export const SwitchLine = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 30px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};

  button {
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.purpleColor};
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const Divider = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 30px;
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.lineColor};
  }
`;

export const BottomModalBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 30px;

  button {
    display: flex;
    align-items: center;
    max-width: 310px;
    width: 100%;
    padding: 12px 60px;
    gap: 16px;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.menuColor};
    border: 1px solid rgba(225, 225, 225, 1);
    border-radius: 80px;
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: 500;
    cursor: pointer;

    img {
      width: 24px;
      height: 24px;
    }
  }
`;
