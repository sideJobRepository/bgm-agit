import styled from 'styled-components';

export const ResultBox = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;

  button {
    border: 0;
    border-radius: 6px;
    background: #093a6e;
    color: #fff;
    cursor: pointer;
    padding: 10px 18px;
  }
`;
