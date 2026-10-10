import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
`;

export const Modal = styled.div`
  width: min(640px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 20px;
`;

export const CloseButton = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
`;

export const Summary = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 16px;
`;

export const NoticeBox = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #f2f7f5;
  color: #1a7d55;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
`;

export const PayButton = styled.button`
  width: 100%;
  margin-top: 18px;
  padding: 14px 18px;
  border: 0;
  border-radius: 6px;
  background: #1a7d55;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;
