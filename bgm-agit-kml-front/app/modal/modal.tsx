'use client';

import styled from 'styled-components';
import ModalPortal from '@/app/modal/modalPortal';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <ModalPortal>
      <Overlay onClick={onClose}>
        <Content onClick={(e) => e.stopPropagation()}>{children}</Content>
      </Overlay>
    </ModalPortal>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Content = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  //max-height: 80%;
`;
