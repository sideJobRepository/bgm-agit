import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Container = styled.div<WithTheme>`
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.text};
`;

export const Title = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xxlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  margin-bottom: 32px;
`;

export const Section = styled.section`
  margin-bottom: 40px;
`;

export const SubTitle = styled.h3<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.subColor};
`;

export const Text = styled.p<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const List = styled.ul<WithTheme>`
  margin-top: 12px;
  padding-left: 20px;
  list-style: disc;

  li {
    margin-bottom: 8px;
    font-size: ${({ theme }) => theme.sizes.medium};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;
