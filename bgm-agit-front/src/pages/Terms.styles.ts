import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { cardStyle } from '../styles/mixins.ts';

// 약관·환불정책·개인정보 처리방침이 같은 읽기 레이아웃을 쓴다(연한 바탕 위 흰 카드)
export const Container = styled.div<WithTheme>`
  max-width: 800px;
  margin: 48px auto;
  padding: ${({ theme }) => theme.space.xxl};
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textBody};

  @media ${({ theme }) => theme.device.mobile} {
    margin: ${({ theme }) => theme.space.xl} ${({ theme }) => theme.space.lg};
    padding: ${({ theme }) => theme.space.xl} ${({ theme }) => theme.space.md};
  }
`;

export const Title = styled.h2<WithTheme>`
  margin: 0 0 ${({ theme }) => theme.space.xl};
  padding: 0 ${({ theme }) => theme.space.xs};
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textStrong};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 24px;
    margin-bottom: ${({ theme }) => theme.space.lg};
  }
`;

export const Section = styled.section<WithTheme>`
  ${cardStyle}
  padding: ${({ theme }) => theme.space.xl};
  margin-bottom: ${({ theme }) => theme.space.lg};

  &:last-child {
    margin-bottom: 0;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${({ theme }) => theme.space.lg};
    margin-bottom: ${({ theme }) => theme.space.md};
  }
`;

export const SubTitle = styled.h3<WithTheme>`
  margin: 0 0 ${({ theme }) => theme.space.md};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textStrong};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 17px;
  }
`;

export const Text = styled.p<WithTheme>`
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textBody};
  word-break: keep-all;
  overflow-wrap: break-word;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 15px;
  }
`;

export const List = styled.ul<WithTheme>`
  margin: ${({ theme }) => theme.space.md} 0 0;
  padding-left: 20px;
  list-style: disc;

  &:first-child {
    margin-top: 0;
  }

  li {
    margin-bottom: ${({ theme }) => theme.space.sm};
    font-size: 16px;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.textBody};
    word-break: keep-all;
    overflow-wrap: break-word;

    &:last-child {
      margin-bottom: 0;
    }

    &::marker {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    li {
      font-size: 15px;
    }
  }
`;
