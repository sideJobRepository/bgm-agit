import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

export const Wrapper = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  max-width: 1500px;
  min-width: 1280px;
  padding: 0 30px;
  margin: 0 auto;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const NavBox = styled.div<WithTheme>`
  display: flex;
  gap: 2px;
  justify-content: end;
  height: 100%;
  align-items: center;

  a {
    cursor: pointer;
  }
`;
