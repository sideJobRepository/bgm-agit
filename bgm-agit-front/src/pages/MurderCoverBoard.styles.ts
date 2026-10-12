import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle, focusRing, inputStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
  }
`;

// 위에 붙어 있는 진행·옵션 줄. 스크롤해도 남은 개수와 이름 맞추기 옵션이 보이게
export const Toolbar = styled.div<WithTheme>`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.space.md};
  padding: ${theme.space.md} 0;
  background: ${c.bg};
  border-bottom: 1px solid ${c.border};

  h2 {
    margin: 0;
    font-size: 20px;
    color: ${c.textStrong};
  }

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: ${c.textBody};
    cursor: pointer;
  }

  > button {
    ${buttonStyle('secondary', 'sm')};
    margin-left: auto;
  }
`;

export const Help = styled.p<WithTheme>`
  margin: ${theme.space.md} 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${c.textMuted};
`;

export const Empty = styled.div<WithTheme>`
  padding: 56px 0;
  text-align: center;
  color: ${c.textMuted};
  font-size: 15px;
  font-weight: 600;
`;

export const Row = styled.div<WithTheme & { $selected: boolean; $saving: boolean }>`
  ${cardStyle};
  margin-top: ${theme.space.md};
  padding: ${theme.space.md};
  border: 2px solid ${({ $selected }) => ($selected ? c.info : c.border)};
  opacity: ${({ $saving }) => ($saving ? 0.5 : 1)};
  pointer-events: ${({ $saving }) => ($saving ? 'none' : 'auto')};
  cursor: pointer;
`;

export const RowHead = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.space.sm};

  strong {
    font-size: 16px;
    color: ${c.textStrong};
  }

  span {
    font-size: 13px;
    color: ${c.textSubtle};
  }
`;

export const RowLinks = styled.div`
  display: flex;
  gap: 6px;
  margin-left: auto;

  a,
  button {
    ${buttonStyle('secondary', 'sm')};
    text-decoration: none;
  }
`;

export const Candidates = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${theme.space.sm};
  margin-top: ${theme.space.sm};

  > p {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 13px;
    color: ${c.textSubtle};
  }

  button {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border: 1px solid ${c.border};
    border-radius: ${theme.radius.md};
    background: ${c.white};
    color: ${c.textBody};
    font-size: 12px;
    line-height: 1.35;
    text-align: left;
    cursor: pointer;
    ${focusRing};
  }

  button:hover {
    border-color: ${c.info};
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
    background: ${c.surfaceAlt};
  }

  small {
    color: ${c.textSubtle};
  }
`;

export const UrlInput = styled.input`
  ${inputStyle};
  width: 100%;
  margin-top: ${theme.space.sm};
`;
