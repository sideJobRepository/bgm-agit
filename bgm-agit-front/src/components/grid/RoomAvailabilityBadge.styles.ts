import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';

export type Tone = 'open' | 'soldout' | 'muted';

export const StatusRow = styled.div<WithTheme & { $tone: Tone }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ $tone, theme }) => {
    if ($tone === 'open') return theme.colors.greenColor;
    if ($tone === 'soldout') return theme.colors.redColor;
    return theme.colors.navColor;
  }};

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 8px;
    /* xxsmall(10px)까지 내리면 읽히지 않는다. 오예약 방지가 목적인 정보라 여기서 멈춘다 */
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const Total = styled.span<WithTheme>`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.navColor};

  @media ${({ theme }) => theme.device.mobile} {
    display: none;
  }
`;
