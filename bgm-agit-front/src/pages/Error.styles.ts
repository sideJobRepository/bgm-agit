import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const ErrorWrapper = styled.div<WithTheme>`
  width: 100%;
  height: 100vh;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.topBg};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ErrorBox = styled.div<WithTheme>`
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
  border: 3px dashed red;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1<WithTheme>`
  font-family: ${theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.xxlarge};
  color: red;
  margin-bottom: 16px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.bigLarge};
  }
`;

export const Message = styled.p<WithTheme>`
  font-family: ${theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  color: ${({ theme }) => theme.colors.menuColor};
  line-height: 1.5;
  margin-bottom: 24px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

export const RetryButton = styled.button<WithTheme>`
  font-family: ${theme.fonts.display};
  background-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
  padding: 10px 24px 8px 24px;
  font-size: ${({ theme }) => theme.sizes.large};
  border: none;
  border-radius: 8px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
