import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { theme } from '../../styles/theme.ts';
import { buttonStyle, inputStyle, type ButtonVariant } from '../../styles/mixins.ts';

const c = theme.colors;

// 흰 카드(모서리·그림자)는 Modal 의 ModalBox 가 맡는다
export const ModalWrapper = styled.div`
  padding: ${theme.space.xl};
  width: min(440px, calc(100vw - 32px));
  background: ${c.surface};
  border-radius: ${theme.radius.lg};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const ModalTitle = styled.h3<WithTheme>`
  margin: 0 0 ${theme.space.lg};
  color: ${c.menuColor};
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const ImageUploadWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px dashed ${c.borderStrong};
  border-radius: ${theme.radius.md};
  background: ${c.surfaceSunken};
  margin-bottom: ${theme.space.lg};
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
  color: ${({ $empty }) => ($empty ? c.textMuted : c.onPrimary)};
  /* textStrong(#16181D) 40% 덮개 */
  background-color: ${({ $empty }) => ($empty ? 'transparent' : 'rgba(22, 24, 29, 0.4)')};
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
  gap: ${theme.space.md};

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
    color: ${c.subColor};
    font-size: 13px;
    font-weight: 600;
  }
`;

export const Input = styled.input<WithTheme>`
  ${inputStyle};
`;

export const Select = styled.select<WithTheme>`
  ${inputStyle};
  cursor: pointer;
`;

export const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  justify-content: flex-end;
  margin-top: ${theme.space.sm};
  padding-top: ${theme.space.lg};
  border-top: 1px solid ${c.border};

  @media ${theme.device.mobile} {
    button {
      flex: 1;
    }
  }
`;

// 예전 색: 저장 = 초록, 삭제 = 빨강, 닫기 = 갈색. 모두 채움 버튼에 흰 글씨
const LEGACY_BUTTON_COLORS: Partial<Record<ButtonVariant, string>> = {
  primary: c.greenColor,
  danger: c.redColor,
  secondary: c.noticeColor,
};

// $variant 로 저장(primary) · 삭제(danger) · 닫기(secondary)를 나눈다
export const Button = styled.button<WithTheme & { color?: string; $variant?: ButtonVariant }>`
  ${({ $variant }) => buttonStyle($variant ?? 'primary', 'md')};
  background: ${({ $variant }) => LEGACY_BUTTON_COLORS[$variant ?? 'primary']};
  border-color: ${({ $variant }) => LEGACY_BUTTON_COLORS[$variant ?? 'primary']};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${({ $variant }) => LEGACY_BUTTON_COLORS[$variant ?? 'primary']};
    border-color: ${({ $variant }) => LEGACY_BUTTON_COLORS[$variant ?? 'primary']};
    color: ${c.white};
    opacity: 0.85;
  }
`;
