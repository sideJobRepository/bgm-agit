import styled from 'styled-components';
import type { WithTheme } from './styled-props.ts';

// 페이지 본문 폭. 데스크톱은 1280~1500px, 모바일은 화면 폭 그대로
export const Wrapper = styled.div<WithTheme>`
  width: 100%;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;

  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;
