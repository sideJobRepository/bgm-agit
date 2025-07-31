import { ClipLoader } from 'react-spinners';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import ReactDOM from 'react-dom';

export default function Loading() {
  return ReactDOM.createPortal(
    <Overlay>
      <ClipLoader color="#1A7D55" size={60} />
    </Overlay>,
    document.body
  );
}

const Overlay = styled.div<WithTheme>`
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;
