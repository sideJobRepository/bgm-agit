import ReactDOM from 'react-dom';
import styled from 'styled-components';

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return ReactDOM.createPortal(
    <ModalBackdrop onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>{children}</ModalBox>
    </ModalBackdrop>,
    document.body
  );
}

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div`
  background: white;
  position: relative;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 4;
`;
