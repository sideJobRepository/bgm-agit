import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3;
  display: flex;
  /* 내용이 화면보다 길면 백드롭이 세로 스크롤되도록 (align-items:center 는 넘칠 때 위아래가 잘림) */
  overflow-y: auto;
  padding: 20px;
`;

export const ModalBox = styled.div`
  /* margin:auto + flex 컨테이너 → 짧으면 가운데 정렬, 길면 잘리지 않고 스크롤 */
  margin: auto;
  max-height: none;
  background: white;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 4;
`;
