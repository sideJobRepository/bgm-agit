import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

export const ModalWrapper = styled.div`
  padding: 24px;
  width: min(420px, calc(100vw - 40px));
`;

export const ModalTitle = styled.h3<WithTheme>`
  margin-bottom: 16px;
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.menuColor};
`;

export const ImageUploadWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 2px dashed #ccc;
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
`;

export const UploadLabel = styled.label<{ $empty: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ $empty }) => ($empty ? '#999' : '#ffffff')};
  background-color: ${({ $empty }) => ($empty ? 'transparent' : 'rgba(0, 0, 0, 0.4)')};
  opacity: ${({ $empty }) => ($empty ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;

  svg {
    width: 30px;
    height: 30px;
  }

  &:hover {
    opacity: 1;
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Row = styled.div`
  display: flex;
  gap: 10px;

  & > label {
    flex: 1;
    min-width: 0;
  }
`;

export const Field = styled.label<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;

  span {
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: ${({ theme }) => theme.weight.semiBold};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

export const Input = styled.input<WithTheme>`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};

  &:focus {
    border-color: ${({ theme }) => theme.colors.subColor};
    outline: none;
  }

  /* iOS Safari 자동 줌 방지 */
  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
  }
`;

export const Select = styled.select<WithTheme>`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  cursor: pointer;
  background: white;

  &:focus {
    border-color: ${({ theme }) => theme.colors.subColor};
    outline: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  margin-top: 6px;
`;

export const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
