import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import {
  badgeStyle,
  buttonStyle,
  cardStyle,
  focusRing,
  inputStyle,
  sectionTitleStyle,
} from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  padding: ${theme.space.xl} 10px ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xl};
  }
`;

export const Notice = styled.div`
  text-align: center;
  padding: 60px 0;
  color: ${c.textMuted};
  font-size: 15px;
`;

// 예전엔 bgColor 색 띠였다. 지금은 흰 바탕 제목 영역이라 bgColor 는 아래 구분선에만 쓴다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<
  { bgColor: string } & WithTheme
>`
  ${sectionTitleStyle};
  padding: 0 0 ${theme.space.xl};
  border-bottom: 2px solid ${({ bgColor }) => bgColor};

  h2 {
    font-size: 30px;
  }

  @media ${theme.device.mobile} {
    padding-bottom: ${theme.space.lg};

    h2 {
      font-size: 24px;
    }
  }
`;

export const FormCard = styled.div<WithTheme>`
  ${cardStyle};
  display: flex;
  flex-direction: column;
  gap: ${theme.space.lg};
  padding: ${theme.space.xl};
  margin: ${theme.space.xl} 0;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const FormTitle = styled.h3<WithTheme>`
  margin: 0;
  color: ${c.textStrong};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;

  > label {
    color: ${c.textMuted};
    font-size: 13px;
    font-weight: 600;
  }

  input:not([type='checkbox']),
  select {
    ${inputStyle};
  }

  select {
    cursor: pointer;
  }
`;

export const RowFields = styled.div`
  display: flex;
  gap: ${theme.space.md};

  @media ${theme.device.mobile} {
    flex-direction: column;
  }
`;

export const ToggleLabel = styled.label<WithTheme>`
  && {
    display: flex;
    align-items: center;
    gap: ${theme.space.sm};
    min-height: 44px;
    color: ${c.textBody};
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  input {
    width: 18px;
    min-height: 0;
    height: 18px;
    padding: 0;
    accent-color: ${c.primary};
    cursor: pointer;
  }
`;

export const RoleChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
`;

export const RoleChip = styled.label<{ $checked: boolean } & WithTheme>`
  && {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 14px;
    border-radius: ${theme.radius.pill};
    border: 1px solid ${({ $checked }) => ($checked ? c.primary : c.borderStrong)};
    background: ${({ $checked }) => ($checked ? c.primary : c.surface)};
    color: ${({ $checked }) => ($checked ? c.onPrimary : c.textBody)};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${c.primary};
    outline-offset: 2px;
  }

  input {
    width: 16px;
    height: 16px;
    min-height: 0;
    padding: 0;
    margin: 0;
    accent-color: ${({ $checked }) => ($checked ? c.onPrimary : c.primary)};
    cursor: pointer;
  }

  @media ${theme.device.mobile} {
    && {
      min-height: 44px;
    }
  }
`;

export const FormButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.space.sm};
  padding-top: ${theme.space.xs};
`;

export const PrimaryButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
`;

export const GhostButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'md')};
`;

export const TreeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-top: ${theme.space.sm};

  @media ${theme.device.mobile} {
    flex-wrap: wrap;
  }
`;

export const TreeTitle = styled.h3<WithTheme>`
  margin: 0;
  color: ${c.textStrong};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const TreeTools = styled.div`
  display: flex;
  gap: ${theme.space.sm};

  button {
    ${buttonStyle('secondary', 'sm')};
  }

  @media ${theme.device.mobile} {
    button {
      height: 44px;
    }
  }
`;

export const TreeHint = styled.p<WithTheme>`
  margin: ${theme.space.md} 0;
  padding: ${theme.space.md} 14px;
  border-radius: ${theme.radius.md};
  background: ${c.surfaceSunken};
  border: 1px solid ${c.border};
  color: ${c.textMuted};
  font-size: 14px;
  line-height: 1.6;

  strong {
    color: ${c.textStrong};
    font-weight: 700;
  }
`;

export const TreeWrap = styled.div<WithTheme>`
  ${cardStyle};
  overflow: hidden;
`;

export const TreeRow = styled.div<{ $depth: number; $editing: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  padding: ${theme.space.md} ${theme.space.lg};
  border-bottom: 1px solid ${c.border};
  /* 최상위는 흰 배경, 하위로 갈수록 살짝 눕혀 계층이 보이게. 수정 중인 행은 보라 옅은 배경 */
  background: ${({ $depth, $editing }) =>
    $editing ? c.primarySoft : $depth === 0 ? c.surface : c.surfaceSunken};

  &:last-child {
    border-bottom: none;
  }

  @media ${theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.sm};
    padding: ${theme.space.md};
  }
`;

export const RowMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.space.sm};
  min-width: 0;
  flex: 1;
`;

export const Indent = styled.div<{ $depth: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  min-height: 32px;
  margin-left: ${({ $depth }) => $depth * 24}px;

  @media ${theme.device.mobile} {
    width: 44px;
    min-height: 44px;
    margin-left: ${({ $depth }) => $depth * 14}px;
  }
`;

export const ToggleButton = styled.button<WithTheme>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${c.borderStrong};
  border-radius: ${theme.radius.sm};
  background: ${c.surface};
  color: ${c.textBody};
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${c.surfaceAlt};
  }

  ${focusRing};

  @media ${theme.device.mobile} {
    width: 44px;
    height: 44px;
  }
`;

export const LeafMark = styled.span<WithTheme>`
  color: ${c.textSubtle};
  font-size: 18px;
  line-height: 1;
`;

export const NameArea = styled.div`
  min-width: 0;
  flex: 1;
  padding-top: 4px;

  @media ${theme.device.mobile} {
    padding-top: 10px;
  }
`;

export const NameLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const MenuTitle = styled.span<{ $muted: boolean } & WithTheme>`
  color: ${({ $muted }) => ($muted ? c.textMuted : c.textStrong)};
  font-size: 16px;
  font-weight: 700;

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;

export const CountBadge = styled.span<WithTheme>`
  ${badgeStyle('neutral')};
`;

export const OffBadge = styled.span<WithTheme>`
  ${badgeStyle('danger')};
`;

export const MetaLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

export const LinkText = styled.span<{ $empty: boolean } & WithTheme>`
  color: ${({ $empty }) => ($empty ? c.textMuted : c.primary)};
  font-size: 13px;
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
  word-break: break-all;
`;

export const MetaDim = styled.span<WithTheme>`
  color: ${c.textMuted};
  font-size: 13px;
  font-variant-numeric: tabular-nums;
`;

export const RowActions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 6px;

  @media ${theme.device.mobile} {
    justify-content: flex-end;
  }
`;

export const RowButton = styled.button<{ $danger?: boolean } & WithTheme>`
  ${({ $danger }) => buttonStyle($danger ? 'danger' : 'secondary', 'sm')};

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;
