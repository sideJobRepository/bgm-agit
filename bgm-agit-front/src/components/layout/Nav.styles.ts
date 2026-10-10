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
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.weight.semiBold};

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    padding: 0 16px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const NavBox = styled.div<WithTheme>`
  display: flex;
  gap: 4px;
  justify-content: end;
  height: 100%;
  align-items: center;
  white-space: nowrap;

  a {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.15s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  /* 마지막 항목 = 지금 화면 */
  > :last-child {
    color: ${({ theme }) => theme.colors.textStrong};
    font-weight: ${({ theme }) => theme.weight.bold};
  }
`;
