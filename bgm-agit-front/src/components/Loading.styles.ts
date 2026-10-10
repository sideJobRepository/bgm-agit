import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Overlay = styled.div<WithTheme>`
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;
