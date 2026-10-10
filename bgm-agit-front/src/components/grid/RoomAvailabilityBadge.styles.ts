import styled, { css } from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';
import { theme } from '../../styles/theme.ts';
import { badgeStyle } from '../../styles/mixins.ts';

export type Tone = 'open' | 'soldout' | 'muted';

// 남은 시간대 = 골드(accent) 배지, 마감·불가 사유 = 중립 배지
export const StatusRow = styled.div<WithTheme & { $tone: Tone }>`
  ${({ $tone }) => ($tone === 'open' ? badgeStyle('accent') : badgeStyle('neutral'))}
  align-self: flex-start;
  max-width: calc(100% - 32px);
  margin: 10px 16px 0;
  padding: 4px 10px;
  font-size: 13px;
  /* 불가 사유 문구(G룸 하루 1팀 등)는 길 수 있어 줄바꿈을 허용한다 */
  white-space: normal;

  ${({ $tone }) =>
    $tone === 'open' &&
    css`
      gap: 8px;
    `}

  @media ${theme.device.mobile} {
    max-width: calc(100% - 28px);
    margin: 8px 14px 0;
    /* 더 내리면 읽히지 않는다. 오예약 방지가 목적인 정보라 여기서 멈춘다 */
    font-size: 12px;
  }
`;

export const Total = styled.span<WithTheme>`
  font-weight: 500;

  @media ${theme.device.mobile} {
    display: none;
  }
`;
