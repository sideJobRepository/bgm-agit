import styled, { css } from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import {
  badgeStyle,
  buttonStyle,
  cardStyle,
  focusRing,
  inputStyle,
  type ButtonVariant,
} from '../styles/mixins.ts';

const c = theme.colors;

// 선인승/악마승 진영색. 의미를 담은 색이라 토큰으로 바꾸지 않는다
const GOOD_COLOR = '#1565C0';
const EVIL_COLOR = '#6A1B9A';

// 시계탑 기록 화면 고유색(예전 화면 값 그대로)
const CT_PURPLE = '#4A2C82';
const CT_PURPLE_SOFT = '#f3eefc';
const CT_ROW_HOVER = '#f7f4ef';
const DRAFT_COLOR = '#B5651D';
const WIN_COLOR = '#2E7D32';
const LOSE_COLOR = '#9E9E9E';

// 예전 화면의 입력칸 포커스 = 보라 테두리
const ctFocus = css`
  &:focus {
    border-color: ${CT_PURPLE};
    box-shadow: none;
  }
`;

export const Box = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: ${theme.space.xl} 0 ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xl};
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.xl};

  @media ${theme.device.mobile} {
    > button {
      flex: 1;
    }
  }
`;

// 모양은 $variant, 색은 예전 화면처럼 호출부의 color 로 꽉 채운 흰 글자 버튼
export const Button = styled.button.withConfig({ shouldForwardProp: p => p !== '$variant' && p !== 'color' })<
  { $variant?: ButtonVariant; color?: string } & WithTheme
>`
  ${({ $variant }) => buttonStyle($variant ?? 'primary', 'md')};
  ${({ color }) =>
    color &&
    css`
      background: ${color};
      border-color: ${color};
      color: ${c.white};

      &:hover:not(:disabled) {
        background: ${color};
        border-color: ${color};
        color: ${c.white};
        opacity: 0.9;
      }
    `};
`;

export const DetailHead = styled.div`
  ${cardStyle};
  border-color: ${c.lineColor};
  display: flex;
  gap: ${theme.space.lg};
  align-items: center;
  padding: ${theme.space.lg};

  > div:last-child {
    min-width: 0;
  }
`;

export const Thumb = styled.div`
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${c.basicColor};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${theme.device.mobile} {
    flex-basis: 80px;
    width: 80px;
    height: 80px;
  }
`;

export const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${c.navColor};
`;

export const DetailTitle = styled.h2<WithTheme>`
  margin: 0 0 ${theme.space.xs};
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.subColor};
  word-break: keep-all;

  @media ${theme.device.mobile} {
    font-size: 20px;
  }
`;

export const DetailMeta = styled.div<WithTheme>`
  margin-top: 2px;
  font-size: 14px;
  color: ${c.navColor};
`;

// 진영색 배지(흰 글씨)
export const BigResult = styled.span<{ $evil: boolean }>`
  ${badgeStyle('primary')};
  margin-top: ${theme.space.sm};
  padding: 4px 12px;
  font-size: 13px;
  color: ${c.white};
  background: ${({ $evil }) => ($evil ? EVIL_COLOR : GOOD_COLOR)};
`;

export const DraftBadge = styled.span`
  ${badgeStyle('accent')};
  margin-top: ${theme.space.sm};
  padding: 4px 12px;
  font-size: 13px;
  color: ${c.white};
  background: ${DRAFT_COLOR};
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: ${theme.space.xxl} 0 ${theme.space.md};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.subColor};

  @media ${theme.device.mobile} {
    margin-top: ${theme.space.xl};
    font-size: 17px;
  }
`;

export const PartViewList = styled.div`
  ${cardStyle};
  border-color: ${c.lineColor};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PartViewItem = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  padding: ${theme.space.md} ${theme.space.lg};

  & + & {
    border-top: 1px solid ${c.lineColor};
  }
`;

export const PartLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const PartNick = styled.span<WithTheme>`
  font-size: 15px;
  font-weight: 700;
  color: ${c.subColor};
`;

export const PartChar = styled.span<WithTheme>`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${c.navColor};
`;

// 캐릭터 타입색(마을주민·외부인·하수인·악마). 의미를 담은 색이라 tsx 값 그대로
export const TypeTag = styled.span.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string }>`
  ${badgeStyle('primary')};
  padding: 1px 8px;
  font-size: 11px;
  color: ${c.white};
  background: ${({ color }) => color};
`;

// 승 = 초록, 패 = 회색 꽉 찬 배지(예전 화면)
export const WinTag = styled.span<{ $win: boolean }>`
  ${({ $win }) => badgeStyle($win ? 'success' : 'neutral')};
  flex: 0 0 auto;
  padding: 4px 12px;
  font-size: 13px;
  color: ${c.white};
  background: ${({ $win }) => ($win ? WIN_COLOR : LOSE_COLOR)};
`;

export const Memo = styled.div<WithTheme>`
  ${cardStyle};
  border-color: ${c.lineColor};
  padding: ${theme.space.lg};
  font-size: 15px;
  color: ${c.subColor};
  line-height: 1.6;
  white-space: pre-line;
  word-break: break-word;
`;

export const FormTitle = styled.h2<WithTheme>`
  margin: 0 0 ${theme.space.xl};
  padding-bottom: ${theme.space.lg};
  border-bottom: 1px solid ${c.lineColor};
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.subColor};

  @media ${theme.device.mobile} {
    font-size: 24px;
  }
`;

export const ResultToggle = styled.div`
  display: flex;
  gap: ${theme.space.sm};
`;

// 진영색 토글. $color 는 진영색이라 그대로 쓴다
export const ToggleBtn = styled.button.withConfig({
  shouldForwardProp: p => p !== '$active' && p !== '$color',
})<{ $active: boolean; $color: string }>`
  flex: 1;
  height: 44px;
  border-radius: ${theme.radius.md};
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $active, $color }) => ($active ? c.white : $color)};
  background: ${({ $active, $color }) => ($active ? $color : c.white)};
  transition:
    background 0.15s ease,
    color 0.15s ease;
  ${focusRing};
`;

export const SearchBox = styled.div<WithTheme>`
  position: relative;
  margin-bottom: ${theme.space.md};

  input {
    ${inputStyle};
    ${ctFocus};
  }
`;

export const Dropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: ${c.white};
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.md};
`;

export const Option = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: ${c.white};
  border: none;
  border-bottom: 1px solid ${c.border};
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  color: ${c.subColor};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${c.basicColor};
  }

  ${focusRing};
  &:focus-visible {
    outline-offset: -2px;
  }
`;

export const EmptyOption = styled.div<WithTheme>`
  padding: ${theme.space.md};
  text-align: center;
  font-size: 14px;
  color: ${c.navColor};
`;

export const PartEditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
`;

export const PartEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};

  select {
    ${inputStyle};
    ${ctFocus};
    flex: 1;
    min-width: 0;
    width: auto;
  }
`;

// 참가자 닉네임 칩
export const PartNickEdit = styled.span<WithTheme>`
  ${badgeStyle('primary')};
  flex: 0 0 110px;
  justify-content: flex-start;
  min-height: 36px;
  padding: 0 12px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${c.basicColor};
  color: ${c.subColor};

  @media ${theme.device.mobile} {
    flex-basis: 96px;
  }
`;

export const MeTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${CT_PURPLE};
`;

export const RemovePart = styled.button`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid ${c.basicColor};
  border-radius: ${theme.radius.md};
  background: ${c.basicColor};
  color: ${c.navColor};
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${c.basicColor};
    color: ${c.danger};
  }

  ${focusRing};
`;

export const Hint = styled.div<WithTheme>`
  margin-top: 6px;
  font-size: 13px;
  color: ${c.navColor};
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.sm};

  > label {
    font-size: 14px;
    font-weight: 700;
    color: ${c.subColor};
  }
`;

export const LoadButton = styled.button`
  ${buttonStyle('secondary', 'sm')};
  border-radius: ${theme.radius.pill};
  font-size: 13px;
  background: ${c.white};
  color: ${CT_PURPLE};
  border-color: ${CT_PURPLE};

  &:hover:not(:disabled) {
    background: ${CT_PURPLE_SOFT};
  }

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;

export const LoadPanel = styled.div<WithTheme>`
  ${cardStyle};
  border-color: ${c.lineColor};
  margin-bottom: ${theme.space.md};
  overflow: hidden;
`;

export const LoadPanelHead = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.space.sm} ${theme.space.sm} ${theme.space.sm} ${theme.space.lg};
  background: ${CT_ROW_HOVER};
  font-size: 14px;
  font-weight: 700;
  color: ${c.subColor};
`;

export const LoadClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${theme.radius.md};
  background: transparent;
  cursor: pointer;
  color: ${c.navColor};

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${c.surface};
  }

  ${focusRing};

  @media ${theme.device.mobile} {
    width: 44px;
    height: 44px;
  }
`;

export const LoadItem = styled.button<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  min-height: 44px;
  padding: ${theme.space.md} ${theme.space.lg};
  background: ${c.white};
  border: none;
  border-top: 1px solid ${c.border};
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${CT_ROW_HOVER};
  }

  ${focusRing};
  &:focus-visible {
    outline-offset: -2px;
  }
`;

export const LoadItemTop = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.sm};
  width: 100%;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: ${c.subColor};
  }

  span {
    font-size: 12px;
    color: ${c.navColor};
    white-space: nowrap;
  }
`;

export const LoadItemNicks = styled.div<WithTheme>`
  width: 100%;
  font-size: 12px;
  color: ${c.navColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LoadEmpty = styled.div<WithTheme>`
  padding: ${theme.space.lg};
  text-align: center;
  font-size: 14px;
  color: ${c.navColor};
`;

export const PickerWrap = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

export const PickerControl = styled.button.withConfig({ shouldForwardProp: p => p !== '$placeholder' })<{
  $placeholder: boolean;
} & WithTheme>`
  ${inputStyle};
  display: block;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $placeholder }) => ($placeholder ? c.textSubtle : c.subColor)};
  ${ctFocus};
  ${focusRing};

  &:disabled {
    background: ${c.surfaceAlt};
    border-color: ${c.border};
    color: ${c.textSubtle};
    cursor: not-allowed;
  }
`;

export const PickerDropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 30;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${c.white};
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.md};
  overflow: hidden;
`;

export const PickerSearch = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: none;
  border-bottom: 1px solid ${c.border};
  background: ${c.surface};
  color: ${c.textStrong};
  font-family: inherit;
  font-size: 15px;
  box-sizing: border-box;

  &::placeholder {
    color: ${c.textSubtle};
  }

  &:focus {
    outline: none;
    background: ${c.surfaceSunken};
  }

  @media ${theme.device.mobile} {
    font-size: 16px;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: ${theme.space.sm} 10px;
  border-bottom: 1px solid ${c.border};
`;

export const FilterChip = styled.button<{ $active: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: ${theme.radius.pill};
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? CT_PURPLE : c.borderStrong)};
  color: ${({ $active }) => ($active ? c.white : c.navColor)};
  background: ${({ $active }) => ($active ? CT_PURPLE : c.white)};
  ${focusRing};

  @media ${theme.device.mobile} {
    height: 36px;
  }
`;

export const PickerList = styled.div`
  max-height: 240px;
  overflow-y: auto;
`;

export const PickerOption = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: ${c.surface};
  border: none;
  border-bottom: 1px solid ${c.border};
  font-family: inherit;
  font-size: 14px;
  color: ${c.subColor};
  text-align: left;
  cursor: pointer;

  strong {
    font-size: 14px;
    color: ${c.subColor};
    font-weight: 600;
  }

  span {
    font-size: 12px;
    color: ${c.navColor};
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${c.basicColor};
  }

  ${focusRing};
  &:focus-visible {
    outline-offset: -2px;
  }
`;

export const PickerEmpty = styled.div<WithTheme>`
  padding: ${theme.space.md};
  text-align: center;
  font-size: 14px;
  color: ${c.navColor};
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.xl};

  > label {
    font-size: 14px;
    font-weight: 700;
    color: ${c.subColor};
  }

  input[type='date'],
  textarea {
    ${inputStyle};
    ${ctFocus};
  }

  textarea {
    resize: vertical;
    line-height: 1.5;
  }
`;
