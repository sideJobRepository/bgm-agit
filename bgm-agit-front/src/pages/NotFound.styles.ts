import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Wrapper = styled.section`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 0;
`;

export const Box = styled.div<WithTheme>`
  width: 100%;
  max-width: 440px;
  padding: 40px 32px 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.topBg};
  border: 1px solid ${({ theme }) => theme.colors.subTextBoxColor};
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 32px 20px 20px;
  }
`;

export const Code = styled.div<WithTheme>`
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.bottomBg};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 56px;
  }
`;

export const Title = styled.h1<WithTheme>`
  margin-top: 16px;
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.activeMenuColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.menu};
  }
`;

export const Message = styled.p<WithTheme>`
  margin-top: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.subColor};
  word-break: keep-all;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const Buttons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 28px;
`;

export const BaseButton = styled.button<WithTheme>`
  flex: 1;
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

export const SubButton = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.colors.bottomBg};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.activeMenuColor};
`;

export const MainButton = styled(BaseButton)`
  border: none;
  background-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
`;
