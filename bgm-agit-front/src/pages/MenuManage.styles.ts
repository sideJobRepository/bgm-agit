import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const Box = styled.div`
  padding: 10px;
`;

export const Notice = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #757575;
`;

export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  background: ${({ bgColor }) => bgColor};
  color: #fff;
  padding: 20px;
  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 6px;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const FormCard = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  padding: 18px;
  margin: 20px 0;
`;

export const FormTitle = styled.h3<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: ${({ theme }) => theme.weight.semiBold};
    color: ${({ theme }) => theme.colors.navColor};
  }
  input,
  select {
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
  }
`;

export const RowFields = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 844px) {
    flex-direction: column;
  }
`;

export const ToggleLabel = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
  padding: 8px 0;
  input {
    width: auto;
    accent-color: #093a6e;
  }
`;

export const RoleChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const RoleChip = styled.label<{ $checked: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.small};
  border: 1px solid ${({ $checked }) => ($checked ? '#093A6E' : '#D9D9D9')};
  background: ${({ $checked }) => ($checked ? '#093A6E' : '#fff')};
  color: ${({ $checked }) => ($checked ? '#fff' : '#424548')};
  input {
    accent-color: #fff;
  }
`;

export const FormButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const PrimaryButton = styled.button<WithTheme>`
  padding: 10px 22px;
  background: #093a6e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;
`;

export const GhostButton = styled.button<WithTheme>`
  padding: 10px 22px;
  background: #fff;
  color: #424548;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  cursor: pointer;
`;

export const TreeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
`;

export const TreeTitle = styled.h3<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const TreeTools = styled.div`
  display: flex;
  gap: 8px;

  button {
    padding: 7px 14px;
    font-size: 13px;
  }
`;

export const TreeHint = styled.p<WithTheme>`
  margin: 10px 0 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.navColor};

  strong {
    color: ${({ theme }) => theme.colors.subColor};
    font-weight: ${({ theme }) => theme.weight.bold};
  }
`;

export const TreeWrap = styled.div<WithTheme>`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 10px;
  overflow: hidden;
`;

export const TreeRow = styled.div<{ $depth: number; $editing: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  /* 최상위는 흰 배경, 하위로 갈수록 살짝 눕혀 계층이 보이게 */
  background: ${({ $depth, $editing }) =>
    $editing ? '#E8EEF6' : $depth === 0 ? '#ffffff' : '#FAFAFA'};

  &:last-child {
    border-bottom: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px;
  }
`;

export const RowMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

export const Indent = styled.div<{ $depth: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  margin-left: ${({ $depth }) => $depth * 24}px;

  @media (max-width: 844px) {
    margin-left: ${({ $depth }) => $depth * 14}px;
  }
`;

export const ToggleButton = styled.button<WithTheme>`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.subColor};
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
`;

export const LeafMark = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.lineColor};
  font-size: 18px;
  line-height: 1;
`;

export const NameArea = styled.div`
  min-width: 0;
  flex: 1;
`;

export const NameLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const MenuTitle = styled.span<{ $muted: boolean } & WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ $muted, theme }) => ($muted ? theme.colors.navColor : theme.colors.subColor)};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const CountBadge = styled.span<WithTheme>`
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.basicColor};
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.xxsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

export const OffBadge = styled(CountBadge)`
  background: #f6dcdb;
  color: #b2413c;
`;

export const MetaLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 3px;
`;

export const LinkText = styled.span<{ $empty: boolean } & WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ $empty, theme }) => ($empty ? theme.colors.navColor : theme.colors.blueColor)};
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
  word-break: break-all;
`;

export const MetaDim = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
  font-variant-numeric: tabular-nums;
`;

export const RowActions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 4px;

  @media (max-width: 844px) {
    justify-content: flex-end;
  }
`;

export const RowButton = styled.button<{ $danger?: boolean } & WithTheme>`
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  white-space: nowrap;
  background: ${({ $danger }) => ($danger ? '#FF5E57' : theme.colors.primary)};
`;
