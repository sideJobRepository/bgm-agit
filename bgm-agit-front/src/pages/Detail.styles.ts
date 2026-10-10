import styled from 'styled-components';

export const GridBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1280px;
  /* Wrapper 가 width:100%(최대 1500px)라 가운데로 둔다. 없으면 왼쪽에 붙는다 */
  margin: 0 auto;
`;
