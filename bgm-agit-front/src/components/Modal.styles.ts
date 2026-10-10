import styled from 'styled-components';
import { theme } from '../styles/theme.ts';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* textStrong(#16181D) 50% — 순검정보다 덜 무겁게 */
  background: rgba(22, 24, 29, 0.5);
  z-index: 3;
  display: flex;
  /* 내용이 화면보다 길면 백드롭이 세로 스크롤되도록 (align-items:center 는 넘칠 때 위아래가 잘림) */
  overflow-y: auto;
  padding: 20px;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const ModalBox = styled.div`
  /* margin:auto + flex 컨테이너 → 짧으면 가운데 정렬, 길면 잘리지 않고 스크롤 */
  margin: auto;
  max-width: 100%;
  max-height: none;
  background: ${theme.colors.surface};
  position: relative;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.lg};
  z-index: 4;
`;
