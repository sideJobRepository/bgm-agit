import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { buttonStyle, cardStyle } from '../styles/mixins.ts';

export const ErrorWrapper = styled.div<WithTheme>`
  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.space.lg};
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ErrorBox = styled.div<WithTheme>`
  ${cardStyle}
  width: 100%;
  max-width: 440px;
  padding: 40px ${({ theme }) => theme.space.xxl} ${({ theme }) => theme.space.xxl};
  box-shadow: ${({ theme }) => theme.shadow.md};
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${({ theme }) => theme.space.xxl} 20px 20px;
  }
`;

export const Title = styled.h1<WithTheme>`
  margin: 0 0 ${({ theme }) => theme.space.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textStrong};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 20px;
  }
`;

export const Message = styled.p<WithTheme>`
  margin: 0 0 28px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.7;
  word-break: keep-all;
`;

export const RetryButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')}
  width: 100%;
`;
