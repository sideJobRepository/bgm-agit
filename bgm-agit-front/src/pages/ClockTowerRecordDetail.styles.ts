import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Box = styled.div`
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export const Button = styled.button.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string } & WithTheme>`
  padding: 8px 16px;
  background: ${({ color }) => color};
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.medium};
  &:hover {
    opacity: 0.9;
  }
`;

export const DetailHead = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

export const Thumb = styled.div`
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1efe9;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
`;

export const DetailTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const DetailMeta = styled.div<WithTheme>`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const BigResult = styled.span<{ $evil: boolean }>`
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  border-radius: 14px;
  font-weight: 700;
  color: #fff;
  background: ${({ $evil }) => ($evil ? '#6A1B9A' : '#1565C0')};
`;

export const DraftBadge = styled.span`
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  border-radius: 14px;
  font-weight: 700;
  color: #fff;
  background: #B5651D;
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: 22px 0 10px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const PartViewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PartViewItem = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  padding: 10px 12px;
`;

export const PartLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const PartNick = styled.span<WithTheme>`
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const PartChar = styled.span<WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const TypeTag = styled.span.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string }>`
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
  background: ${({ color }) => color};
`;

export const WinTag = styled.span<{ $win: boolean }>`
  flex: 0 0 auto;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: ${({ $win }) => ($win ? '#2E7D32' : '#9E9E9E')};
`;

export const Memo = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};
  line-height: 1.6;
  white-space: pre-line;
`;

export const FormTitle = styled.h2<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
  margin-bottom: 18px;
`;

export const ResultToggle = styled.div`
  display: flex;
  gap: 8px;
`;

export const ToggleBtn = styled.button.withConfig({
  shouldForwardProp: p => p !== '$active' && p !== '$color',
})<{ $active: boolean; $color: string }>`
  flex: 1;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $active, $color }) => ($active ? '#fff' : $color)};
  background: ${({ $active, $color }) => ($active ? $color : '#fff')};
`;

export const SearchBox = styled.div<WithTheme>`
  position: relative;
  margin-bottom: 10px;

  input {
    width: 100%;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #4a2c82;
    }
  }
`;

export const Dropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 20;
  top: 46px;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
`;

export const Option = styled.button<WithTheme>`
  display: flex;
  width: 100%;
  padding: 11px 12px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  &:hover {
    background: #f1efe9;
  }
`;

export const EmptyOption = styled.div<WithTheme>`
  padding: 12px;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const PartEditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PartEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  select {
    flex: 1;
    min-width: 0;
    height: 42px;
    padding: 0 8px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
  }
`;

export const PartNickEdit = styled.span<WithTheme>`
  flex: 0 0 110px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.subColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MeTag = styled.span`
  font-size: 11px;
  color: #4a2c82;
`;

export const RemovePart = styled.button`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 6px;
  background: #f1efe9;
  color: #888;
  cursor: pointer;
  svg {
    font-size: 18px;
  }
`;

export const Hint = styled.div<WithTheme>`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const LoadButton = styled.button`
  padding: 5px 12px;
  background: #fff;
  color: #4a2c82;
  border: 1px solid #4a2c82;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #f3eefc;
  }
`;

export const LoadPanel = styled.div<WithTheme>`
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
`;

export const LoadPanelHead = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f7f4ef;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.subColor};
`;

export const LoadClose = styled.button`
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #888;
  svg {
    font-size: 18px;
  }
`;

export const LoadItem = styled.button<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 10px 12px;
  background: #fff;
  border: none;
  border-top: 1px solid #f3f3f3;
  text-align: left;
  cursor: pointer;
  &:hover {
    background: #f7f4ef;
  }
`;

export const LoadItemTop = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  strong {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.subColor};
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.navColor};
    white-space: nowrap;
  }
`;

export const LoadItemNicks = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LoadEmpty = styled.div<WithTheme>`
  padding: 16px 12px;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const PickerWrap = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

export const PickerControl = styled.button.withConfig({ shouldForwardProp: p => p !== '$placeholder' })<{
  $placeholder: boolean;
} & WithTheme>`
  width: 100%;
  height: 42px;
  padding: 0 12px;
  text-align: left;
  background: #fff;
  border: 1px solid #c4c4c4;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $placeholder }) => ($placeholder ? '#9b9b9b' : '#333')};

  &:disabled {
    background: #f3f3f3;
    cursor: not-allowed;
    color: #b5b5b5;
  }
`;

export const PickerDropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 30;
  top: 46px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

export const PickerSearch = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  box-sizing: border-box;
  &:focus {
    outline: none;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid #f3f3f3;
`;

export const FilterChip = styled.button<{ $active: boolean } & WithTheme>`
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? '#4a2c82' : '#d8d8d8')};
  color: ${({ $active }) => ($active ? '#fff' : '#666')};
  background: ${({ $active }) => ($active ? '#4a2c82' : '#fff')};
`;

export const PickerList = styled.div`
  max-height: 240px;
  overflow-y: auto;
`;

export const PickerOption = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f3f3f3;
  text-align: left;
  cursor: pointer;

  strong {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
    font-weight: 600;
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.navColor};
  }
  &:hover {
    background: #f1efe9;
  }
`;

export const PickerEmpty = styled.div<WithTheme>`
  padding: 12px;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;

  > label {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.subColor};
  }
  input[type='date'],
  textarea {
    padding: 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px;
    &:focus {
      outline: none;
      border-color: #4a2c82;
    }
  }
  input[type='date'] {
    height: 42px;
  }
  textarea {
    resize: vertical;
    font-family: inherit;
  }
`;
