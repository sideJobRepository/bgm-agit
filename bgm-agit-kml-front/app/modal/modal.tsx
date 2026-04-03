'use client';

import styled from 'styled-components';
import ModalPortal from '@/app/modal/modalPortal';
import { X } from 'phosphor-react';

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
        <Content onClick={(e) => e.stopPropagation()}>
          <TopModalBox>
            <h4>HISTORY</h4>
            <X onClick={onClose} weight="bold" />
          </TopModalBox>
          {children}
        </Content>
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

const TopModalBox = styled.div`
  width: 100%;
  display: flex;
  padding: 20px 24px;
  border-radius: 8px 8px 0 0;
  background-color: ${({ theme }) => theme.colors.softColor};

  h4 {
    display: inline-flex;
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.inputColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    }
  }

  svg {
    color: ${({ theme }) => theme.colors.inputColor};
    margin-left: auto;
    width: 22px;
    height: 22px;
    cursor: pointer;
  }
`;

const Content = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1280px;
  max-height: 80vh;

  display: flex;
  flex-direction: column;
`;
