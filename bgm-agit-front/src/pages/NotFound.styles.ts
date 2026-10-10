import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { badgeStyle, buttonStyle, cardStyle } from '../styles/mixins.ts';

export const Wrapper = styled.section<WithTheme>`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 48px ${({ theme }) => theme.space.lg};
  background-color: ${({ theme }) => theme.colors.white};
`;

export const Box = styled.div<WithTheme>`
  ${cardStyle}
  width: 100%;
  max-width: 440px;
  padding: 40px ${({ theme }) => theme.space.xxl} ${({ theme }) => theme.space.xxl};
  box-shadow: ${({ theme }) => theme.shadow.md};
  background-color: ${({ theme }) => theme.colors.topBg};
  border-color: ${({ theme }) => theme.colors.subTextBoxColor};
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${({ theme }) => theme.space.xxl} 20px 20px;
  }
`;

// 예전처럼 하단 갈색 글씨(바탕 없음)
export const Code = styled.div<WithTheme>`
  ${badgeStyle('accent')}
  padding: 4px 12px;
  font-size: 14px;
  letter-spacing: 0.04em;
  background: transparent;
  color: ${({ theme }) => theme.colors.bottomBg};
`;

export const Title = styled.h1<WithTheme>`
  margin: ${({ theme }) => theme.space.lg} 0 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.activeMenuColor};
  word-break: keep-all;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 20px;
  }
`;

export const Message = styled.p<WithTheme>`
  margin: ${({ theme }) => theme.space.md} 0 0;
  font-size: 15px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.subColor};
  word-break: keep-all;
`;

export const Buttons = styled.div<WithTheme>`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  margin-top: 28px;
`;

export const BaseButton = styled.button<WithTheme>`
  flex: 1;
  min-width: 0;
`;

export const SubButton = styled(BaseButton)`
  ${buttonStyle('secondary', 'md')}
  background: ${({ theme }) => theme.colors.white};
  border-color: ${({ theme }) => theme.colors.bottomBg};
  color: ${({ theme }) => theme.colors.activeMenuColor};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.white};
    opacity: 0.85;
  }
`;

export const MainButton = styled(BaseButton)`
  ${buttonStyle('primary', 'md')}
  background: ${({ theme }) => theme.colors.greenColor};
  border-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.greenColor};
    border-color: ${({ theme }) => theme.colors.greenColor};
    opacity: 0.85;
  }
`;
