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

// 예전 색: bgColor(남색) 로 채운 색 띠 + 흰 글씨. 채운 띠라 안쪽 여백을 둔다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<
  { bgColor: string } & WithTheme
>`
  ${sectionTitleStyle};
  padding: ${theme.space.xl};
  background: ${({ bgColor }) => bgColor};
  color: ${c.white};

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    font-size: 30px;
    color: ${c.white};
  }

  p {
    color: ${c.white};
  }

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};

    h2 {
      font-size: 24px;
    }
  }
`;

export const FormCard = styled.div<WithTheme>`
  ${cardStyle};
  border-color: ${c.lineColor};
  box-shadow: none;
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
  color: ${c.subColor};
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
    color: ${c.navColor};
    font-size: 13px;
    font-weight: 600;
  }

  input:not([type='checkbox']),
  select {
    ${inputStyle};
    border-color: ${c.lineColor};

    &:focus {
      border-color: ${c.blueColor};
      box-shadow: none;
    }
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
    accent-color: ${c.blueColor};
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
    border: 1px solid ${({ $checked }) => ($checked ? c.blueColor : c.lineColor)};
    background: ${({ $checked }) => ($checked ? c.blueColor : c.white)};
    color: ${({ $checked }) => ($checked ? c.white : c.subColor)};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${c.blueColor};
    outline-offset: 2px;
  }

  input {
    width: 16px;
    height: 16px;
    min-height: 0;
    padding: 0;
    margin: 0;
    accent-color: ${({ $checked }) => ($checked ? c.white : c.blueColor)};
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

// 예전 색: 남색 채움 버튼
export const PrimaryButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'md')};
  background: ${c.blueColor};
  border-color: ${c.blueColor};

  &:hover:not(:disabled) {
    background: ${c.blueColor};
    border-color: ${c.blueColor};
    opacity: 0.9;
  }
`;

// 예전 색: 흰 바탕 + lineColor 테두리 + 본문색 글씨
export const GhostButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'md')};
  color: ${c.subColor};
  border-color: ${c.lineColor};
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
  color: ${c.subColor};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const TreeTools = styled.div`
  display: flex;
  gap: ${theme.space.sm};

  /* 예전 색: GhostButton 과 같은 흰 바탕 + lineColor 테두리 */
  button {
    ${buttonStyle('secondary', 'sm')};
    color: ${c.subColor};
    border-color: ${c.lineColor};
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
  background: ${c.softColor};
  border: 1px solid ${c.softColor};
  color: ${c.navColor};
  font-size: 14px;
  line-height: 1.6;

  strong {
    color: ${c.subColor};
    font-weight: 700;
  }
`;

export const TreeWrap = styled.div<WithTheme>`
  ${cardStyle};
  border-color: ${c.lineColor};
  box-shadow: none;
  overflow: hidden;
`;

export const TreeRow = styled.div<{ $depth: number; $editing: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  padding: ${theme.space.md} ${theme.space.lg};
  border-bottom: 1px solid ${c.lineColor};
  /* 최상위는 흰 배경, 하위로 갈수록 살짝 눕혀 계층이 보이게. 수정 중인 행은 옅은 남색(예전 색, 토큰 없음) */
  background: ${({ $depth, $editing }) =>
    $editing ? '#E8EEF6' : $depth === 0 ? c.white : '#FAFAFA'};

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
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.sm};
  background: ${c.white};
  color: ${c.subColor};
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
  color: ${c.lineColor};
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
  color: ${({ $muted }) => ($muted ? c.navColor : c.subColor)};
  font-size: 16px;
  font-weight: 700;

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;

export const CountBadge = styled.span<WithTheme>`
  ${badgeStyle('neutral')};
  background: ${c.basicColor};
  color: ${c.navColor};
`;

// 예전 색: 옅은 빨강 바탕 + 진빨강 글씨(토큰 없음)
export const OffBadge = styled.span<WithTheme>`
  ${badgeStyle('danger')};
  background: #f6dcdb;
  color: #b2413c;
`;

export const MetaLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

export const LinkText = styled.span<{ $empty: boolean } & WithTheme>`
  color: ${({ $empty }) => ($empty ? c.navColor : c.blueColor)};
  font-size: 13px;
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
  word-break: break-all;
`;

export const MetaDim = styled.span<WithTheme>`
  color: ${c.navColor};
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
  /* 예전 색: 채운 버튼 + 흰 글씨(수정 = 갈색, 삭제 = 빨강) */
  background: ${({ $danger }) => ($danger ? c.redColor : c.noticeColor)};
  border-color: ${({ $danger }) => ($danger ? c.redColor : c.noticeColor)};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${({ $danger }) => ($danger ? c.redColor : c.noticeColor)};
    color: ${c.white};
    opacity: 0.9;
  }

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;
